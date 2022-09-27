import { Network } from './types.js'

const networks: Record<string, Network> = {
        "bsc": {
                rpc: new URL("https://bsc-dataseed1.binance.org/"),
                chainId: 56
        },
        "eth": {
                rpc: new URL("https://www.ethercluster.com/etc"),
                chainId: 1
        }
}

export default networks
