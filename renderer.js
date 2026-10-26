
console.log("CyberShield renderer loaded");

// ================================
// NAVIGATION
// ================================

const navigationButtons = document.querySelectorAll(".nav-button");
const toolCards = document.querySelectorAll(".tool-card");
const pages = document.querySelectorAll(".page");

const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");

const pageInformation = {
    dashboard: {
        title: "Dashboard",
        subtitle: "Cybersecurity tools in one place"
    },
    nmap: {
        title: "Nmap",
        subtitle: "Network discovery and port scanning"
    },
    gobuster: {
        title: "Gobuster",
        subtitle: "Web and directory enumeration"
    },
    hydra: {
        title: "Hydra",
        subtitle: "Credential auditing"
    },
    wireshark: {
        title: "Wireshark",
        subtitle: "Network packet analysis"
    },
    terminal: {
        title: "Terminal",
        subtitle: "Integrated command-line environment"
    },
    settings: {
        title: "Settings",
        subtitle: "Configure CyberShield"
    }
};

function showPage(pageName) {
    const selectedPage = document.getElementById(pageName);

    if (!selectedPage) {
        console.error("CyberShield: Page not found:", pageName);
        return;
    }

    pages.forEach((page) => {
        page.classList.add("hidden");
    });

    selectedPage.classList.remove("hidden");

    navigationButtons.forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    if (pageTitle && pageSubtitle && pageInformation[pageName]) {
        pageTitle.textContent = pageInformation[pageName].title;
        pageSubtitle.textContent = pageInformation[pageName].subtitle;
    }

    console.log("CyberShield: Opened page:", pageName);
}

navigationButtons.forEach((button) => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

toolCards.forEach((card) => {
    card.addEventListener("click", () => {
        showPage(card.dataset.page);
    });
});

 // ================================
 // NMAP
 // ================================

const nmapTarget = document.getElementById("nmap-target");
const nmapStartButton = document.getElementById("nmap-start");
const nmapStopButton = document.getElementById("nmap-stop");
const nmapOutput = document.getElementById("nmap-output");

if (
    nmapTarget &&
    nmapStartButton &&
    nmapStopButton &&
    nmapOutput &&
    window.cyberNmap
) {
    nmapStartButton.addEventListener("click", () => {
        const target = nmapTarget.value.trim();

        if (!target) {
            nmapOutput.textContent =
                "Please enter an IP address or hostname.";
            return;
        }

        nmapOutput.textContent = "";
        nmapStartButton.disabled = true;
        nmapStopButton.disabled = false;

        window.cyberNmap.start(target);
    });

    nmapStopButton.addEventListener("click", () => {
        window.cyberNmap.stop();
        nmapOutput.textContent += "\r\nStopping scan...\r\n";
        nmapStopButton.disabled = true;
    });

    window.cyberNmap.onOutput((data) => {
        nmapOutput.textContent += data;
        nmapOutput.scrollTop = nmapOutput.scrollHeight;
    });

    window.cyberNmap.onError((message) => {
        nmapOutput.textContent += `\r\nERROR: ${message}\r\n`;
        nmapStartButton.disabled = false;
        nmapStopButton.disabled = true;
    });

    window.cyberNmap.onExit((code) => {
        nmapOutput.textContent +=
            `\r\nScan finished. Exit code: ${code}\r\n`;

        nmapStartButton.disabled = false;
        nmapStopButton.disabled = true;
    });
}
// ================================
// TERMINAL
// ================================

const terminalElement = document.getElementById("terminal");

if (terminalElement && typeof Terminal !== "undefined") {
    const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: "Consolas, 'Courier New', monospace",
        theme: {
            background: "#070a0e",
            foreground: "#d4d4d4",
            cursor: "#ffffff"
        }
    });

    term.open(terminalElement);

    if (window.cyberTerminal) {
        // Display output received from Windows CMD.
        window.cyberTerminal.onData((data) => {
            term.write(data);
        });

        // Send typed characters to Windows CMD.
        term.onData((data) => {
            window.cyberTerminal.write(data);
        });

        window.cyberTerminal.onExit((code) => {
            term.write(
                "\r\n\r\nTerminal process exited with code: " +
                code +
                "\r\n"
            );
        });

        // Start the real terminal once.
        window.cyberTerminal.start();
    } else {
        term.write("CyberShield terminal bridge is unavailable.\r\n");
        console.error("CyberShield: preload bridge not found.");
    }
} else {
    console.warn("CyberShield: Terminal element or library not found.");
}


 // ================================
 // GOBUSTER
 // ================================

const gobusterTarget = document.getElementById("gobuster-target");
const gobusterWordlist = document.getElementById("gobuster-wordlist");
const gobusterStartButton = document.getElementById("gobuster-start");
const gobusterStopButton = document.getElementById("gobuster-stop");
const gobusterOutput = document.getElementById("gobuster-output");

if (
    gobusterTarget &&
    gobusterWordlist &&
    gobusterStartButton &&
    gobusterStopButton &&
    gobusterOutput &&
    window.cyberGobuster
) {
    gobusterStartButton.addEventListener("click", () => {
        const target = gobusterTarget.value.trim();
        const wordlist = gobusterWordlist.value.trim();

        if (!target || !wordlist) {
            gobusterOutput.textContent =
                "Enter both a target URL and a wordlist path.";
            return;
        }

        gobusterOutput.textContent = "";
        gobusterStartButton.disabled = true;
        gobusterStopButton.disabled = false;

        window.cyberGobuster.start(target, wordlist);
    });

    gobusterStopButton.addEventListener("click", () => {
        window.cyberGobuster.stop();
        gobusterOutput.textContent += "\r\nStopping enumeration...\r\n";
        gobusterStopButton.disabled = true;
    });

    window.cyberGobuster.onOutput((data) => {
        gobusterOutput.textContent += data;
        gobusterOutput.scrollTop = gobusterOutput.scrollHeight;
    });

    window.cyberGobuster.onError((message) => {
        gobusterOutput.textContent += `\r\nERROR: ${message}\r\n`;
        gobusterStartButton.disabled = false;
        gobusterStopButton.disabled = true;
    });

    window.cyberGobuster.onExit((code) => {
        gobusterOutput.textContent +=
            `\r\nEnumeration finished. Exit code: ${code}\r\n`;

        gobusterStartButton.disabled = false;
        gobusterStopButton.disabled = true;
    });
}

// ================================
// INITIAL PAGE
// ================================

showPage("dashboard");
