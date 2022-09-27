import { assert } from 'superstruct'
import { realpathSync, readFileSync } from 'fs'
import * as fs from 'fs'
import log from './logger.js'
import { configSign, ConfigType } from './types.js'
import { jsonStrip } from './utils.js'

const _cfg_path = './config.json'
// skip realpathSync error for first run
try {
        log.echo("Config path:", realpathSync(_cfg_path))
} catch (e) { }

if (!fs.existsSync(_cfg_path)) {
        log.echo("Creating config with default params")

        const raw_config_data = `{
        "concurrency": 1,
        "bscscanAPIKey": "< bscscan.com API-KEY >",
        "motherShip": { /* wallet whitch included in token transfering */
                "publicKey":  "0xasdf",
                "privateKey": "asdf"
        },
        "transactionMinting": { /* sending transaction fee config */
                "maxGasPrice": "5",
                "gasLimit":    "100000"
        },
        "utils": {
                "claim": {
                        "minAMT": 10
                },
                "transfer": {
                        "direction": "IN",  /* OUT cause sending from motherShip, IN - to motherShip */
                        "contract":  "0xf625069dce62dF95b4910f83446954B871F0Fc4f", /* For all ERC-20 tokens. if unset transfers will be performed with native token */
                        "chain":     "bsc", /* Chain name acronim: "bsc", "eth"... default: "bsc" */
                        "amount":    "all", /* Value or "all" for transfer all, zero cause fall throw */
                        "amountUnits": "ether" /* ether is default number view. check https://academy.binance.com/en/glossary/wei ; https://eth-converter.com/ */
                },
                "fetchInfo": {
                        "unitsLocale": "ru-RU", /* Numbers output format. e.g. ru-RU, en-EN */
                        "format": "address, ToClaimAMT", /* avalible fields: "address", "azy", "amt", "email", "ToClaimAMT", "ToClaimAZY". parser works as replacer */
                        "outputFile": "./output.txt"
                }
        },
        "path": {
                "storage": "./storage", /* All files will be parsed */
                "log":     "./.log"
        }
}`
        fs.writeFileSync(_cfg_path, raw_config_data)
}

export function Config(): ConfigType {
        log.echo("Reading log file")
        let config
        try {
                config = JSON.parse(
                        jsonStrip(readFileSync(_cfg_path).toString())
                );
        } catch(e) {
                throw new Error("Config parse error: " + e);
        }

        log.echo("Validating")
        assert(config, configSign);

        return config;
}

let cfg = Config()

log.echo("Checking needed files existence")
for (const path of Object.values(cfg.path)) {
        if (!fs.existsSync(path)) {
                fs.mkdirSync(path)
        }
}

export default cfg
