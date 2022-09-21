import axios from 'axios'
import * as metamask from '@metamask/eth-sig-util'
import {
        keyPair,
        AZYProfileData
} from './types.js'

function checkResponse(http_res: any, errorText: string) {
        function checkAzyREST(http_res: any, errorText: string) {
                const status = {
                        ok: http_res.data.ok,
                        error: http_res.data.error
                }
                if (!status.ok) {
                        throw errorText.concat(": ").concat(status.error)
                }
        }

        if (http_res.status == 200) {
                checkAzyREST(http_res, errorText)
                return true
        } else {
                return false
        }
}

export async function getAccountData(keys: keyPair): Promise<AZYProfileData> {
        async function getAuthToken() {
                function createSignMessage() {
                        let sign = metamask.personalSign({
                                privateKey: Buffer.from(keys.privateKey, 'hex'),
                                data: `{"type":"signin","defaultAccount":"${keys.publicKey}"}`
                        })

                        return {
                                from: keys.publicKey,
                                sign: sign
                        }
                }

                let http_res = await axios.post("https://rest.amazy.io/profile/mm-login", createSignMessage())

                if (checkResponse(http_res, "Fetch JWT error")) {
                        return http_res.data.data
                } else {
                        throw "Request error " + http_res.statusText
                }
        }

        const http_res = await axios("https://rest.amazy.io/profile", {
                headers: {
                        Authorization: `Bearer ${await getAuthToken()}`
                }
        })

        if (checkResponse(http_res, "Fetch profile data error")) {
                return http_res.data.data
        } else {
                throw "Request error " + http_res.statusText
        }
}
