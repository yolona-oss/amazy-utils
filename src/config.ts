import { Infer, assert, object, number, string } from 'superstruct'
import { realpathSync, readFileSync } from 'fs'
import * as fs from 'fs'
import log from './logger.js'

const _cfg_path = './config.json'
// skip realpathSync error for first run
try {
        log.echo("Config path:", realpathSync(_cfg_path))
} catch (e) {

}

const keyPair = object({publicKey: string(), privateKey: string()})

const configSign = object({
        concurrency: number(), // TODO not implemented
        outputFormat: string(), // TODO no check, avalible fields: "address", "azy", "amt", "email". parser works as replacer
        outputFile: string(),
        motherShip: keyPair,
        path: object({
                storage: string(), // All files will be parsed
                log: string(),
        })
})

if (!fs.existsSync(_cfg_path)) {
        log.echo("Creating config with default params")
        let default_cfg: ConfigType = {
                concurrency: 1,
                outputFormat: "address, azy",
                outputFile: "./output.txt",
                motherShip: {
                        publicKey: "",
                        privateKey: ""
                },
                path: {
                        storage: './storage',
                        log: './.log',
                }
        }
        fs.writeFileSync(_cfg_path, JSON.stringify(default_cfg, null, " ".repeat(4)))
}

type ConfigType = Infer<typeof configSign>;

export function Config(): ConfigType {
        log.echo("Reading log file")
        let config
        try {
                config = JSON.parse(readFileSync(_cfg_path).toString());
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
