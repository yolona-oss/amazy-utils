// import * as fs from 'fs'
// import { web3 } from './../../web3-configured.js'
// import { keyPair, Address } from './../../types.js'
// import Path from 'path'
//
// const amazy_amt_contract_address = web3.utils.toChecksumAddress("0xf625069dce62df95b4910f83446954b871f0fc4f")
// const abi = JSON.parse(
//         fs.readFileSync(
//                 Path.join("abi", amazy_amt_contract_address+".json")
//         ).toString()
// )
//
// export async function transferAMT(src: keyPair, dst: Address) {
//         if (src.publicKey === dst) {
//                 throw "Cannot transfer to same address"
//         }
//
//         const gasPrice = await web3.eth.getGasPrice()
//         const gas = 300000
//         web3.eth.accounts.wallet.add(src.privateKey)
//         let contract = new web3.eth.Contract(abi, amazy_amt_contract_address, {
//                 from: src.publicKey,
//                 gasPrice,
//                 gas
//         })
//         dst
//
//         contract.options.gas = gas
//         contract.options.gasPrice = gasPrice
//
//         const amount = await contract.methods.balanceOf(src.publicKey).call()
//
//         if (amount <= 0) {
//                 throw "Nothing to send. Balance lt zero"
//         }
//
//         await contract.methods.transfer(dst, amount).send({
//                 from: src.publicKey
//         })
// }
