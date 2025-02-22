document.addEventListener("DOMContentLoaded", () => {
  const connectMetamaskBtn = document.getElementById("connect-metamask");
  const connectPhantomBtn = document.getElementById("connect-phantom");
  const disconnectBtn = document.getElementById("disconnect-wallet");
  const walletStatus = document.getElementById("wallet-status");
  const walletList = document.getElementById("wallet-list");

  let connectedWallets = JSON.parse(localStorage.getItem("wallets")) || [];
  updateWalletList();

  connectMetamaskBtn.addEventListener("click", async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          addWallet("metamask", accounts[0]);
        }
      } catch (error) {
        walletStatus.textContent = "❌ MetaMask Connection Failed";
      }
    } else {
      walletStatus.textContent = "❌ Please install MetaMask";
    }
  });

  connectPhantomBtn.addEventListener("click", async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect();
        addWallet("phantom", response.publicKey.toString());
      } catch (error) {
        walletStatus.textContent = "❌ Phantom Connection Failed";
      }
    } else {
      walletStatus.textContent = "❌ Please install Phantom Wallet";
    }
  });

  function addWallet(walletType, address) {
    if (!connectedWallets.some(w => w.address === address)) {
      fetch("/wallets/save-wallet/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, wallet_type: walletType })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          connectedWallets.push({ walletType, address });
          localStorage.setItem("wallets", JSON.stringify(connectedWallets));
          walletStatus.textContent = `✅ Wallet Connected: ${address}`;
          updateWalletList();
          // Optionally redirect to dashboard
          window.location.href = "/dashboard/";
        } else {
          walletStatus.textContent = `❌ ${data.message}`;
        }
      })
      .catch(err => {
        walletStatus.textContent = "❌ Network Error";
        console.error(err);
      });
    } else {
      walletStatus.textContent = `✅ Wallet Already Connected: ${address}`;
      window.location.href = "/dashboard/";
    }
  }

  function updateWalletList() {
    walletList.innerHTML = "";
    connectedWallets.forEach(wallet => {
      const li = document.createElement("li");
      li.textContent = `✅ ${wallet.walletType}: ${wallet.address}`;
      walletList.appendChild(li);
    });
    disconnectBtn.style.display = connectedWallets.length > 0 ? "block" : "none";
  }

  disconnectBtn.addEventListener("click", () => {
    connectedWallets = [];
    localStorage.removeItem("wallets");
    walletList.innerHTML = "";
    walletStatus.textContent = "";
    disconnectBtn.style.display = "none";
    window.location.href = "/wallets/disconnect/";
  });
});
