## Settings Module Plan (React TS + Tailwind v4 + Django DRF)

### 1) Goal
Build a production-grade `settings` module for the Blood Donation System with modular backend and frontend architecture.

This module must cover:
- System General Settings
- User & Role Management Settings
- Notification Settings (Email / SMS / In-App)
- Emergency Alert Settings
- Blood Request Rules
- Donor Eligibility Rules
- Auto Matching Settings
- Language & Timezone Settings
- Security Settings (Password / Access)
- Other required operational settings

---

### 2) Current Project Alignment
- Backend already has a generic `core.Settings` model and `/core/settings/*` endpoints.
- Frontend already has `src/modules/settings` but currently not fully folder-modular.
- Recommended: keep backward compatibility with existing endpoints while migrating to structured section-based settings.

---

### 3) Backend Plan (Django DRF)

#### 3.1 App Structure
Use a dedicated modular app for settings domain.

```txt
backend/system_settings/
  __init__.py
  apps.py
  models.py
  urls.py
  views.py
  serializers.py
  selectors.py
  services/
    __init__.py
    settings_service.py
    validation_service.py
    encryption_service.py
    notification_test_service.py
    audit_service.py
  permissions.py
  constants.py
  tests/
    test_general_settings.py
    test_user_role_settings.py
    test_notification_settings.py
    test_emergency_alert_settings.py
    test_blood_request_rules.py
    test_donor_eligibility_rules.py
    test_auto_matching_settings.py
    test_language_timezone_settings.py
    test_security_settings.py
    test_permissions.py
    test_audit_log.py
  migrations/
```

If you prefer minimal migration, keep data in `core.Settings` and use namespaced keys.

#### 3.2 Data Strategy
Store each section as JSON setting object (one key per section) using existing `core.Settings`:
- `settings.general`
- `settings.user_roles`
- `settings.notifications`
- `settings.emergency_alerts`
- `settings.blood_request_rules`
- `settings.donor_eligibility`
- `settings.auto_matching`
- `settings.localization`
- `settings.security`

Also add:
- `system_settings_audit_log` table for immutable change history
- Optional `is_encrypted` handling for sensitive fields (SMTP password, SMS secrets)

#### 3.3 API Endpoints
Base: `/api/system-settings/`

- `GET/PUT general/`
- `GET/PUT user-roles/`
- `GET/PUT notifications/`
- `POST notifications/test-email/`
- `POST notifications/test-sms/`
- `GET/PUT emergency-alerts/`
- `GET/PUT blood-request-rules/`
- `GET/PUT donor-eligibility/`
- `GET/PUT auto-matching/`
- `GET/PUT localization/`
- `GET/PUT security/`
- `GET audit-logs/`
- `POST reset-section/` (reset one section to defaults)

Backward compatibility bridge:
- keep `/core/settings/shop`, `/core/settings/email`, `/core/settings/logo`
- progressively map them into `settings.general` and `settings.notifications`

#### 3.4 Permissions
Use role/permission actions consistent with your `Permission` model:
- `settings.view`
- `settings.change`
- `settings.change_security`
- `settings.change_user_roles`
- `settings.change_emergency`
- `settings.view_audit`

Recommendation:
- `admin`: full access
- `receptionist`: view-only for most settings
- `viewer`: no access (or strictly read-only based on policy)

#### 3.5 Validation Rules (Core Examples)
- `notifications.email.smtp_port` in `1..65535`
- `blood_request_rules.max_units_per_request` > 0
- `donor_eligibility.min_age >= 18`
- `donor_eligibility.min_gap_days >= 56` (or your policy)
- `auto_matching.max_distance_km > 0`
- `security.password_min_length >= 8`
- `security.max_login_attempts >= 3`
- `localization.default_timezone` must be valid IANA timezone

#### 3.6 Audit & Compliance
On every setting update:
- record `section`
- `old_value`
- `new_value`
- `changed_by`
- `changed_at`
- `ip_address`
- `user_agent`

---

### 4) Frontend Plan (React TS + Tailwind v4)

#### 4.1 Required Folder Structure
Refactor `frontend/src/modules/settings` to:

```txt
frontend/src/modules/settings/
  pages/
    SettingsOverviewPage.tsx
    GeneralSettingsPage.tsx
    UserRoleSettingsPage.tsx
    NotificationSettingsPage.tsx
    EmergencyAlertSettingsPage.tsx
    BloodRequestRulesPage.tsx
    DonorEligibilityRulesPage.tsx
    AutoMatchingSettingsPage.tsx
    LanguageTimezoneSettingsPage.tsx
    SecuritySettingsPage.tsx
  components/
    SettingsSectionCard.tsx
    SettingsSaveBar.tsx
    SettingsAuditDrawer.tsx
    GeneralSettingsForm.tsx
    UserRoleSettingsForm.tsx
    NotificationSettingsForm.tsx
    EmergencyAlertSettingsForm.tsx
    BloodRequestRulesForm.tsx
    DonorEligibilityRulesForm.tsx
    AutoMatchingSettingsForm.tsx
    LanguageTimezoneSettingsForm.tsx
    SecuritySettingsForm.tsx
    TestChannelButtons.tsx
  hooks/
    useSettingsSection.ts
    useSettingsPermissions.ts
    useSettingsDirtyState.ts
    useSettingsNavigation.ts
  stores/
    useSettingsUiStore.ts
  schemas/
    generalSettings.schema.ts
    userRoleSettings.schema.ts
    notificationSettings.schema.ts
    emergencyAlertSettings.schema.ts
    bloodRequestRules.schema.ts
    donorEligibilityRules.schema.ts
    autoMatchingSettings.schema.ts
    localizationSettings.schema.ts
    securitySettings.schema.ts
  queries/
    settingsKeys.ts
    useGeneralSettings.ts
    useUserRoleSettings.ts
    useNotificationSettings.ts
    useEmergencyAlertSettings.ts
    useBloodRequestRules.ts
    useDonorEligibilityRules.ts
    useAutoMatchingSettings.ts
    useLocalizationSettings.ts
    useSecuritySettings.ts
    useSettingsAuditLogs.ts
  services/
    settingsService.ts
  types/
    settings.types.ts
    settings-api.types.ts
  index.ts
```

#### 4.2 Route Plan
Add routes (inside existing protected app):
- `/settings`
- `/settings/general`
- `/settings/user-roles`
- `/settings/notifications`
- `/settings/emergency-alerts`
- `/settings/blood-request-rules`
- `/settings/donor-eligibility`
- `/settings/auto-matching`
- `/settings/localization`
- `/settings/security`

#### 4.3 State Strategy
- Server state: React Query
- UI-only state (active tab, unsaved changes, section expansion): Zustand
- Forms/validation: `react-hook-form + zod`

#### 4.4 UX Behavior
- Save per section
- Dirty-state warning before navigation
- Inline validation messages
- Test email/SMS buttons in Notification settings
- Role-based field disable/hide
- Last updated info + changed by metadata

---

### 5) Settings Section Fields (Initial Contract)

#### 5.1 General Settings
- organization_name
- support_email
- support_phone
- address
- logo_url
- default_country
- maintenance_mode

#### 5.2 User & Role Management Settings
- allow_user_invite
- default_new_user_role
- allow_role_editing
- allow_self_profile_edit
- enforce_2fa_for_admin

#### 5.3 Notification Settings
- email_enabled
- email_provider
- smtp_host
- smtp_port
- smtp_username
- smtp_password
- sms_enabled
- sms_provider
- sms_sender_id
- in_app_enabled
- notification_retention_days

#### 5.4 Emergency Alert Settings
- emergency_mode_enabled
- escalation_levels
- auto_notify_nearby_donors
- donor_radius_km
- hospital_broadcast_enabled
- alert_throttle_minutes

#### 5.5 Blood Request Rules
- max_units_per_request
- require_medical_report
- auto_expire_hours
- allow_duplicate_active_request
- verification_required_for_critical

#### 5.6 Donor Eligibility Rules
- min_age
- max_age
- min_weight_kg
- min_gap_days_between_donations
- hemoglobin_min
- block_if_recent_infection_days

#### 5.7 Auto Matching Settings
- enabled
- max_distance_km
- prioritize_rare_blood_groups
- prioritize_recently_active_donors
- max_candidates_to_notify
- retry_interval_minutes

#### 5.8 Language & Timezone Settings
- default_language
- supported_languages
- default_timezone
- date_format
- time_format_24h
- first_day_of_week

#### 5.9 Security Settings
- password_min_length
- password_require_uppercase
- password_require_number
- password_require_special_char
- password_expiry_days
- max_login_attempts
- lockout_minutes
- session_timeout_minutes
- force_logout_on_password_change

---

### 6) Other Required Features
- Settings export/import (JSON with schema version)
- Settings versioning with rollback
- Audit log viewer in frontend
- Environment lock for critical production keys
- Feature flags (toggle beta functions safely)
- Health checks for SMTP/SMS providers
- Safe defaults + reset-to-default action

---

### 7) Phased Delivery Plan

#### Phase 1 (Foundation)
- Create `system_settings` backend app and base endpoints.
- Add frontend folder structure and types/services/queries skeleton.
- Add settings overview page + route registration.

#### Phase 2 (Core Sections)
- Implement: General, Notification, Localization, Security.
- Add zod schemas and complete forms.
- Add backend validation and permissions.

#### Phase 3 (Domain Rules)
- Implement: Emergency Alerts, Blood Request Rules, Donor Eligibility, Auto Matching.
- Wire rules to blood request and donor matching services.

#### Phase 4 (Admin & Compliance)
- Implement User/Role settings controls.
- Implement audit logs UI + rollback + export/import.

#### Phase 5 (Hardening)
- Full test coverage, permission edge cases, race conditions.
- Performance checks and caching for read endpoints.

---

### 8) Integration Notes For Existing Files
- `backend/manage.py`: use for app creation, migrations, seed commands.
- `frontend/src/App.tsx`: no major change needed; routes are controlled in router provider.
- Update `frontend/src/providers/AppRouterProvider.tsx` to include all settings routes.
- Replace current flat `src/modules/settings/*.tsx` files with folder-based module pages/components.

---

### 9) Definition of Done
- All settings sections are editable via dedicated pages.
- Backend validates and persists each section correctly.
- Role-based permissions are enforced.
- Sensitive values are protected (masked/encrypted where needed).
- Audit log exists for every setting change.
- Frontend follows required modular folder structure.
- Tests pass for API, permissions, and core form validations.
