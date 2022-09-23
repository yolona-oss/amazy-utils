import { Account } from './types.js'
import { load } from './loader.js'
import { getAccountData } from './fetcher.js'
import { claim } from './claim.js'
import cfg from './config.js'
import { out_format } from './formater.js'
import log from './logger.js'
import { writeFileSync, appendFileSync } from 'fs'
import progress from 'progress'
import { reverseFileLines } from './utils.js'

interface WorkerResult {
        worker: Worker
        res: string
}

abstract class Worker {
        constructor(protected account: Account) { } 
        abstract on_done(worker_res: string): void
        abstract on_all_done(): void
        
        abstract exec(): Promise<WorkerResult>
}

class WorkerFetch extends Worker {
        constructor(account: Account) { super(account) }

        on_done(worker_res: string) {
                appendFileSync(cfg.outputFile, worker_res + "\n")
        }

        on_all_done() {
                reverseFileLines(cfg.outputFile)
        }

        public async exec() {
                const data = await getAccountData(this.account)
                const ret = out_format(data, this.account, cfg.outputFormat)
                return {
                        worker: this,
                        res: ret
                }
        }
}

class WorkerClaim extends Worker {
        constructor(account: Account) { super(account) } 

        on_done(_: string) {
        }

        on_all_done() {

        }

        public async exec() {
                await claim(this.account)

                return {
                        worker: this,
                        res: ""
                }
        }
}

abstract class Builder {
        constructor() {}

        abstract produce(account: Account): Worker
}

class Builder_fetch extends Builder {
        constructor() {super()}

        produce(account: Account) {
                return new WorkerFetch(account)
        }
}

class Builder_claim extends Builder {
        constructor() {super()}

        produce(account: Account) {
                return new WorkerClaim(account)
        }
}

class App {
        constructor() {
                const mode = process.argv[2]
                if (mode == "fetch") {
                        this.builder = new Builder_fetch()
                } else if (mode == "claim") {
                        this.builder = new Builder_claim()
                } else {
                        throw `No execution mode passed or invalide mode: "${mode}"`
                }
        }

        private active = 0
        // @ts-ignore
        private bar: progress

        // @ts-ignore
        private accounts: Accounts[]

        private builder: Builder

        async init(): Promise<App> {
                log.echo("Initializing")
                writeFileSync(cfg.outputFile, "")
                this.accounts = load(cfg.path.storage)
                this.bar = new progress("Progress [:bar] :current/:total :rate/aps :etas", {
                        total: this.accounts.length,
                        width: process.stdout.columns,
                        complete: "#"
                })
                return this
        }

        private onWorkerDone(ret: WorkerResult) {
                ret.worker.on_done(ret.res)
                this.active--;
                if (this.active < cfg.concurrency) {
                        this.bar.tick()
                        let acc = this.accounts[this.accounts.length - 1]
                        // end
                        if (!acc) {
                                ret.worker.on_all_done()
                                return
                        }
                        this.accounts.pop()
                        this.active++;
                        this.builder.produce(acc).exec()
                        .then(v => this.onWorkerDone(v))
                        .catch(e => {
                                log.error("Account:", acc.publicKey, e)
                        })
                }
        }

        async run() {
                log.echo("Processing with concurrency:", cfg.concurrency)
                for (let i = 0; i < cfg.concurrency && i < this.accounts.length; i++) {
                        let acc = this.accounts[this.accounts.length - 1]
                        this.accounts.pop()
                        this.builder.produce(acc).exec()
                        .then(v => this.onWorkerDone(v))
                        .catch(e => {
                                log.error("Account:", acc.publicKey, e)
                        })
                }
        }
}

new App().init().then(a => a.run())
