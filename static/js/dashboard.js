document.addEventListener("DOMContentLoaded", async function () {
    const portfolioValueElem = document.getElementById("portfolio-value");
    const walletListElem = document.getElementById("wallet-list");
    const nftGalleryElem = document.getElementById("nft-gallery");
    const disconnectBtn = document.getElementById("disconnect-wallet");
    
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
            walletItem.innerHTML = `<strong>${wallet.wallet_type}:</strong> ${wallet.address}`;
            walletListElem.appendChild(walletItem);
        }

        portfolioValueElem.innerText = `$${totalValue.toFixed(2)}`;
        updatePieChart(tokenData);
    }

    async function fetchNFTs() {
        for (let wallet of wallets) {
            const response = await fetch(`/wallets/fetch_nfts?wallet=${wallet.address}`);
            const data = await response.json();

            if (data.nfts) {
                data.nfts.forEach(nft => {
                    const nftItem = document.createElement("div");
                    nftItem.classList.add("nft-item");
                    nftItem.innerHTML = `
                        <img src="${nft.image}" alt="${nft.name}">
                        <p>${nft.name}</p>
                    `;
                    nftGalleryElem.appendChild(nftItem);
                });
            }
        }
    }

    function updatePieChart(tokenData) {
        const ctx = document.getElementById("portfolio-chart").getContext("2d");
        new Chart(ctx, {
            type: "pie",
            data: {
                labels: tokenData.map(t => t.symbol),
                datasets: [{
                    data: tokenData.map(t => t.value),
                    backgroundColor: ["#4CAF50", "#FF9800", "#2196F3", "#9C27B0", "#F44336"]
                }]
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
