const Reset = "\x1b[0m"
const Bright = "\x1b[1m"
const Dim = "\x1b[2m"
const Underscore = "\x1b[4m"
const Blink = "\x1b[5m"
const Reverse = "\x1b[7m"
const Hidden = "\x1b[8m"

const FgBlack = "\x1b[30m"
const FgRed = "\x1b[31m"
const FgGreen = "\x1b[32m"
const FgYellow = "\x1b[33m"
const FgBlue = "\x1b[34m"
const FgMagenta = "\x1b[35m"
const FgCyan = "\x1b[36m"
const FgWhite = "\x1b[37m"
const FgGray = "\x1b[90m"

const BgBlack = "\x1b[40m"
const BgRed = "\x1b[41m"
const BgGreen = "\x1b[42m"
const BgYellow = "\x1b[43m"
const BgBlue = "\x1b[44m"
const BgMagenta = "\x1b[45m"
const BgCyan = "\x1b[46m"
const BgWhite = "\x1b[47m"
const BgGray = "\x1b[100m"


const serverName = "Collaborative Real-time Whiteboard API"
const authors = "Developed by Francesco Magnani, Thomas Capelli and Valerio Di Zio"

function printWithColor(color, string) {
    console.log(color + string + Reset);

}
function nl() {
    console.log();
}

exports.printServerStart = (port) => {
    console.clear()
    nl();
    printWithColor(FgCyan + Bright, "-----------------------------------------------------------------------")
    nl();
    printWithColor(FgCyan + Bright, "  ****  " + serverName + "  ****");
    nl();
    printWithColor(Dim, "  ---\t" + authors);
    nl();
    printWithColor(FgCyan + Bright,"------------------------------------------------------------------------");
    nl()
    printWithColor(FgGreen, `   Server is running on http://localhost:${port}`)
    nl();
    console.log("------------------------------------------------------------------------");
}

exports.log = (string) => {
     console.log(" --- LOG --- " + string);
}

exports.logSuccess = (string) => {
    printWithColor(FgGreen, " --- LOG --- " + string);
}

exports.logErr = (err) => {
    printWithColor(FgRed, " --- ERR --- " + err);
}

exports.logYellow = (string) => {
    printWithColor(FgYellow, " --- LOG --- " + string)
}

exports.logCyan = (string) => {
    printWithColor(FgCyan, " --- LOG --- " + string)
}

exports.logJoinedApp = (string) => {
    printWithColor(BgGreen + FgBlack, " --- JOINED APP --- " + string)
}


exports.logExited = (string) => {
    printWithColor(BgRed + FgBlack, " --- EXITED --- " + string)
}

exports.logConnected = (string) => {
    printWithColor(BgWhite + FgBlack, " --- CONNECTED --- " + string)
}

exports.logDisconnected = (string) => {
    printWithColor(BgGray + FgBlack, " --- DISCONNECTED --- " + string)
}