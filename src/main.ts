import { Account } from './types.js'
import { load } from './loader.js'
import { getAccountData, claim, ERC_20_TransferWizard } from './methods/index.js'
import cfg from './config.js'
import { out_format } from './formater.js'
import log from './logger.js'
import { writeFileSync, appendFileSync } from 'fs'
import progress from 'progress'
import { reverseFileLines } from './utils.js'
import { Modes } from './constants.js'
//import * as fs from "fs"

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

abstract class Builder {
        constructor() {}

        abstract init(): Promise<void>

        abstract produce(account: Account): Worker
}

class WorkerFetch extends Worker {
        constructor(account: Account) { super(account) }

        on_done(worker_res: string) {
                appendFileSync(cfg.utils.fetchInfo.outputFile, worker_res + "\n")
        }

        on_all_done() {
                // let lines = fs.readFileSync(cfg.utils.fetchInfo.outputFile).toString().split("\n")
                // let writeOrder = load(cfg.path.storage)
                // for (const line of lines) {
                //         const pubKey = 
                // }
                reverseFileLines(cfg.utils.fetchInfo.outputFile)
        }

        public async exec() {
                const data = await getAccountData(this.account)
                const ret = /*this.account.publicKey + ":" + */out_format(data, this.account, cfg.utils.fetchInfo.format)
                return {
                        worker: this,
                        res: ret
                }
        }
}

class WorkerClaim extends Worker {
        constructor(account: Account) { super(account) } 
        on_done(_: string) { }
        on_all_done() { }

        public async exec() {
                await claim(this.account, cfg.utils.claim)

                return {
                        worker: this,
                        res: ""
                }
        }
}

class WorkerTransfer extends Worker {
        constructor(account: Account, w: ERC_20_TransferWizard) { super(account), this.wizard = w } 
        on_done(_: string) { }
        on_all_done() { }

        private wizard

        private async in() {
                this.wizard.transfer(this.account, cfg.motherShip.publicKey, cfg.utils.transfer.amount)
        }

        private async out() {
                this.wizard.transfer(cfg.motherShip, this.account.publicKey, cfg.utils.transfer.amount)
        }

        public async exec() {
                if (cfg.utils.transfer.direction === "IN") {
                        await this.in()
                } else if (cfg.utils.transfer.direction === "OUT") {
                        await this.out()
                } else {
                        throw "Unknown transfer direction: " + cfg.utils.transfer.direction
                }

                return {
                        worker: this,
                        res: ""
                }
        }
}

class Builder_fetch extends Builder {
        constructor() {super()}

        async init() {}

        produce(account: Account) {
                return new WorkerFetch(account)
        }
}

class Builder_claim extends Builder {
        constructor() {super()}

        async init() {}

        produce(account: Account) {
                return new WorkerClaim(account)
        }
}

class Builder_transfer extends Builder {
        constructor() {
                super()
        }

        async init() {
                await this.wizard.init()
        }

        private wizard = new ERC_20_TransferWizard(cfg.utils.transfer.contract)

        produce(account: Account) {
                return new WorkerTransfer(account, this.wizard)
        }
}

class App {
        private active = 0
        // @ts-ignore
        private bar: progress
        private accounts: Account[]
        private builder: Builder

        constructor() {
                this.accounts = new Array()
                const mode = process.argv[2]
                switch (mode) {
                        case Modes.fetch:
                                writeFileSync(cfg.utils.fetchInfo.outputFile, "")
                                this.builder = new Builder_fetch()
                                break
                        case Modes.claim:
                                this.builder = new Builder_claim()
                                break
                        case Modes.transfer:
                                this.builder = new Builder_transfer()
                                break
                        default:
                                throw `No execution mode passed or invalide mode: "${mode}"`
                }
                globalThis.mode = mode
        }

        async init(): Promise<App> {
                log.echo("Initializing")
                await this.builder.init()
                this.accounts = load(cfg.path.storage)
                this.bar = new progress("Progress [:bar] :current/:total :rate/aps :etas", {
                        total: this.accounts.length,
                        width: process.stdout.columns,
                        complete: "#"
                })
                return this
        }

        private onWorkerDone(ret?: WorkerResult) {
                ret?.worker.on_done(ret?.res)
                this.active--;
                if (this.active < cfg.concurrency) {
                        this.bar.tick()
                        let acc = this.accounts.pop()
                        // end
                        if (!acc) {
                                ret?.worker.on_all_done()
                                log.echo("Done")
                                return
                        }
                        this.active++;
                        this.setupWorker(acc)
                }
        }

        private setupWorker(acc: Account) {
                this.builder.produce(acc).exec()
                .then(v => this.onWorkerDone(v))
                .catch(e => {
                        log.error("Account:", acc.publicKey, e)
                        this.onWorkerDone()
                })
        }

        async run() {
                log.echo("Processing with concurrency:", cfg.concurrency)
                for (let i = 0; i < cfg.concurrency && i < this.accounts.length; i++) {
                        // @ts-ignore
                        this.setupWorker(this.accounts.pop())
                }
        }
}

new App().init().then(a => a.run())
