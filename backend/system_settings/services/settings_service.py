import json
from copy import deepcopy

from core.models import Settings
from system_settings.constants import (
    SECTION_CATEGORIES,
    SECTION_DEFAULTS,
    SECTION_KEYS,
    SENSITIVE_FIELDS_BY_SECTION,
)
from system_settings.models import SystemSettingsAuditLog


def _get_setting_row(section):
    key = SECTION_KEYS[section]
    return Settings.objects.filter(setting_key=key).first()


def _read_raw_section(section):
    setting = _get_setting_row(section)
    if not setting:
        return deepcopy(SECTION_DEFAULTS[section])

    if setting.setting_type != "json":
        return deepcopy(SECTION_DEFAULTS[section])

    try:
        value = setting.get_typed_value()
    except (TypeError, ValueError, json.JSONDecodeError):
        return deepcopy(SECTION_DEFAULTS[section])

    if not isinstance(value, dict):
        return deepcopy(SECTION_DEFAULTS[section])

    merged = deepcopy(SECTION_DEFAULTS[section])
    merged.update(value)
    return merged


def mask_sensitive_values(section, data):
    masked = deepcopy(data)
    for field_name in SENSITIVE_FIELDS_BY_SECTION.get(section, []):
        if field_name in masked:
            masked[field_name] = None
    return masked


def get_section(section, mask_sensitive=False):
    data = _read_raw_section(section)
    if mask_sensitive:
        return mask_sensitive_values(section, data)
    return data


def _write_section(section, payload):
    key = SECTION_KEYS[section]
    Settings.set_setting(
        key=key,
        value=json.dumps(payload),
        setting_type="json",
        category=SECTION_CATEGORIES[section],
        description=f"System settings section: {section}",
    )


def update_section(section, payload, user=None, ip_address=None, user_agent=""):
    current = _read_raw_section(section)
    updated = deepcopy(current)
    updated.update(payload)

    # Keep existing secrets when payload sends blank value.
    for field_name in SENSITIVE_FIELDS_BY_SECTION.get(section, []):
        if field_name in payload and payload[field_name] in [None, ""]:
            updated[field_name] = current.get(field_name, "")

    _write_section(section, updated)

    SystemSettingsAuditLog.objects.create(
        section=section,
        old_value=current,
        new_value=updated,
        changed_by=user,
        ip_address=ip_address,
        user_agent=user_agent or "",
        reset_to_default=False,
    )

    return updated


def reset_section(section, user=None, ip_address=None, user_agent=""):
    current = _read_raw_section(section)
    defaults = deepcopy(SECTION_DEFAULTS[section])
    _write_section(section, defaults)

    SystemSettingsAuditLog.objects.create(
        section=section,
        old_value=current,
        new_value=defaults,
        changed_by=user,
        ip_address=ip_address,
        user_agent=user_agent or "",
        reset_to_default=True,
    )

    return defaults
