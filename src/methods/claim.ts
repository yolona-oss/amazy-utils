import { getAccountData } from './fetcher.js'
import log from './../logger.js'
import { Account, ClaimOptions } from './../types.js'
import { web3, network_config } from './../web3-configured.js'
import * as fs from 'fs'
import cfg from './../config.js'
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
        let gas: number
        if (Number(cfg.transactionMinting.gasLimit)) {
                gas = Number(cfg.transactionMinting.gasLimit)
        } else {
                gas = 0
        }
        const acc_data = await getAccountData(account)
        web3.eth.accounts.wallet.add(account.privateKey)

        let contract = new web3.eth.Contract(abi, amazy_claim_contract_address, {
                from: account.publicKey,
        })

        if (options && options.minAMT && acc_data.tracking.earnedToClaim.AMT < options.minAMT) {
                throw "Not anought AMT to claim: " + acc_data.tracking.earnedToClaim.AMT
        }

        const order_data = await contract.methods.request("claim", 0, 0, acc_data.tracking.earnedToClaim.AMT.toString()).encodeABI({
                from: account.publicKey
        })

        let tx = {
                from: account.publicKey,
                to: amazy_claim_contract_address,
                value: claim_value,
                nonce: await web3.eth.getTransactionCount(account.publicKey),
                chainId: network_config.chainId,
                data: order_data,
                gasPrice,
                gas: 0
        }

        const estGas = await web3.eth.estimateGas(tx)
        
        if (gas < estGas) {
                tx.gas = estGas
                gas = estGas
        } else {
                tx.gas = gas
        }

        if (
                web3.utils.toBN(await web3.eth.getBalance(account.publicKey)).lt(
                        web3.utils.toBN(claim_value).add(
                                web3.utils.toBN(gasPrice).mul(
                                        web3.utils.toBN(gas)
                                )
                        )
                )
        ) {
                throw "Not anought Native tokens to mint transaction"
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
                throw e
        }
        console.log(tx_res)
        return tx_res
}
