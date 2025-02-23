import os
import json
import requests
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Wallet

COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price"
RESERVOIR_API_URL = "https://api.reservoir.tools/tokens/v6"
RESERVOIR_API_KEY = os.getenv("RESERVOIR_API_KEY", "YOUR-RESERVOIR-API-KEY")

def homepage(request):
    # Landing page with wallet connection
    return render(request, "wallets/homepage.html")

def overview(request):
    # Main dashboard page (Overview)
    # For production, replace dummy context with real data from your APIs
    context = {
        "portfolio_value": 85000,
        "portfolio_growth": 3.2,
    }
    return render(request, "wallets/overview.html", context)

def crypto_allocation(request):
    return render(request, "wallets/crypto_allocation.html")

def nft(request):
    return render(request, "wallets/nft.html")

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
    # Replace this dummy function with real API integration (e.g., Web3 queries)
    balances = get_wallet_balances(wallet_address)
    token_ids = ",".join(balances.keys()).lower()
    response = requests.get(f"{COINGECKO_API_URL}?ids={token_ids}&vs_currencies=usd")
    try:
        price_data = response.json()
    except Exception as e:
        return JsonResponse({"error": f"Failed to fetch prices: {str(e)}"}, status=500)
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

def get_wallet_balances(wallet_address):
    # TODO: Replace with real data fetching logic (e.g., using Web3.py)
    return {"ethereum": 1.2, "solana": 3.5, "usdt": 500}

@csrf_exempt
def fetch_nfts(request):
    wallet_address = request.GET.get("wallet")
    if not wallet_address:
        return JsonResponse({"error": "Wallet address required"}, status=400)
    headers = {
        "accept": "application/json",
        "x-api-key": RESERVOIR_API_KEY
    }
    try:
        response = requests.get(
            f"{RESERVOIR_API_URL}?owner={wallet_address}&limit=10",
            headers=headers
        )
        nft_data = response.json().get("tokens", [])
    except Exception as e:
        return JsonResponse({"error": f"Failed to fetch NFT data: {str(e)}"}, status=500)

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
