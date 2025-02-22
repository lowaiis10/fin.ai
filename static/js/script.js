document.addEventListener("DOMContentLoaded", () => {
    const connectMetamaskBtn = document.getElementById("connect-metamask");
    const connectPhantomBtn = document.getElementById("connect-phantom");
    const disconnectBtn = document.getElementById("disconnect-wallet");
    const walletStatus = document.getElementById("wallet-status");
    const walletList = document.getElementById("wallet-list");

    let connectedWallets = [];

    // Connect MetaMask (Ethereum)
    connectMetamaskBtn.addEventListener("click", async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                accounts.forEach(address => addWallet("Ethereum", address));
            } catch (error) {
                walletStatus.innerHTML = "❌ MetaMask Connection Failed";
            }
        } else {
            walletStatus.innerHTML = "❌ Please install MetaMask";
        }
    });

    // Connect Phantom (Solana)
    connectPhantomBtn.addEventListener("click", async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                addWallet("Solana", response.publicKey.toString());
            } catch (error) {
                walletStatus.innerHTML = "❌ Phantom Connection Failed";
            }
        } else {
            walletStatus.innerHTML = "❌ Please install Phantom Wallet";
        }
    });

    // Add wallet to the list
    function addWallet(network, address) {
        if (!connectedWallets.some(wallet => wallet.address === address)) {
            connectedWallets.push({ network, address });
            updateWalletList();
        }
    }

    // Update UI with connected wallets
    function updateWalletList() {
        walletList.innerHTML = "";
        connectedWallets.forEach(wallet => {
            const li = document.createElement("li");
            li.textContent = `✅ ${wallet.network}: ${wallet.address}`;
            walletList.appendChild(li);
        });
        disconnectBtn.style.display = connectedWallets.length > 0 ? "block" : "none";
    }

    // Disconnect Wallets
    disconnectBtn.addEventListener("click", () => {
        connectedWallets = [];
        walletList.innerHTML = "";
        walletStatus.innerHTML = "";
        disconnectBtn.style.display = "none";
        if (window.ethereum) {
            window.ethereum.request({ method: "eth_requestAccounts", params: [] });
        }
        if (window.solana) {
            window.solana.disconnect();
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const connectMetamaskBtn = document.getElementById("connect-metamask");
    const connectPhantomBtn = document.getElementById("connect-phantom");

    let connectedWallets = [];

    // Connect MetaMask (Ethereum)
    connectMetamaskBtn.addEventListener("click", async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                localStorage.setItem("wallets", JSON.stringify([{ network: "Ethereum", address: accounts[0] }]));
                window.location.href = "/dashboard/";  // ✅ Redirect to dashboard
            } catch (error) {
                alert("❌ MetaMask Connection Failed");
            }
        } else {
            alert("❌ Please install MetaMask");
        }
    });

    // Connect Phantom (Solana)
    connectPhantomBtn.addEventListener("click", async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                localStorage.setItem("wallets", JSON.stringify([{ network: "Solana", address: response.publicKey.toString() }]));
                window.location.href = "/dashboard/";  // ✅ Redirect to dashboard
            } catch (error) {
                alert("❌ Phantom Connection Failed");
            }
        } else {
            alert("❌ Please install Phantom Wallet");
        }
    });
});
