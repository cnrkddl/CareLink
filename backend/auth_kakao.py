# backend/auth_kakao.py
import os, requests
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse

# 🔹 kakao_oauth 임포트: 패키지/단일 실행 둘 다 지원
try:
    from kakao_oauth import (
        KAKAO_API_BASE,
        build_authorize_url,
        exchange_token,
        get_user_profile,
    )
except ImportError:
    from kakao_oauth import (  # type: ignore
        KAKAO_API_BASE,
        build_authorize_url,
        exchange_token,
        get_user_profile,
    )

router = APIRouter(prefix="/auth/kakao", tags=["kakao"])

FRONTEND_REDIRECT_URL = os.getenv("FRONTEND_REDIRECT_URL", "/")
KAKAO_ADMIN_KEY = os.getenv("KAKAO_ADMIN_KEY", "").strip()

# 로컬 개발 기본값
COOKIE_DOMAIN = os.getenv("COOKIE_DOMAIN") or None
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax")  # "lax" | "strict" | "none"

def set_cookie(resp, key, value, max_age=60*60*8, http_only=True):
    resp.set_cookie(
        key=key,
        value=value,
        max_age=max_age,
        httponly=http_only,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        domain=COOKIE_DOMAIN,
    )

def del_cookie(resp, key: str):
    resp.delete_cookie(key=key, domain=COOKIE_DOMAIN)

@router.get("/login")
def login():
    # 필요한 scope 조절 가능: "profile_nickname,account_email"
    url = build_authorize_url(scope="profile_nickname,account_email")
    return RedirectResponse(url)

@router.get("/callback")
def callback(code: str, state: str | None = None):
    try:
        token = exchange_token(code)
        access_token = token.get("access_token")
        refresh_token = token.get("refresh_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="no access_token from kakao")

        profile = get_user_profile(access_token)
        kakao_uid = str(profile.get("id", ""))

        kakao_account = profile.get("kakao_account") or {}
        email = kakao_account.get("email") or ""

        resp = RedirectResponse(FRONTEND_REDIRECT_URL)
        set_cookie(resp, "k_at", access_token, max_age=60*60*8)        # 8시간
        if refresh_token:
            set_cookie(resp, "k_rt", refresh_token, max_age=60*60*24*30)
        if kakao_uid:
            set_cookie(resp, "k_uid", kakao_uid, max_age=60*60*24*30)
        if email:
            set_cookie(resp, "k_email", email, max_age=60*60*24*30)
        return resp
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"kakao callback failed: {e}")

@router.post("/logout")
def logout(request: Request):
    access_token = request.cookies.get("k_at")
    resp = JSONResponse({"ok": True})
    # 쿠키는 항상 정리
    for k in ("k_at", "k_rt", "k_uid", "k_email"):
        del_cookie(resp, k)

    if not access_token:
        return resp

    try:
        r = requests.post(
            f"{KAKAO_API_BASE}/v1/user/logout",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=8,
        )
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"kakao logout failed: {r.text}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"kakao logout failed: {e}")
    return resp

@router.post("/unlink")
def unlink(request: Request):
    access_token = request.cookies.get("k_at")
    kakao_uid = request.cookies.get("k_uid")

    resp = JSONResponse({"ok": True})
    for k in ("k_at", "k_rt", "k_uid", "k_email"):
        del_cookie(resp, k)

    try:
        if access_token:
            r = requests.post(
                f"{KAKAO_API_BASE}/v1/user/unlink",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=8,
            )
        elif KAKAO_ADMIN_KEY and kakao_uid:
            r = requests.post(
                f"{KAKAO_API_BASE}/v1/user/unlink",
                headers={"Authorization": f"KakaoAK {KAKAO_ADMIN_KEY}"},
                data={"target_id_type": "user_id", "target_id": kakao_uid},
                timeout=8,
            )
        else:
            raise HTTPException(status_code=400, detail="no token or user id to unlink")

        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"kakao unlink failed: {r.text}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"kakao unlink failed: {e}")

    return resp

# ✅ (개발용) GET도 임시로 받도록 호환 라우트 추가 — 운영에서는 제거 권장(CSRF 위험)
@router.get("/logout")
def logout_get(request: Request):
    return logout(request)

@router.get("/unlink")
def unlink_get(request: Request):
    return unlink(request)


# auth_kakao.py
@router.get("/whoami")
def whoami(request: Request):
    at = request.cookies.get("k_at")
    email_cookie = request.cookies.get("k_email")
    
    # 📌 데모 로그인 사용자 체크 (k_email만 존재)
    if not at and email_cookie == "demo@carelink.com":
        return JSONResponse({
            "logged_in": True,
            "id": "demo-user-id",
            "email": "demo@carelink.com",
            "nickname": "데모 사용자",
            "profile_image": None,
        })
        
    if not at:
        return JSONResponse({"logged_in": False})
        
    import requests as rq
    r = rq.get(f"{KAKAO_API_BASE}/v2/user/me",
               headers={"Authorization": f"Bearer {at}"}, timeout=8)
    if r.status_code != 200:
        return JSONResponse({"logged_in": False, "error": r.text}, status_code=401)
    prof = r.json()
    
    # 카카오 닉네임과 프로필 이미지 추출
    nickname = None
    profile_image = None
    if prof.get("kakao_account") and prof["kakao_account"].get("profile"):
        profile = prof["kakao_account"]["profile"]
        nickname = profile.get("nickname")
        profile_image = profile.get("profile_image_url")
    
    return JSONResponse({
        "logged_in": True,
        "id": prof.get("id"),
        "email": (prof.get("kakao_account") or {}).get("email"),
        "nickname": nickname,  # 카카오 닉네임
        "profile_image": profile_image,  # 카카오 프로필 이미지
    })