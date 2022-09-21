import eol from 'eol'
import {
        readFileSync,
        readdirSync,
} from 'fs'
import Path from 'path'
import { Account } from './types.js'
import log from './logger.js'

import _web3 from 'web3'

// stupid
function isPrivateKey(str: string) {
        if (str.length == 64) {
                return true
        }
        return false
}

export function load(path: string): Account[] {
        log.echo("Line-by-line parser active")
        log.echo("Loading accounts")
        let raw_data = ""
        for (const file of readdirSync(path)) {
                log.echo("Reading file:", file)
                let raw = eol.lf(readFileSync(Path.join(path, file)).toString().trim())
                if (raw.length > 0 && raw[raw.length-1] != '\n') {
                        raw = raw.concat('\n')
                }
                log.echo("Found", raw.split('\n').length, "lines")
                raw_data = raw_data.concat(raw)
        }

        log.echo("Total lines:", raw_data.split("\n").length)

        let ret: Account[] = new Array()
        for (const line of raw_data.split("\n")) {
                let account = {
                        publicKey: "",
                        privateKey: ""
                }
                let words = line.split(" ")
                if (words.length < 2) {
                        words = line.split('\t')
                        if (words.length < 2) {
                                continue
                        }
                }

                if (_web3.utils.isAddress(words[0])) {
                        account.publicKey = words[0]
                        if (isPrivateKey(words[1])) {
                                account.privateKey = words[1]
                                ret.push(account)
                        }
                }
        }
        log.echo("Imported", ret.length, "accounts")
        return ret
}
