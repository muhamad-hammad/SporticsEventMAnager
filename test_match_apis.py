"""
Test script for LOG Match and Leaderboard APIs
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

# Replace with actual tokens
ADMIN_TOKEN = "YOUR_ADMIN_TOKEN_HERE"
USER_TOKEN = "YOUR_USER_TOKEN_HERE"

def get_headers(token):
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

def test_create_match():
    """Test creating a new match (admin only)"""
    print("\n=== TEST: Create Match ===")
    url = f"{BASE_URL}/log/admin/matches/create/"
    
    data = {
        "sport": 1,  # Replace with actual sport ID
        "team1": 1,  # Replace with actual house ID
        "team2": 2,  # Replace with actual house ID
        "match_date": "2025-02-15T14:00:00Z",
        "venue": "Main Field"
    }
    
    response = requests.post(url, json=data, headers=get_headers(ADMIN_TOKEN))
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.json()

def test_list_matches():
    """Test listing all matches (admin only)"""
    print("\n=== TEST: List Matches ===")
    url = f"{BASE_URL}/log/admin/matches/"
    
    response = requests.get(url, headers=get_headers(ADMIN_TOKEN))
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_update_match_result(match_id):
    """Test updating match result (admin only)"""
    print(f"\n=== TEST: Update Match Result (ID: {match_id}) ===")
    url = f"{BASE_URL}/log/admin/matches/{match_id}/result/"
    
    data = {
        "team1_score": 3,
        "team2_score": 2
    }
    
    response = requests.post(url, json=data, headers=get_headers(ADMIN_TOKEN))
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_get_schedule():
    """Test getting match schedule (all users)"""
    print("\n=== TEST: Get Schedule ===")
    url = f"{BASE_URL}/log/schedule/"
    
    response = requests.get(url, headers=get_headers(USER_TOKEN))
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_get_leaderboard():
    """Test getting leaderboard (all users)"""
    print("\n=== TEST: Get Leaderboard ===")
    url = f"{BASE_URL}/log/leaderboard/"
    
    response = requests.get(url, headers=get_headers(USER_TOKEN))
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_get_leaderboard_by_sport(sport_id):
    """Test getting leaderboard for specific sport (all users)"""
    print(f"\n=== TEST: Get Leaderboard by Sport (ID: {sport_id}) ===")
    url = f"{BASE_URL}/log/leaderboard/{sport_id}/"
    
    response = requests.get(url, headers=get_headers(USER_TOKEN))
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    print("LOG Match & Leaderboard API Tests")
    print("==================================")
    print("\nIMPORTANT: Update ADMIN_TOKEN and USER_TOKEN before running!")
    print("\nTo get tokens:")
    print("1. POST to /api/auth/jwt/create/ with username/password")
    print("2. Copy the 'access' token from response")
    
    # Uncomment to run tests:
    # match = test_create_match()
    # test_list_matches()
    # test_update_match_result(match['id'])
    # test_get_schedule()
    # test_get_leaderboard()
    # test_get_leaderboard_by_sport(1)
