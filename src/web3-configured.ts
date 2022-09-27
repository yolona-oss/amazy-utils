import _web3 from 'web3'
import cfg from './config.js'
import networks from './networks.js'
import log from './logger.js'
import { Modes } from './constants.js'

const net = globalThis.mode === Modes.transfer ? cfg.utils.transfer.chain ?? "eth" : "bsc"
export const network_config = networks[net]
log.echo("Connecting to", net, "chain")
export const web3 = new _web3(
        new _web3.providers.HttpProvider(network_config.rpc.toString())
)

log.echo("Current", net, "chain gas price:", await web3.eth.getGasPrice())
