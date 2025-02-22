document.addEventListener("DOMContentLoaded", () => {
  console.log("Script.js loaded. Checking environment...");

  // Attempt to load wallets from localStorage
  let connectedWallets = JSON.parse(localStorage.getItem("wallets")) || [];
  console.log("Loaded connected wallets:", connectedWallets);

  // DOM elements
  const connectMetamaskBtn = document.getElementById("connect-metamask");
  const connectPhantomBtn = document.getElementById("connect-phantom");
  const disconnectBtn = document.getElementById("disconnect-wallet");
  const walletStatus = document.getElementById("wallet-status");
  const walletList = document.getElementById("wallet-list");

  // Quick debug logs
  console.log("Metamask button:", connectMetamaskBtn);
  console.log("Phantom button:", connectPhantomBtn);

  // Update UI initially
  updateWalletList();

  // Connect MetaMask
  if (connectMetamaskBtn) {
    connectMetamaskBtn.addEventListener("click", async () => {
      console.log("MetaMask button clicked");
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          console.log("MetaMask accounts:", accounts);
          if (accounts.length > 0) {
            connectedWallets.push({ walletType: "MetaMask", address: accounts[0] });
            localStorage.setItem("wallets", JSON.stringify(connectedWallets));
            if (walletStatus) walletStatus.textContent = `Connected MetaMask: ${accounts[0]}`;
            updateWalletList();
            // Redirect to dashboard
            window.location.href = "/dashboard/";
          }
        } catch (error) {
          console.error("MetaMask connection failed:", error);
          if (walletStatus) walletStatus.textContent = "❌ MetaMask Connection Failed";
        }
      } else {
        if (walletStatus) walletStatus.textContent = "❌ Please install MetaMask!";
      }
    });
  }

  // Connect Phantom
  if (connectPhantomBtn) {
    connectPhantomBtn.addEventListener("click", async () => {
      console.log("Phantom button clicked");
      if (window.solana && window.solana.isPhantom) {
        try {
          const response = await window.solana.connect();
          console.log("Phantom response:", response);
          const address = response.publicKey.toString();
          connectedWallets.push({ walletType: "Phantom", address });
          localStorage.setItem("wallets", JSON.stringify(connectedWallets));
          if (walletStatus) walletStatus.textContent = `Connected Phantom: ${address}`;
          updateWalletList();
          // Redirect to dashboard
          window.location.href = "/dashboard/";
        } catch (error) {
          console.error("Phantom connection failed:", error);
          if (walletStatus) walletStatus.textContent = "❌ Phantom Connection Failed";
        }
      } else {
        if (walletStatus) walletStatus.textContent = "❌ Please install Phantom Wallet!";
      }
    });
  }

  // Disconnect
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

  function updateWalletList() {
    if (!walletList) return;
    walletList.innerHTML = "";
    connectedWallets.forEach((wallet) => {
      const li = document.createElement("li");
      li.textContent = `✅ ${wallet.walletType}: ${wallet.address}`;
      walletList.appendChild(li);
    });
    if (disconnectBtn) {
      if (connectedWallets.length > 0) {
        disconnectBtn.classList.remove("hidden");
      } else {
        disconnectBtn.classList.add("hidden");
      }
    }
  }

  // Dashboard logic if #portfolio-chart exists
  const portfolioChart = document.getElementById("portfolio-chart");
  if (portfolioChart) {
    new Chart(portfolioChart.getContext("2d"), {
      type: "pie",
      data: {
        labels: ["ETH", "SOL", "USDT"],
        datasets: [{
          data: [1.2, 3.5, 500],
          backgroundColor: ["#4CAF50", "#2196F3", "#FF9800"]
        }]
      }
    });
  }
});
