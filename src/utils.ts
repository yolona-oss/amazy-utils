
export function getDataByPath(obj: object, path: string): any {
        let ret: any = obj

        for (const node of path.split('.')) {
                ret = ret[node]
        }

        return ret
}

export function assign(obj: object, _prop: string, value: any) {
        let prop = new Array<string>()
        if (typeof _prop === "string")
                prop = _prop.split(".")

        if (prop.length > 1) {
                var e = prop.shift()
                // @ts-ignore
                this.assign(obj[e] = Object.prototype.toString.call(obj[e]) === "[object Object]" ? obj[e]
                                    : {}, prop.join('.'), value)
        } else {
                // @ts-ignore
                obj[prop[0]] = value
        }
        return obj
}

export async function retrier(fn: () => Promise<boolean>, opts?: { tries?: number, wait?: number  }) {
        const default_opts = { tries: 3, wait: 700  }
        const _opts = {
                ...default_opts,
                ...opts

        }
        for (let tryn = 0; tryn < _opts.tries; tryn++) {
                if (await fn()) { return } // success exit
                await sleep(_opts.wait)

        }
        throw "Unreachable action: " + fn.name

}

export function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

export function timeoutPromise(timeout: number): Promise<void> {
        return new Promise(function(_, reject) {
                setTimeout(function() {
                        reject("Timeout")
                }, timeout)
        })
}
export async function randSleep(max: number = 1000, min: number = 100) {
        let ms = Math.round(Math.random() * (max-min) + min)
        return await sleep(ms)
}

export module time {
        export type HMSTime = {
                hour: number,
                minutes: number,
                seconds: number,
                milliseconds: number,
        }

        export function add(time: Partial<HMSTime>, date = new Date()) {
                let copy = new Date(date)
                return new Date(copy.setTime(copy.getTime() +
                                             ( time.hour ?? 0) * 3600000 +
                                             ( time.minutes ?? 0) * 6000 +
                                             ( time.seconds ?? 0) * 1000) +
                                             ( time.milliseconds ?? 0))
        }

        export function toDate(date: any) {
                if (date === void 0) {
                        return new Date(0);
                }
                if (isDate(date)) {
                        return date;
                } else {
                        return new Date(parseFloat(date.toString()));
                }
        }

        export function isDate(date: any) {
                return (date instanceof Date);
        }

        export function format(date: any, format: string) {
                var d = toDate(date);
                return format
                .replace(/Y/gm, d.getFullYear().toString())
                .replace(/m/gm, ('0' + (d.getMonth() + 1)).substr(-2))
                .replace(/d/gm, ('0' + (d.getDate() + 1)).substr(-2))
                .replace(/H/gm, ('0' + (d.getHours() + 0)).substr(-2))
                .replace(/i/gm, ('0' + (d.getMinutes() + 0)).substr(-2))
                .replace(/s/gm, ('0' + (d.getSeconds() + 0)).substr(-2))
                .replace(/v/gm, ('0000' + (d.getMilliseconds() % 1000)).substr(-3));
        }

        export function rawMS(time: Partial<HMSTime>) {
                return ( time.hour ?? 0) * 3600000 +
                        ( time.minutes ?? 0) * 6000 +
                        ( time.seconds ?? 0) * 1000 +
                        ( time.milliseconds ?? 0)
        }
}
