import { keyPair, AZYProfileData } from './types.js'

const assign_map = new Map([
        [
                "address", (_: AZYProfileData, wallet: keyPair): string => {
                        // let ret: string[] = []
                        // Object.keys(data.player.wallets).forEach(v => {
                        //         ret.push(String(v))
                        // })
                        // return ret
                        return wallet.publicKey
                },
        ],
        [
                "email", (data: AZYProfileData): string => {
                        return data.player.email
                }
        ],
        [
                "azy", (data: AZYProfileData, wallet: keyPair): string => {
                        return String(data.player.wallets[wallet.publicKey].AZY)
                }
        ],
        [
                "amt", (data: AZYProfileData, wallet: keyPair): string => {
                        return String(data.player.wallets[wallet.publicKey].AMT)
                }
        ]
])

export function out_format(data: AZYProfileData, wallet: keyPair, format: string): string {
        for (const [ search, fn ] of assign_map) {
                format = format.replaceAll(search, fn(data, wallet))
        }

        return format
}


        // let max = 0
        // for (const [ search, _ ] of assign_map) {
        //         let cur = map.get(search)!.length
        //         if (cur > max) {
        //                 max = cur
        //         }
        // }
        //
        // let ret = new Array<string>()
        //
        // // let signCount = 0
        // //
        // // for (const sign of assign_map.keys()) {
        // //         if (format.indexOf(sign) >= 0) {
        // //                 signCount++
        // //         }
        // // }
        //
        // for (let i = 0; i < max; i++) {
        //         ret.push("")
        // }
        //
        // for (let i = 0; i < max; i++) {
        //         let tmp_format = format
        //         for (const sign of map.keys()) {
        //                 tmp_format = tmp_format.replaceAll(sign, map.get("sign")![i check len])
        //         }
        //         ret[i] = tmp_format
        // }




// let formated = new Array<string>()
// for (let [search, path] of assign_map) {
//         // stupid
//         if (path.includes("[]")) {
//                 while (path.includes("[]")) {
//                         data = getDataByPath(data, path.slice(0, path.indexOf(".[]")))
//                         path = path.slice(path.indexOf("[]"))
//                         if (path.length > 0) {
//                                 path.slice(1); // remove "."
//                                 Object.values(data).forEach((v: any) => {
//                                         if (v){
//                                                 format_(v, path).forEach(v => ret.push(v));
//                                         }
//                                 })
//                         } else {
//                                 Object.values(data).forEach((v: any) => {
//                                         if (v) {
//                                                 ret.push(v)
//                                         }
//                                 })
//                         }
//                 }
//         } else if (path.includes("{}")) {
//                 let res = []
//                 while (path.includes("{}")) {
//                         data = getDataByPath(data, path.slice(0, path.indexOf(".{}")))
//                         path = path.slice(path.indexOf("{}") + 2);
//                         console.log(data)
//                         Object.keys(data).forEach(v => {
//                                 if (v) {
//                                         res.push(v)
//                                 }
//                         })
//                 }
//                 res.forEach(v => {
//                         formated.push(
//                                 format.replaceAll()
//                         )
//                 })
//         }
//         format.replaceAll(search,
//                           getDataByPath(data, path)
//                          )
// }
//
// return formated
