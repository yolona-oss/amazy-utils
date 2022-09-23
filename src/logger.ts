import { appendFileSync } from 'fs'
import chalk from 'chalk'

function logTime() {
        return '[' + new Date().toLocaleTimeString() + ']'
}

const logFileName = "./.log/" + new Date().toLocaleDateString().replaceAll('/', '') + "_" + new Date().toLocaleTimeString("ru").replaceAll(":", '')

type ExtendedLog = {
        (...arg: any[]): void,
        echo:  (...arg: any[]) => void
        error: (...arg: any[]) => void
}
let log = <ExtendedLog>function(...arg: any[]): void {
        try {
                appendFileSync(logFileName, logTime() + ' - ' + arg.join(" ") + "\n")
        } catch (e) {

        }
}
log.error = function(...arg: any[]) {
        log("ERROR:", ...arg)

        console.error(logTime(), '-', chalk.red(...arg))
}
log.echo = function(...arg: any[]) {
        log(...arg)
        console.log(logTime(), '-', ...arg)
}

export default log
