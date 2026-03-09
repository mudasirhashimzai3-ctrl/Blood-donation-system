import json
import os
from copy import deepcopy
from typing import Any

from django.conf import settings as django_settings
from django.core import signing
from django.core.cache import cache

from core.models import SettingAuditLog, Settings
from core.permissions import _user_has_permission

from .settings_defaults import (
    ENV_OVERRIDE_RULES,
    LIVE_SECTIONS,
    SECTION_DEFAULTS,
    SECTION_META,
    SECRET_FIELDS_BY_SECTION,
    SETTINGS_SECTION_KEYS,
    get_default_section_payload,
)

CACHE_TTL_SECONDS = 300
ENCRYPTED_PREFIX = "enc::"
SIGNING_SALT = "core.settings.secret"


class UnknownSettingsSectionError(ValueError):
    pass


def _cache_key(section: str) -> str:
    return f"core.settings.section.{section}"


def _safe_json_load(raw: Any) -> dict:
    if isinstance(raw, dict):
        return raw
    if not raw:
        return {}
    if isinstance(raw, str):
        try:
            value = json.loads(raw)
            return value if isinstance(value, dict) else {}
        except json.JSONDecodeError:
            return {}
    return {}


def encrypt_secret(value: str) -> str:
    if value is None:
        return ""
    text = str(value)
    if not text:
        return ""
    payload = signing.dumps(text, salt=SIGNING_SALT)
    return f"{ENCRYPTED_PREFIX}{payload}"


def decrypt_secret(value: Any) -> str:
    if value is None:
        return ""
    text = str(value)
    if not text:
        return ""
    if not text.startswith(ENCRYPTED_PREFIX):
        return text

    token = text[len(ENCRYPTED_PREFIX) :]
    try:
        decoded = signing.loads(token, salt=SIGNING_SALT)
    except signing.BadSignature:
        return ""

    return str(decoded)


def _mask_secret(value: str) -> str:
    if not value:
        return ""
    if len(value) <= 4:
        return "*" * len(value)
    return f"{value[:2]}{'*' * (len(value) - 4)}{value[-2:]}"


def _read_env_override(env_key: str, caster: type):
    value = os.getenv(env_key)
    if value in (None, ""):
        value = getattr(django_settings, env_key, None)

    if value in (None, ""):
        return None

    try:
        return caster(value)
    except (TypeError, ValueError):
        return None


def _ensure_known_section(section: str):
    if section not in SETTINGS_SECTION_KEYS:
        raise UnknownSettingsSectionError(f"Unknown section: {section}")


def _load_stored_payload(section: str) -> tuple[dict, Any]:
    _ensure_known_section(section)

    cached = cache.get(_cache_key(section))
    if cached is not None:
        return cached

    setting_key = SETTINGS_SECTION_KEYS[section]
    setting = Settings.objects.filter(setting_key=setting_key).first()
    if not setting:
        payload = ({}, None)
        cache.set(_cache_key(section), payload, CACHE_TTL_SECONDS)
        return payload

    payload = _safe_json_load(setting.setting_value)
    response = (payload, setting.updated_at)
    cache.set(_cache_key(section), response, CACHE_TTL_SECONDS)
    return response


def invalidate_section_cache(section: str):
    cache.delete(_cache_key(section))


def _apply_runtime_resolvers(section: str, payload: dict) -> dict:
    resolved = deepcopy(payload)

    for secret_field in SECRET_FIELDS_BY_SECTION.get(section, []):
        resolved[secret_field] = decrypt_secret(resolved.get(secret_field, ""))

    for field, (env_key, caster) in ENV_OVERRIDE_RULES.get(section, {}).items():
        override_value = _read_env_override(env_key, caster)
        if override_value is not None:
            resolved[field] = override_value

    return resolved


def _sanitize_public_payload(section: str, payload: dict) -> dict:
    public_payload = deepcopy(payload)

    for secret_field in SECRET_FIELDS_BY_SECTION.get(section, []):
        secret_value = public_payload.get(secret_field, "") or ""
        public_payload[f"has_{secret_field}"] = bool(secret_value)
        public_payload[f"{secret_field}_masked"] = _mask_secret(secret_value) if secret_value else None
        public_payload[secret_field] = ""

    return public_payload


def _persist_section_payload(section: str, payload: dict):
    setting_key = SETTINGS_SECTION_KEYS[section]
    Settings.set_setting(
        key=setting_key,
        value=json.dumps(payload),
        setting_type="json",
        category="general",
        description=f"Structured settings for {section}",
    )
    invalidate_section_cache(section)


def can_user_edit_settings(user) -> bool:
    if not user or not user.is_authenticated:
        return False
    return _user_has_permission(user, "settings", "change")


def is_live_section(section: str) -> bool:
    return section in LIVE_SECTIONS


def get_section_meta(section: str) -> dict:
    _ensure_known_section(section)
    return deepcopy(SECTION_META[section])


def get_section_last_updated(section: str):
    _ensure_known_section(section)
    _, updated_at = _load_stored_payload(section)
    return updated_at


def get_runtime_section_payload(section: str) -> dict:
    _ensure_known_section(section)
    defaults = get_default_section_payload(section)
    stored_payload, _ = _load_stored_payload(section)

    merged = {**defaults, **stored_payload}
    return _apply_runtime_resolvers(section, merged)


def get_public_section_payload(section: str) -> dict:
    runtime_payload = get_runtime_section_payload(section)
    return _sanitize_public_payload(section, runtime_payload)


def _build_persisted_payload(section: str, updates: dict) -> dict:
    defaults = get_default_section_payload(section)
    stored_payload, _ = _load_stored_payload(section)
    payload_to_store = {**defaults, **stored_payload}

    secret_fields = set(SECRET_FIELDS_BY_SECTION.get(section, []))

    for key, value in updates.items():
        if key not in defaults:
            continue

        if key in secret_fields:
            if value is None:
                payload_to_store[key] = ""
            elif value == "":
                continue
            else:
                payload_to_store[key] = encrypt_secret(str(value))
            continue

        payload_to_store[key] = value

    return payload_to_store


def _get_client_ip(request):
    if not request:
        return None
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def _write_audit_log(section: str, old_value: dict, new_value: dict, user=None, request=None):
    SettingAuditLog.objects.create(
        section=section,
        old_value=old_value,
        new_value=new_value,
        changed_by=user if getattr(user, "is_authenticated", False) else None,
        ip_address=_get_client_ip(request),
        user_agent=(request.META.get("HTTP_USER_AGENT", "") if request else ""),
    )


def update_section(section: str, updates: dict, *, user=None, request=None) -> dict:
    _ensure_known_section(section)
    old_public = get_public_section_payload(section)
    payload_to_store = _build_persisted_payload(section, updates)
    _persist_section_payload(section, payload_to_store)
    new_public = get_public_section_payload(section)
    _write_audit_log(section, old_public, new_public, user=user, request=request)
    return new_public


def get_overview_sections_payload() -> dict:
    sections = {}
    for section in SETTINGS_SECTION_KEYS:
        sections[section] = {
            "data": get_public_section_payload(section),
            "meta": {
                **get_section_meta(section),
                "last_updated": (
                    get_section_last_updated(section).isoformat()
                    if get_section_last_updated(section)
                    else None
                ),
            },
        }
    return sections


def get_runtime_notification_settings() -> dict:
    return get_runtime_section_payload("notifications")


def get_runtime_security_settings() -> dict:
    return get_runtime_section_payload("security")
