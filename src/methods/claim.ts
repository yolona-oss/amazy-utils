import { getAccountData } from './fetcher.js'
import log from './../logger.js'
import { Account, ClaimOptions } from './../types.js'
import { web3, bsc_config } from './../web3-configured.js'
import * as fs from 'fs'
import Path from 'path'

const amazy_claim_contract_address = web3.utils.toChecksumAddress("0xf2dce07c1ae5868b7f4b91e7bf88356605646b90")
const claim_value = "2676240000000000" 
const abi = JSON.parse(
        fs.readFileSync(
                Path.join("abi", amazy_claim_contract_address+".json")
        ).toString()
)

export async function claim(account: Account, options?: Partial<ClaimOptions>) {
        const gasPrice = await web3.eth.getGasPrice()
        const gas = 300000
        const acc_data = await getAccountData(account)
        web3.eth.accounts.wallet.add(account.privateKey)
        options

        let contract = new web3.eth.Contract(abi, amazy_claim_contract_address, {
                from: account.publicKey,
                gasPrice,
                gas
        })

        contract.options.gas = gas
        contract.options.gasPrice = gasPrice

        const order_data = await contract.methods.request("claim", 0, 0, acc_data.tracking.earnedToClaim.AMT.toString()).encodeABI({
                from: account.publicKey
        })

        const tx = {
                from: account.publicKey,
                to: amazy_claim_contract_address,
                value: claim_value,
                nonce: await web3.eth.getTransactionCount(account.publicKey),
                gas,
                gasPrice,
                chainId: bsc_config.chainId,
                data: order_data
        }

        let tx_res
        try {
                let signed_tx = await web3.eth.accounts.signTransaction(tx, account.privateKey)
                if (signed_tx.rawTransaction) {
                        tx_res = await web3.eth.sendSignedTransaction(signed_tx.rawTransaction)
                } else {
                        throw "No raw transaction after signing"
                }
        } catch (e) {
                log.error(e)
                throw e
        }
        return tx_res
}
