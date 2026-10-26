const { contextBridge, ipcRenderer } = require("electron");

const {
    contextBridge,
    ipcRenderer
} = require("electron");


contextBridge.exposeInMainWorld(
    "cyberTerminal",
    {

        start: () => {

            ipcRenderer.send(
                "terminal-start"
            );

        },


        write: (data) => {

            ipcRenderer.send(
                "terminal-input",
                data
            );

        },


        onData: (callback) => {

            ipcRenderer.on(
                "terminal-output",
                (event, data) => {

                    callback(data);

                }
            );

        },


        onExit: (callback) => {

            ipcRenderer.on(
                "terminal-exit",
                (event, code) => {

                    callback(code);

                }
            );

        }

    }
);

contextBridge.exposeInMainWorld("cyberNmap", {
    start: (target) => {
        ipcRenderer.send("nmap-start", target);
    },

    stop: () => {
        ipcRenderer.send("nmap-stop");
    },

    onOutput: (callback) => {
        ipcRenderer.on("nmap-output", (_event, data) => {
            callback(data);
        });
    },

    onError: (callback) => {
        ipcRenderer.on("nmap-error", (_event, message) => {
            callback(message);
        });
    },

    onExit: (callback) => {
        ipcRenderer.on("nmap-exit", (_event, code) => {
            callback(code);
        });
    }
});


contextBridge.exposeInMainWorld("cyberGobuster", {
    start: (target, wordlist) => {
        ipcRenderer.send("gobuster-start", target, wordlist);
    },

    stop: () => {
        ipcRenderer.send("gobuster-stop");
    },

    onOutput: (callback) => {
        ipcRenderer.on("gobuster-output", (_event, data) => {
            callback(data);
        });
    },

    onError: (callback) => {
        ipcRenderer.on("gobuster-error", (_event, message) => {
            callback(message);
        });
    },

    onExit: (callback) => {
        ipcRenderer.on("gobuster-exit", (_event, code) => {
            callback(code);
        });
    }
});
