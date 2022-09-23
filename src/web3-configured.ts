import _web3 from 'web3'
import log from './logger.js'

export const bsc_config = {
        rpc: "https://bsc-dataseed1.binance.org/",
        chainId: 56
}
log.echo("Connecting to bsc chain")
export const web3 = new _web3(
        new _web3.providers.HttpProvider(bsc_config.rpc)
)

log.echo("bsc chain gas price:", await web3.eth.getGasPrice())
