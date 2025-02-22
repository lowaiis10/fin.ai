// static/js/script.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("Global script.js loaded.");

  // Retrieve connected wallets from localStorage
  let connectedWallets = JSON.parse(localStorage.getItem("wallets")) || [];
  console.log("Connected wallets:", connectedWallets);

  // Grab common elements (if present)
  const connectMetamaskBtn = document.getElementById("connect-metamask");
  const connectPhantomBtn = document.getElementById("connect-phantom");
  const walletStatus = document.getElementById("wallet-status");
  const walletList = document.getElementById("wallet-list");
  const disconnectBtn = document.getElementById("disconnect-wallet");

  // Update UI with existing wallets on load
  updateWalletList();

  // MetaMask Connection
  if (connectMetamaskBtn) {
    connectMetamaskBtn.addEventListener("click", async () => {
      console.log("MetaMask button clicked.");
      if (!window.ethereum) {
        if (walletStatus) walletStatus.textContent = "Please install MetaMask!";
        return;
      }
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("MetaMask accounts:", accounts);
        if (accounts.length > 0) {
          connectedWallets.push({ walletType: "MetaMask", address: accounts[0] });
          localStorage.setItem("wallets", JSON.stringify(connectedWallets));
          if (walletStatus) walletStatus.textContent = `Connected MetaMask: ${accounts[0]}`;
          updateWalletList();
          // Redirect to /overview
          window.location.href = "/overview/";
        }
      } catch (error) {
        console.error("MetaMask connection failed:", error);
        if (walletStatus) walletStatus.textContent = "❌ MetaMask Connection Failed";
      }
    });
  }

  // Phantom Connection
  if (connectPhantomBtn) {
    connectPhantomBtn.addEventListener("click", async () => {
      console.log("Phantom button clicked.");
      if (!(window.solana && window.solana.isPhantom)) {
        if (walletStatus) walletStatus.textContent = "Please install Phantom Wallet!";
        return;
      }
      try {
        const response = await window.solana.connect();
        console.log("Phantom response:", response);
        const address = response.publicKey.toString();
        connectedWallets.push({ walletType: "Phantom", address });
        localStorage.setItem("wallets", JSON.stringify(connectedWallets));
        if (walletStatus) walletStatus.textContent = `Connected Phantom: ${address}`;
        updateWalletList();
        // Redirect to /overview
        window.location.href = "/overview/";
      } catch (error) {
        console.error("Phantom connection failed:", error);
        if (walletStatus) walletStatus.textContent = "❌ Phantom Connection Failed";
      }
    });
  }

  // Disconnect Logic
  if (disconnectBtn) {
    disconnectBtn.addEventListener("click", () => {
      console.log("Disconnecting wallets...");
      localStorage.removeItem("wallets");
      connectedWallets = [];
      if (walletStatus) walletStatus.textContent = "";
      updateWalletList();
      // Redirect to homepage
      window.location.href = "/";
    });
  }

  // Helper function to update wallet list in the UI
  function updateWalletList() {
    if (!walletList) return;
    walletList.innerHTML = "";
    connectedWallets.forEach(wallet => {
      const li = document.createElement("li");
      li.textContent = `✅ ${wallet.walletType}: ${wallet.address}`;
      walletList.appendChild(li);
    });
    // Show/hide the disconnect button
    if (disconnectBtn) {
      if (connectedWallets.length > 0) {
        disconnectBtn.classList.remove("hidden");
      } else {
        disconnectBtn.classList.add("hidden");
      }
    }
  }
});
