# kakao_oauth.py
import os
import requests
from typing import Dict, Any, Optional
from dotenv import load_dotenv, find_dotenv

# .env 로딩 강화 (루트/백엔드 등 어디 있어도 찾아서 로드)
load_dotenv(find_dotenv())

KAKAO_AUTH_BASE = "https://kauth.kakao.com"
KAKAO_API_BASE  = "https://kapi.kakao.com"

KAKAO_REST_KEY = os.getenv("KAKAO_REST_KEY", "").strip()
KAKAO_REDIRECT_URI = os.getenv("KAKAO_REDIRECT_URI", "").strip()
# 🔸 콘솔에서 Secret 사용이 "켜짐"일 때만 값이 있어야 함. 꺼짐이면 이 값은 비어 있어야 함.
KAKAO_CLIENT_SECRET = os.getenv("KAKAO_CLIENT_SECRET", "").strip()

if not KAKAO_REST_KEY:
    raise RuntimeError("KAKAO_REST_KEY 가 .env에 설정되어 있지 않습니다.")
if not KAKAO_REDIRECT_URI:
    raise RuntimeError("KAKAO_REDIRECT_URI 가 .env에 설정되어 있지 않습니다.")

def build_authorize_url(state: Optional[str] = None, scope: Optional[str] = None) -> str:
    """
    카카오 인가(로그인) URL 생성
    """
    from urllib.parse import urlencode
    params = {
        "client_id": KAKAO_REST_KEY,
        "redirect_uri": KAKAO_REDIRECT_URI,  # ✅ 콘솔 등록값과 100% 동일해야 함
        "response_type": "code",
    }
    if state:
        params["state"] = state
    if scope:
        params["scope"] = scope  # 예: "profile_nickname,account_email"
    return f"{KAKAO_AUTH_BASE}/oauth/authorize?{urlencode(params)}"

def exchange_token(code: str) -> Dict[str, Any]:
    """
    인가코드(code) → 액세스 토큰 교환
    """
    url = f"{KAKAO_AUTH_BASE}/oauth/token"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
    }
    data = {
        "grant_type": "authorization_code",
        "client_id": KAKAO_REST_KEY,
        "redirect_uri": KAKAO_REDIRECT_URI,  # ✅ 인가요청 때의 redirect_uri와 동일해야 함
        "code": code,
    }
    # 🔸 콘솔에서 "Client Secret 사용"이 켜져 있으면 반드시 포함,
    #    꺼져 있으면 절대로 보내지 말아야 함(빈 값도 금지)
    if KAKAO_CLIENT_SECRET:
        data["client_secret"] = KAKAO_CLIENT_SECRET

    r = requests.post(url, headers=headers, data=data, timeout=10)
    if r.status_code != 200:
        # ✅ 실패 원인 로깅 (invalid_client / invalid_grant / misconfigured 등)
        print("[KAKAO TOKEN ERROR]", r.status_code, r.text)
    r.raise_for_status()
    return r.json()

def refresh_token(refresh_token: str) -> Dict[str, Any]:
    """
    리프레시 토큰으로 액세스 토큰 재발급
    """
    url = f"{KAKAO_AUTH_BASE}/oauth/token"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
    }
    data = {
        "grant_type": "refresh_token",
        "client_id": KAKAO_REST_KEY,
        "refresh_token": refresh_token,
    }
    if KAKAO_CLIENT_SECRET:
        data["client_secret"] = KAKAO_CLIENT_SECRET
    r = requests.post(url, headers=headers, data=data, timeout=10)
    if r.status_code != 200:
        print("[KAKAO REFRESH ERROR]", r.status_code, r.text)
    r.raise_for_status()
    return r.json()

def get_user_profile(access_token: str) -> Dict[str, Any]:
    """
    액세스 토큰으로 사용자 정보 조회
    """
    url = f"{KAKAO_API_BASE}/v2/user/me"
    headers = { "Authorization": f"Bearer {access_token}" }
    r = requests.get(url, headers=headers, timeout=10)
    if r.status_code != 200:
        print("[KAKAO PROFILE ERROR]", r.status_code, r.text)
    r.raise_for_status()
    return r.json()
