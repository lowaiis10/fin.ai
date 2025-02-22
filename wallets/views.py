import json
import requests
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import Wallet

# 🔹 API Keys (Move to env variables if needed for security)
COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price"
RESERVOIR_API_URL = "https://api.reservoir.tools/tokens/v6"

HEADERS = {
    "accept": "application/json",
    "x-api-key": "c5bb7226-fcf4-5aee-947c-f2e2fc4c7755"  # Reservoir API Key
}

# 🔹 Pages
def homepage(request):
    return render(request, "wallets/homepage.html")

def dashboard(request):
    return render(request, "wallets/dashboard.html")

def disconnect_wallet(request):
    """ Clears wallet session and redirects to homepage """
    request.session.flush()  # Clears all session data
    return redirect("homepage")

# ✅ Save Wallet Function
@csrf_exempt
def save_wallet(request):
    """ Saves a connected wallet to session and database """
    if request.method == "POST":
        try:
            data = json.loads(request.body)  # ✅ Support JSON payloads
            address = data.get("address")
            wallet_type = data.get("wallet_type")
        except json.JSONDecodeError:
            address = request.POST.get("address")
            wallet_type = request.POST.get("wallet_type")

        if not address or not wallet_type:
            return JsonResponse({"success": False, "error": "Invalid data received"}, status=400)

        # ✅ Store wallet in session
        if "wallets" not in request.session:
            request.session["wallets"] = []
        request.session["wallets"].append({"address": address, "wallet_type": wallet_type})
        request.session.modified = True  # Save session

        # ✅ Store wallet in DB
        wallet, created = Wallet.objects.get_or_create(address=address, wallet_type=wallet_type)
        return JsonResponse({"success": True, "message": "Wallet connected", "new": created})

    return JsonResponse({"success": False, "error": "Invalid request"}, status=400)

def connect_wallet(request):
    return render(request, "wallets/connect_wallet.html")


# ✅ Fetch Wallet Balances (Dummy Function - Replace with Web3 API)
def get_wallet_balances(wallet_address):
    """ Fetches dummy wallet balances - replace with real blockchain query """
    return {
        "ethereum": 1.2,  # ETH
        "solana": 3.5,  # SOL
        "usdt": 500,  # USDT
    }

# ✅ Fetch Live Token Prices from CoinGecko
@csrf_exempt
def fetch_prices(request):
    wallet_address = request.GET.get("wallet")
    if not wallet_address:
        return JsonResponse({"error": "Wallet address required"}, status=400)

    balances = get_wallet_balances(wallet_address)  # Fetch wallet balances

    # Fetch prices from CoinGecko
    token_ids = ",".join(balances.keys()).lower()
    response = requests.get(f"{COINGECKO_API_URL}?ids={token_ids}&vs_currencies=usd")
    
    try:
        price_data = response.json()
    except:
        return JsonResponse({"error": "Failed to fetch prices"}, status=500)

    portfolio_value = 0
    token_values = {}

    for token, balance in balances.items():
        token_price = price_data.get(token.lower(), {}).get("usd", 0)
        token_values[token] = {
            "balance": balance,
            "price": token_price,
            "total_value": balance * token_price,
        }
        portfolio_value += balance * token_price

    return JsonResponse({"portfolio_value": portfolio_value, "tokens": token_values})


# ✅ Fetch NFT Holdings & Floor Prices from Reservoir API
@csrf_exempt
def fetch_nfts(request):
    wallet_address = request.GET.get("wallet")
    if not wallet_address:
        return JsonResponse({"error": "Wallet address required"}, status=400)

    response = requests.get(
        f"{RESERVOIR_API_URL}?owner={wallet_address}&limit=10",
        headers=HEADERS
    )

    try:
        nft_data = response.json().get("tokens", [])
    except:
        return JsonResponse({"error": "Failed to fetch NFT data"}, status=500)

    nft_list = []
    for nft in nft_data:
        nft_info = nft.get("token", {})
        nft_list.append({
            "name": nft_info.get("name", "Unknown NFT"),
            "image": nft_info.get("image", ""),
            "collection": nft_info.get("collection", {}).get("name", "Unknown Collection"),
            "floor_price": nft_info.get("market", {}).get("floorAsk", {}).get("price", {}).get("amount", {}).get("usd", 0)
        })

    return JsonResponse({"nfts": nft_list})
