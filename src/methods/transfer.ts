import { web3, network_config } from './../web3-configured.js'
import { keyPair, Address } from './../types.js'
import cfg from './../config.js'
import chainScan from '@jpmonette/bscscan'
import log from './../logger.js'

const bsc_scan_key = cfg.bscscanAPIKey
const scan = new chainScan.BscScan({
        apikey: bsc_scan_key
})

export class ERC_20_TransferWizard {
        private contract
        private token_contract_address

        public transfer: (src: keyPair, dst: Address, amount: string) => Promise<boolean>

        constructor(contract_address?: string) {
                if (contract_address) {
                        this.token_contract_address = web3.utils.toChecksumAddress(contract_address)
                        // just type setting
                        this.contract = new web3.eth.Contract([], this.token_contract_address)
                }
                this.transfer = this.native_token_transfer
        }

        async init() {
                if (this.token_contract_address) {
                        const abi = JSON.parse(
                                await scan.contracts.getAbi({ address: this.token_contract_address })
                        )
                        this.contract = new web3.eth.Contract(abi, this.token_contract_address)
                        this.transfer = this.erc_20_transfer
                } else {
                        this.transfer = this.native_token_transfer
                }
        }

        private async checkTransferOpt(src: keyPair, dst: Address, amount: string) {
                if (src.publicKey === dst) {
                        throw "Cannot transfer to same address"
                }

                if (amount.toLowerCase() != "all" && web3.utils.toBN(amount).lte(web3.utils.toBN(0))) {
                        throw "Nothing to send. Amount lte zero"
                }
        }

        private async native_token_transfer(src: keyPair, dst: Address, amount: string) {
                await this.checkTransferOpt(src, dst, amount)
                web3.eth.accounts.wallet.add(src.privateKey)

                const gasPrice = await web3.eth.getGasPrice()
                let gas: number
                if (Number(cfg.transactionMinting.gasLimit)) {
                        gas = Number(cfg.transactionMinting.gasLimit)
                } else {
                        gas = 0
                }

                if (amount == "all") {
                        amount = await web3.eth.getBalance(src.publicKey)
                } else {
                        amount = web3.utils.toWei(amount, "ether")
                }

                const tx = {
                        to: dst,
                        from: src.publicKey,
                        nonce: await web3.eth.getTransactionCount(src.publicKey),
                        gas: 0,
                        gasPrice,
                        value: amount,
                        chainId: network_config.chainId,
                        data: "0x"
                }

                const estGas = await web3.eth.estimateGas(tx)

                if (gas < estGas) {
                        tx.gas = estGas
                        gas = estGas
                } else {
                        tx.gas = gas
                }

                if (
                        web3.utils.toBN(await web3.eth.getBalance(src.publicKey)).lt(
                                web3.utils.toBN(gasPrice).mul(
                                        web3.utils.toBN(gas)
                                )
                        )
                ) {
                        throw "Not anought Native tokens to mint transaction"
                }

                let tx_res
                try {
                        let signed_tx = await web3.eth.accounts.signTransaction(tx, src.privateKey)
                        if (signed_tx.rawTransaction) {
                                tx_res = await web3.eth.sendSignedTransaction(signed_tx.rawTransaction)
                        } else {
                                throw "No raw transaction after signing"
                        }
                } catch (e) {
                        throw e
                }
                return tx_res.status
        }

        private async erc_20_transfer(src: keyPair, dst: Address, amount: string) {
                if (!this.contract) {
                        throw "Contract not initialized"
                }

                await this.checkTransferOpt(src, dst, amount)

                if (amount == "all") {
                        amount = await web3.eth.getBalance(src.publicKey)
                } else {
                        amount = web3.utils.toWei(amount, "ether")
                }

                const gasPrice = await web3.eth.getGasPrice()
                let gas: number
                if (Number(cfg.transactionMinting.gasLimit)) {
                        gas = Number(cfg.transactionMinting.gasLimit)
                } else {
                        gas = 0
                }

                web3.eth.accounts.wallet.add(src.privateKey)

                const balance = await this.contract.methods.balanceOf(src.publicKey).call()
                if (balance <= 0) {
                        throw "Nothing to send. Balance lte zero"
                }

                const tx_data = await this.contract.methods.transfer(dst, amount).encodeABI({
                        from: src.publicKey,
                })

                let tx = {
                        from: src.publicKey,
                        to: this.token_contract_address,
                        nonce: await web3.eth.getTransactionCount(src.publicKey),
                        chainId: network_config.chainId,
                        data: tx_data,
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

                let tx_res
                try {
                        let signed_tx = await web3.eth.accounts.signTransaction(tx, src.privateKey)
                        if (signed_tx.rawTransaction) {
                                tx_res = await web3.eth.sendSignedTransaction(signed_tx.rawTransaction)
                        } else {
                                throw "No raw transaction after signing"
                        }
                } catch (e) {
                        throw e
                }

                return tx_res.status
        }
}

