import { Account } from './types.js'
import { load } from './loader.js'
import { getAccountData } from './fetcher.js'
import cfg from './config.js'
import { out_format } from './formater.js'
import log from './logger.js'
import { writeFileSync, appendFileSync } from 'fs'
import progress from 'progress'

// wary safe, nonono tooooo safe
class Worker {
        constructor(private account: Account) { }

        public async exec() {
                const data = await getAccountData(this.account)
                const ret = out_format(data, this.account, cfg.outputFormat)
                return ret
        }
}

class App {
        constructor() {}

        private active = 0
        // @ts-ignore
        private bar: progress

        // @ts-ignore
        private accounts: Accounts[]

        async init(): Promise<App> {
                log.echo("Initializing")
                writeFileSync(cfg.outputFile, "")
                this.accounts = load(cfg.path.storage)
                this.bar = new progress("Progress [:bar] [:current/:total] eta: :eta", {
                        total: this.accounts.length,
                        width: process.stdout.columns
                })
                return this
        }

        private onWorkerDone(res: string) {
                appendFileSync(cfg.outputFile, res + "\n")
                this.active--;
                if (this.active < cfg.concurrency) {
                        this.bar.tick()
                        let acc = this.accounts[this.accounts.length - 1]
                        if (!acc) { return }
                        this.accounts.pop()
                        this.active++;
                        new Worker(acc).exec()
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
                        new Worker(acc).exec()
                        .then(v => this.onWorkerDone(v))
                        .catch(e => {
                                log.error("Account:", acc.publicKey, e)
                        })
                }
        }
}

new App().init().then(a => a.run())
