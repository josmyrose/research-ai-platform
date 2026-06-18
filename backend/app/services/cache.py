import hashlib
import json
import os
import time
from datetime import timedelta
from threading import Lock


DEFAULT_CACHE_TTL_SECONDS = int(os.getenv("CHAT_CACHE_TTL_SECONDS", "1800"))
MEMORY_CACHE_MAX_ITEMS = int(os.getenv("MEMORY_CACHE_MAX_ITEMS", "512"))
REDIS_URL = os.getenv("REDIS_URL")
_REDIS_CLIENT = None
_REDIS_AVAILABLE = None
_MEMORY_CACHE = {}
_MEMORY_CACHE_LOCK = Lock()


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


def _get_memory_cache(key):
    now = time.time()
    with _MEMORY_CACHE_LOCK:
        cached = _MEMORY_CACHE.get(key)
        if not cached:
            return None

        expires_at, value = cached
        if expires_at <= now:
            _MEMORY_CACHE.pop(key, None)
            return None

        return value


def _set_memory_cache(key, value, ttl_seconds):
    now = time.time()
    expires_at = now + ttl_seconds
    with _MEMORY_CACHE_LOCK:
        if len(_MEMORY_CACHE) >= MEMORY_CACHE_MAX_ITEMS:
            oldest_key = min(_MEMORY_CACHE, key=lambda cache_key: _MEMORY_CACHE[cache_key][0])
            _MEMORY_CACHE.pop(oldest_key, None)

        _MEMORY_CACHE[key] = (expires_at, value)


def get_json_cache(key):
    client = get_redis_client()
    if client is None:
        return _get_memory_cache(key)

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
        _set_memory_cache(key, value, ttl_seconds)
        return True

    try:
        client.setex(key, timedelta(seconds=ttl_seconds), json.dumps(value))
    except Exception:
        return False

    return True
