import { optional, enums, Describe, Infer, object, number, string } from 'superstruct'

// Disgusting :)
export type publicKey = string
export type Address = publicKey
export type privateKey = string

export interface keyPair {
        publicKey: publicKey
        privateKey: privateKey
}

export type Account = keyPair

export interface AZYWallet {
        BNB: string
        BUSD: string
        AMT: string
        AZY: string
}

export interface AZYProfileData {
        token: string,
        player: {
                userId: string,
                email: string,
                nickname: string | null,
                country: string | null,
                gender: string,
                age: number | null,
                social: any[],
                points: number,
                filled: number,
                withInvite: boolean,
                wallets: Record<string, AZYWallet>,
                pairingCoolDown: number,
                refCodes: any[]
        },
        tracking: {
                currentEnergy: number,
                maxEnergy: number,
                earnedToday: { AMT: number, AZY: number },
                earnedToClaim: { AMT: number, AZY: number },
                distance: number,
                time: number,
                sessions: number,
                perDayLimits: Record<string, Pick<AZYWallet, "AMT" | "AZY">>
        }
}

export interface Network {
        chainId: number
        rpc: URL
}

export interface ClaimOptions {
        minAMT: number
}

const ClaimOptionsSign: Describe<ClaimOptions> = object({
        minAMT: number()
})

const keyPair: Describe<keyPair> = object({publicKey: string(), privateKey: string()})

import networks from './networks.js'
const AvalibleChains = enums(Object.keys(networks))
// import { assign_map } from './formater.js'
const FetchInfoFormat = string() // enums(Array.from(assign_map.keys()))

export const configSign = object({
        concurrency: number(),
        bscscanAPIKey: string(),
        motherShip: keyPair, // wallet whitch included in token transfering
        transactionMinting: object({ // sending transaction fee config
                maxGasPrice: string(),
                gasLimit: string() // number or "auto" for calculating est min gas limits
        }),
        utils: object({
                claim: ClaimOptionsSign,
                transfer: object({
                        direction: enums([ "IN", "OUT" ]), // OUT cause sending from motherShip, IN - to motherShip
                        contract: optional(string()), // For all ERC-20 tokens. if unset transfers will be performed with native token
                        chain: optional(AvalibleChains), // Chain name acronim: "bsc", "eth"... default: "bsc"
                        amount: string(), // value or "all" for transfer all, zero cause fall throw
                        amountUnits: enums([ "wei", "kwei", "mwei", "gwei", "microether", "milliether", "ether" ])
                }),
                fetchInfo: object({
                        unitsLocale: string(), // ru, en...
                        format: FetchInfoFormat, // avalible fields: "address", "azy", "amt", "email", "ToClaimAMT", "ToClaimAZY". parser works as replacer
                        outputFile: string()
                }),
        }),
        path: object({
                storage: string(), // All files will be parsed
                log: string(),
        })
})

export type ConfigType = Infer<typeof configSign>;
