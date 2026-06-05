import hashlib
import json
import os
from datetime import timedelta


DEFAULT_CACHE_TTL_SECONDS = int(os.getenv("CHAT_CACHE_TTL_SECONDS", "1800"))
REDIS_URL = os.getenv("REDIS_URL")
_REDIS_CLIENT = None
_REDIS_AVAILABLE = None


def build_cache_key(namespace, payload):
    serialized = json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)
    digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
    return f"{namespace}:{digest}"


def get_redis_client():
    global _REDIS_AVAILABLE, _REDIS_CLIENT

    if _REDIS_AVAILABLE is False or not REDIS_URL:
        return None
    if _REDIS_CLIENT is not None:
        return _REDIS_CLIENT

    try:
        import redis

        _REDIS_CLIENT = redis.Redis.from_url(
            REDIS_URL,
            socket_connect_timeout=0.25,
            socket_timeout=0.5,
            decode_responses=True,
        )
        _REDIS_CLIENT.ping()
        _REDIS_AVAILABLE = True
    except Exception:
        _REDIS_AVAILABLE = False
        _REDIS_CLIENT = None

    return _REDIS_CLIENT


def get_json_cache(key):
    client = get_redis_client()
    if client is None:
        return None

    try:
        value = client.get(key)
    except Exception:
        return None

    if not value:
        return None

    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return None


def set_json_cache(key, value, ttl_seconds=DEFAULT_CACHE_TTL_SECONDS):
    client = get_redis_client()
    if client is None:
        return False

    try:
        client.setex(key, timedelta(seconds=ttl_seconds), json.dumps(value))
    except Exception:
        return False

    return True
