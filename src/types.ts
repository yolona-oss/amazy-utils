// Disgusting :)
export type publicKey = string
export type privateKey = string

export interface keyPair{
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

export interface ClaimOptions {
        minAMT: number,

}
