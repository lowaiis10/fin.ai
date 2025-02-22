document.addEventListener("DOMContentLoaded", async function () {
  const portfolioValueElem = document.getElementById("portfolio-value");
  const walletListElem = document.getElementById("wallet-list");
  const nftGalleryElem = document.getElementById("nft-gallery");
  const disconnectBtn = document.getElementById("disconnect-wallet");
  const chartCanvas = document.getElementById("portfolio-chart");

  let wallets = JSON.parse(localStorage.getItem("wallets")) || [];

  async function fetchPortfolio() {
    let totalValue = 0;
    let tokenData = [];

    for (let wallet of wallets) {
      const response = await fetch(`/wallets/fetch_prices?wallet=${wallet.address}`);
      const data = await response.json();

      if (data.portfolio_value) {
        totalValue += data.portfolio_value;
      }
      if (data.tokens) {
        Object.entries(data.tokens).forEach(([symbol, info]) => {
          tokenData.push({ symbol, value: info.total_value });
        });
      }

      const walletItem = document.createElement("div");
      walletItem.textContent = `${wallet.walletType}: ${wallet.address}`;
      walletListElem.appendChild(walletItem);
    }

    portfolioValueElem.innerText = `$${totalValue.toFixed(2)}`;
    if (tokenData.length && chartCanvas) {
      updatePieChart(tokenData);
    }
  }

  async function fetchNFTs() {
    for (let wallet of wallets) {
      const response = await fetch(`/wallets/fetch_nfts?wallet=${wallet.address}`);
      const data = await response.json();

      if (data.nfts) {
        data.nfts.forEach(nft => {
          const nftItem = document.createElement("div");
          nftItem.classList.add("rounded", "bg-gray-700", "p-3", "text-center");
          nftItem.innerHTML = `
            <img src="${nft.image}" alt="${nft.name}" class="w-full mb-2 rounded">
            <p class="text-sm font-semibold">${nft.name}</p>
            <p class="text-xs">${nft.collection}</p>
          `;
          nftGalleryElem.appendChild(nftItem);
        });
      }
    }
  }

  function updatePieChart(tokenData) {
    const ctx = chartCanvas.getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: tokenData.map(t => t.symbol),
        datasets: [{
          data: tokenData.map(t => t.value),
          backgroundColor: [
            "#4CAF50", "#FF9800", "#2196F3", "#9C27B0",
            "#F44336", "#00BCD4", "#8BC34A"
          ]
        }]
      },
      options: {
        animation: {
          duration: 1500,
          easing: "easeInOutQuint"
        },
        plugins: {
          legend: {
            labels: { color: '#ffffff' }
          }
        }
      }
    });
  }

  disconnectBtn.addEventListener("click", function () {
    localStorage.removeItem("wallets");
    window.location.href = "/wallets/disconnect/";
  });

  fetchPortfolio();
  fetchNFTs();
});
