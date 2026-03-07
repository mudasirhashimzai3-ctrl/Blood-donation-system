import hashlib

from django.core.cache import cache

from .common import normalize_filters_for_cache


CACHE_TTL_SECONDS = 300


def get_cached_or_build(endpoint: str, filters: dict, *, bypass_cache: bool, builder):
    if bypass_cache:
        return builder(), False

    normalized = normalize_filters_for_cache(filters)
    cache_hash = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
    cache_key = f"reports:{endpoint}:{cache_hash}"

    cached = cache.get(cache_key)
    if cached is not None:
        return cached, True

    payload = builder()
    cache.set(cache_key, payload, timeout=CACHE_TTL_SECONDS)
    return payload, False
