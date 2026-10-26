const {
    app,
    BrowserWindow,
    ipcMain
} = require("electron");

const path = require("path");
const pty = require("node-pty");
const { spawn } = require("child_process");
const fs = require("fs");

let terminalProcess = null;
let nmapProcess = null;
let nmapSender = null;

let gobusterProcess = null;
let gobusterSender = null;

function createWindow() {

    const window = new BrowserWindow({

        width: 1200,
        height: 800,

        minWidth: 900,
        minHeight: 600,

        webPreferences: {

            preload: path.join(__dirname, "preload.js"),

            contextIsolation: true,
            nodeIntegration: false

        }

    });

    window.loadFile("index.html");
}


app.whenReady().then(() => {

    createWindow();

    app.on("activate", () => {

        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }

    });

});


ipcMain.on("terminal-start", (event) => {

    if (terminalProcess) {
        return;
    }

    terminalProcess = pty.spawn(
        process.env.ComSpec || "cmd.exe",
        [],
        {
            name: "xterm-color",
            cols: 120,
            rows: 30,
            cwd: process.cwd(),
            env: process.env
        }
    );


    terminalProcess.onData((data) => {

        event.sender.send(
            "terminal-output",
            data
        );

    });


    terminalProcess.onExit(({ exitCode }) => {

        event.sender.send(
            "terminal-exit",
            exitCode
        );

        terminalProcess = null;

    });

});


ipcMain.on("terminal-input", (event, data) => {

    if (terminalProcess) {

        terminalProcess.write(data);

    }

});


function getNmapExecutable() {
    const candidates = [
        path.join(__dirname, "tools", "nmap", "nmap.exe"),
        "C:\\Program Files (x86)\\Nmap\\nmap.exe",
        "C:\\Program Files\\Nmap\\nmap.exe"
    ];

    for (const executable of candidates) {
        if (fs.existsSync(executable)) {
            return executable;
        }
    }

    // Fallback: use Nmap if it is available in PATH.
    return "nmap";
}

function sendNmapMessage(channel, ...args) {
    if (nmapSender && !nmapSender.isDestroyed()) {
        nmapSender.send(channel, ...args);
    }
}

ipcMain.on("nmap-start", (event, rawTarget) => {
    if (nmapProcess) {
        event.sender.send(
            "nmap-error",
            "A scan is already running."
        );
        return;
    }

    const target = String(rawTarget || "").trim();

    // Accept hostnames and IP-like targets, not command-line input.
    if (
        !/^[a-zA-Z0-9][a-zA-Z0-9.-]{0,252}$/.test(target)
    ) {
        event.sender.send(
            "nmap-error",
            "Enter a valid IP address or hostname."
        );
        return;
    }

    nmapSender = event.sender;

    const executable = getNmapExecutable();

    sendNmapMessage(
        "nmap-output",
        `Starting Nmap scan against ${target}...\r\n\r\n`
    );

    try {
        const child = spawn(
            executable,
            ["-sV", target],
            {
                shell: false,
                windowsHide: true
            }
        );

        nmapProcess = child;

        child.stdout.on("data", (data) => {
            sendNmapMessage(
                "nmap-output",
                data.toString()
            );
        });

        child.stderr.on("data", (data) => {
            sendNmapMessage(
                "nmap-output",
                data.toString()
            );
        });

        child.on("error", (error) => {
            sendNmapMessage(
                "nmap-error",
                `Could not launch Nmap: ${error.message}`
            );
        });

        child.on("close", (code) => {
            sendNmapMessage(
                "nmap-exit",
                code
            );

            nmapProcess = null;
            nmapSender = null;
        });

    } catch (error) {
        sendNmapMessage(
            "nmap-error",
            error.message
        );

        nmapProcess = null;
        nmapSender = null;
    }
});

ipcMain.on("nmap-stop", () => {
    if (nmapProcess) {
        nmapProcess.kill();
    }
});

app.on("window-all-closed", () => {


function getGobusterExecutable() {
    const candidates = [
        path.join(__dirname, "tools", "gobuster", "gobuster.exe"),
        "C:\\Tools\\Gobuster\\gobuster.exe"
    ];

    for (const executable of candidates) {
        if (fs.existsSync(executable)) {
            return executable;
        }
    }

    return "gobuster";
}

function sendGobusterMessage(channel, ...args) {
    if (gobusterSender && !gobusterSender.isDestroyed()) {
        gobusterSender.send(channel, ...args);
    }
}

ipcMain.on("gobuster-start", (event, rawTarget, rawWordlist) => {
    if (gobusterProcess) {
        event.sender.send(
            "gobuster-error",
            "A Gobuster enumeration is already running."
        );
        return;
    }

    const target = String(rawTarget || "").trim();
    const wordlist = String(rawWordlist || "").trim();

    let parsedUrl;

    try {
        parsedUrl = new URL(target);
    } catch {
        event.sender.send(
            "gobuster-error",
            "Enter a valid target URL, including http:// or https://."
        );
        return;
    }

    if (
        !["http:", "https:"].includes(parsedUrl.protocol) ||
        !parsedUrl.hostname
    ) {
        event.sender.send(
            "gobuster-error",
            "Only valid HTTP and HTTPS URLs are accepted."
        );
        return;
    }

    if (
        !wordlist ||
        !fs.existsSync(wordlist) ||
        !fs.statSync(wordlist).isFile()
    ) {
        event.sender.send(
            "gobuster-error",
            "Wordlist file not found. Check its full path."
        );
        return;
    }

    gobusterSender = event.sender;

    sendGobusterMessage(
        "gobuster-output",
        `Starting enumeration against ${target}\r\n` +
        `Wordlist: ${wordlist}\r\n\r\n`
    );

    try {
        const child = spawn(
            getGobusterExecutable(),
            ["dir", "-u", target, "-w", wordlist],
            {
                shell: false,
                windowsHide: true
            }
        );

        gobusterProcess = child;

        child.stdout.on("data", (data) => {
            sendGobusterMessage("gobuster-output", data.toString());
        });

        child.stderr.on("data", (data) => {
            sendGobusterMessage("gobuster-output", data.toString());
        });

        child.on("error", (error) => {
            sendGobusterMessage(
                "gobuster-error",
                `Could not launch Gobuster: ${error.message}. ` +
                "Check the executable path or Windows PATH."
            );
        });

        child.on("close", (code) => {
            sendGobusterMessage("gobuster-exit", code);
            gobusterProcess = null;
            gobusterSender = null;
        });

    } catch (error) {
        sendGobusterMessage("gobuster-error", error.message);
        gobusterProcess = null;
        gobusterSender = null;
    }
});

ipcMain.on("gobuster-stop", () => {
    if (gobusterProcess) {
        gobusterProcess.kill();
    }
});


    if (process.platform !== "darwin") {

        app.quit();

    }

});