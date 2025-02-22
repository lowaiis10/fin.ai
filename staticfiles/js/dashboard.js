document.addEventListener("DOMContentLoaded", async function () {
    const portfolioValue = document.getElementById("portfolio-value");
    const walletList = document.getElementById("wallet-list");
    const nftCollection = document.getElementById("nft-collection");
    const disconnectBtn = document.getElementById("disconnect-btn");
    const chartCanvas = document.getElementById("portfolio-chart").getContext("2d");

    let chart;

    async function fetchPortfolio() {
        const wallet = sessionStorage.getItem("wallet_address");
        if (!wallet) {
            portfolioValue.textContent = "$0.00";
            return;
        }

        const tokenRes = await fetch(`/wallets/fetch-prices/?wallet=${wallet}`);
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            portfolioValue.textContent = "Error fetching prices";
            return;
        }

        portfolioValue.textContent = `$${tokenData.portfolio_value.toFixed(2)}`;

        walletList.innerHTML = "";
        let chartLabels = [];
        let chartValues = [];

        Object.keys(tokenData.tokens).forEach((token) => {
            const tokenInfo = tokenData.tokens[token];
            const li = document.createElement("li");
            li.innerHTML = `<strong>${token.toUpperCase()}:</strong> ${tokenInfo.balance} (${tokenInfo.total_value.toFixed(2)} USD)`;
            walletList.appendChild(li);

            chartLabels.push(token.toUpperCase());
            chartValues.push(tokenInfo.total_value);
        });

        if (chart) chart.destroy();
        chart = new Chart(chartCanvas, {
            type: "pie",
            data: {
                labels: chartLabels,
                datasets: [
                    {
                        label: "Portfolio Distribution",
                        data: chartValues,
                        backgroundColor: ["#ffcc00", "#ff5733", "#33ff57", "#3375ff"],
                    },
                ],
            },
        });
    }

    async function fetchNFTs() {
        const wallet = sessionStorage.getItem("wallet_address");
        if (!wallet) return;

        const nftRes = await fetch(`/wallets/fetch-nfts/?wallet=${wallet}`);
        const nftData = await nftRes.json();

        nftCollection.innerHTML = "";
        nftData.nfts.forEach((nft) => {
            const nftItem = document.createElement("div");
            nftItem.className = "nft-item";
            nftItem.innerHTML = `<img src="${nft.image}" alt="${nft.name}"><p><strong>${nft.name}</strong></p>`;
            nftCollection.appendChild(nftItem);
        });
    }

    disconnectBtn.addEventListener("click", () => {
        sessionStorage.removeItem("wallet_address");
        window.location.href = "/";
    });

    fetchPortfolio();
    fetchNFTs();
});
