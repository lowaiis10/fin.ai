import os
import json
import requests
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import Wallet

COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price"
RESERVOIR_API_URL = "https://api.reservoir.tools/tokens/v6"
RESERVOIR_API_KEY = os.getenv("RESERVOIR_API_KEY", "YOUR-RESERVOIR-API-KEY")

HEADERS = {
    "accept": "application/json",
    "x-api-key": RESERVOIR_API_KEY
}

def homepage(request):
    return render(request, "wallets/homepage.html")

def dashboard(request):
    return render(request, "wallets/dashboard.html")

def disconnect_wallet(request):
    request.session.flush()
    return redirect("homepage")

@csrf_exempt
def save_wallet(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            address = data.get("address")
            wallet_type = data.get("wallet_type")
        except json.JSONDecodeError:
            address = request.POST.get("address")
            wallet_type = request.POST.get("wallet_type")

        if not address or not wallet_type:
            return JsonResponse({"success": False, "error": "Invalid data"}, status=400)

        if "wallets" not in request.session:
            request.session["wallets"] = []

        if not any(w["address"] == address for w in request.session["wallets"]):
            request.session["wallets"].append({"address": address, "wallet_type": wallet_type})
            request.session.modified = True
            wallet, created = Wallet.objects.get_or_create(address=address, wallet_type=wallet_type)
            return JsonResponse({"success": True, "message": "Wallet connected", "new": created})
        else:
            return JsonResponse({"success": True, "message": "Wallet already connected", "new": False})
    return JsonResponse({"success": False, "error": "Invalid request"}, status=400)

@csrf_exempt
def fetch_prices(request):
    wallet_address = request.GET.get("wallet")
    if not wallet_address:
        return JsonResponse({"error": "Wallet address required"}, status=400)
    # Dummy balance function
    balances = {"ethereum": 1.2, "solana": 3.5, "usdt": 500}
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

@csrf_exempt
def fetch_nfts(request):
    wallet_address = request.GET.get("wallet")
    if not wallet_address:
        return JsonResponse({"error": "Wallet address required"}, status=400)
    try:
        response = requests.get(
            f"{RESERVOIR_API_URL}?owner={wallet_address}&limit=10",
            headers=HEADERS
        )
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
