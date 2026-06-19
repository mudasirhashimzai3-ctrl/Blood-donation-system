SUPPORTED_LANGUAGES = {"en", "da", "pa"}
DEFAULT_LANGUAGE = "en"


LABELS = {
    "en": {
        "normal": "normal",
        "urgent": "urgent",
        "critical": "critical",
        "pending": "pending",
        "matched": "matched",
        "completed": "completed",
        "cancelled": "cancelled",
        "accepted": "accepted",
        "declined": "declined",
        "expired": "expired",
        "true": "true",
        "false": "false",
    },
    "da": {
        "normal": "عادی",
        "urgent": "فوری",
        "critical": "بحرانی",
        "pending": "در انتظار",
        "matched": "مطابقت‌شده",
        "completed": "تکمیل‌شده",
        "cancelled": "لغو‌شده",
        "accepted": "قبول‌شده",
        "declined": "رد‌شده",
        "expired": "منقضی‌شده",
        "true": "بلی",
        "false": "نخیر",
    },
    "pa": {
        "normal": "عادي",
        "urgent": "بیړنی",
        "critical": "بحراني",
        "pending": "په انتظار",
        "matched": "برابر شوی",
        "completed": "بشپړ شوی",
        "cancelled": "لغوه شوی",
        "accepted": "منل شوی",
        "declined": "رد شوی",
        "expired": "پای ته رسېدلی",
        "true": "هو",
        "false": "نه",
    },
}


TEMPLATES = {
    "en": {
        "notification.blood_request_created.title": "Blood request #{request_id} created",
        "notification.blood_request_created.message": "Recipient {recipient_name} created a {request_type} request.",
        "notification.blood_request_completed.title": "Blood request #{request_id} completed",
        "notification.blood_request_completed.message": "Blood request #{request_id} has been marked completed.",
        "notification.blood_request_cancelled.title": "Blood request #{request_id} cancelled",
        "notification.blood_request_cancelled.message": "Blood request #{request_id} was cancelled by {cancelled_by}.",
        "notification.blood_request_verified.title": "Verification updated for request #{request_id}",
        "notification.blood_request_verified.message": "Blood request #{request_id} is verified automatically.",
        "notification.matched_donor.title": "New blood request #{request_id}",
        "notification.matched_donor.message": "A {request_type} request for blood group {blood_group} is available near {hospital_name}.",
        "notification.request_assigned.title": "Donor accepted request #{request_id}",
        "notification.request_assigned.message": "Donor {donor_name} accepted blood request #{request_id}.",
        "notification.request_fulfilled.title": "Blood request #{request_id} already assigned",
        "notification.request_fulfilled.message": "Blood request #{request_id} has already been assigned to another donor. No further action is needed.",
        "notification.donation_status_updated.title": "Donation #{donation_id} status updated",
        "notification.donation_status_updated.message": "Donation #{donation_id} changed to {status}.",
        "notification.donation_completed.title": "Donation #{donation_id} completed",
        "notification.donation_completed.message": "Donation #{donation_id} has been marked completed.",
        "notification.donation_primary_changed.title": "Primary donor updated for request #{request_id}",
        "notification.donation_primary_changed.message": "Donation #{donation_id} primary flag set to {is_primary}.",
        "notification.donation_reminder.title": "Reminder sent for donation #{donation_id}",
        "notification.donation_reminder.message": "Reminder dispatched for donation #{donation_id}.",
        "notification.account_locked.title": "Account locked",
        "notification.account_locked.message": "Your account has been locked due to multiple failed login attempts.",
        "notification.password_reset_code_sent.title": "Password reset code sent",
        "notification.password_reset_code_sent.message": "A password reset verification code has been issued for your account.",
        "notification.email_verified.title": "Email verified",
        "notification.email_verified.message": "Your email address has been verified successfully.",
    },
    "da": {
        "notification.blood_request_created.title": "درخواست خون شماره {request_id} ایجاد شد",
        "notification.blood_request_created.message": "دریافت‌کننده {recipient_name} یک درخواست {request_type} ایجاد کرد.",
        "notification.blood_request_completed.title": "درخواست خون شماره {request_id} تکمیل شد",
        "notification.blood_request_completed.message": "درخواست خون شماره {request_id} به‌عنوان تکمیل‌شده ثبت شد.",
        "notification.blood_request_cancelled.title": "درخواست خون شماره {request_id} لغو شد",
        "notification.blood_request_cancelled.message": "درخواست خون شماره {request_id} توسط {cancelled_by} لغو شد.",
        "notification.blood_request_verified.title": "تایید درخواست شماره {request_id} به‌روزرسانی شد",
        "notification.blood_request_verified.message": "درخواست خون شماره {request_id} به‌صورت خودکار تایید شد.",
        "notification.matched_donor.title": "درخواست خون جدید شماره {request_id}",
        "notification.matched_donor.message": "یک درخواست {request_type} برای گروه خون {blood_group} نزدیک {hospital_name} موجود است.",
        "notification.request_assigned.title": "اهداکننده درخواست شماره {request_id} را قبول کرد",
        "notification.request_assigned.message": "اهداکننده {donor_name} درخواست خون شماره {request_id} را قبول کرد.",
        "notification.request_fulfilled.title": "درخواست خون شماره {request_id} قبلا تعیین شده است",
        "notification.request_fulfilled.message": "درخواست خون شماره {request_id} قبلا به اهداکننده دیگری تعیین شده است. اقدام بیشتری لازم نیست.",
        "notification.donation_status_updated.title": "وضعیت اهدای شماره {donation_id} به‌روزرسانی شد",
        "notification.donation_status_updated.message": "اهدای شماره {donation_id} به {status} تغییر کرد.",
        "notification.donation_completed.title": "اهدای شماره {donation_id} تکمیل شد",
        "notification.donation_completed.message": "اهدای شماره {donation_id} به‌عنوان تکمیل‌شده ثبت شد.",
        "notification.donation_primary_changed.title": "اهداکننده اصلی برای درخواست شماره {request_id} به‌روزرسانی شد",
        "notification.donation_primary_changed.message": "نشان اصلی اهدای شماره {donation_id} به {is_primary} تنظیم شد.",
        "notification.donation_reminder.title": "یادآوری برای اهدای شماره {donation_id} ارسال شد",
        "notification.donation_reminder.message": "یادآوری برای اهدای شماره {donation_id} ارسال شد.",
        "notification.account_locked.title": "حساب قفل شد",
        "notification.account_locked.message": "حساب شما به دلیل چندین تلاش ناموفق ورود قفل شده است.",
        "notification.password_reset_code_sent.title": "کد بازنشانی رمز ارسال شد",
        "notification.password_reset_code_sent.message": "کد تایید بازنشانی رمز برای حساب شما صادر شد.",
        "notification.email_verified.title": "ایمیل تایید شد",
        "notification.email_verified.message": "آدرس ایمیل شما با موفقیت تایید شد.",
    },
    "pa": {
        "notification.blood_request_created.title": "د وینې غوښتنه #{request_id} جوړه شوه",
        "notification.blood_request_created.message": "ترلاسه کوونکي {recipient_name} یوه {request_type} غوښتنه جوړه کړه.",
        "notification.blood_request_completed.title": "د وینې غوښتنه #{request_id} بشپړه شوه",
        "notification.blood_request_completed.message": "د وینې غوښتنه #{request_id} د بشپړې شوې په توګه ثبت شوه.",
        "notification.blood_request_cancelled.title": "د وینې غوښتنه #{request_id} لغوه شوه",
        "notification.blood_request_cancelled.message": "د وینې غوښتنه #{request_id} د {cancelled_by} لخوا لغوه شوه.",
        "notification.blood_request_verified.title": "د غوښتنې #{request_id} تایید تازه شو",
        "notification.blood_request_verified.message": "د وینې غوښتنه #{request_id} په خودکار ډول تایید شوه.",
        "notification.matched_donor.title": "نوې د وینې غوښتنه #{request_id}",
        "notification.matched_donor.message": "د {blood_group} وینې ډلې لپاره یوه {request_type} غوښتنه {hospital_name} ته نږدې شته.",
        "notification.request_assigned.title": "مرسته کوونکي غوښتنه #{request_id} ومنله",
        "notification.request_assigned.message": "مرسته کوونکي {donor_name} د وینې غوښتنه #{request_id} ومنله.",
        "notification.request_fulfilled.title": "د وینې غوښتنه #{request_id} مخکې ټاکل شوې",
        "notification.request_fulfilled.message": "د وینې غوښتنه #{request_id} مخکې بل مرسته کوونکي ته ټاکل شوې ده. نور اقدام ته اړتیا نشته.",
        "notification.donation_status_updated.title": "د مرستې #{donation_id} حالت تازه شو",
        "notification.donation_status_updated.message": "مرسته #{donation_id} {status} ته بدله شوه.",
        "notification.donation_completed.title": "مرسته #{donation_id} بشپړه شوه",
        "notification.donation_completed.message": "مرسته #{donation_id} د بشپړې شوې په توګه ثبت شوه.",
        "notification.donation_primary_changed.title": "د غوښتنې #{request_id} اصلي مرسته کوونکی تازه شو",
        "notification.donation_primary_changed.message": "د مرستې #{donation_id} اصلي نښه {is_primary} ته وټاکل شوه.",
        "notification.donation_reminder.title": "د مرستې #{donation_id} لپاره یادونه ولېږل شوه",
        "notification.donation_reminder.message": "د مرستې #{donation_id} لپاره یادونه ولېږل شوه.",
        "notification.account_locked.title": "حساب قفل شو",
        "notification.account_locked.message": "ستاسو حساب د څو ناکامو ننوتلو هڅو له امله قفل شوی دی.",
        "notification.password_reset_code_sent.title": "د پټنوم بیا تنظیم کوډ ولېږل شو",
        "notification.password_reset_code_sent.message": "ستاسو د حساب لپاره د پټنوم بیا تنظیم تایید کوډ صادر شو.",
        "notification.email_verified.title": "ایمیل تایید شو",
        "notification.email_verified.message": "ستاسو ایمیل پته په بریالیتوب تایید شوه.",
    },
}


def normalize_language(language: str | None) -> str:
    if not language:
        return DEFAULT_LANGUAGE
    normalized = language.strip().lower().replace("_", "-")
    aliases = {"fa": "da", "fa-af": "da", "prs": "da", "ps": "pa", "ps-af": "pa"}
    normalized = aliases.get(normalized, normalized.split("-")[0])
    return normalized if normalized in SUPPORTED_LANGUAGES else DEFAULT_LANGUAGE


def _localized_params(language: str, params: dict | None) -> dict:
    output = {}
    for key, value in (params or {}).items():
        label_key = str(value).lower()
        if isinstance(value, bool):
            label_key = "true" if value else "false"
        output[key] = LABELS.get(language, LABELS[DEFAULT_LANGUAGE]).get(label_key, value)
    return output


def render_template(key: str | None, language: str, params: dict | None, fallback: str) -> str:
    if not key:
        return fallback
    normalized = normalize_language(language)
    template = TEMPLATES.get(normalized, {}).get(key) or TEMPLATES[DEFAULT_LANGUAGE].get(key)
    if not template:
        return fallback
    try:
        return template.format(**_localized_params(normalized, params))
    except Exception:
        return fallback


def render_for_user(user, *, title: str, message: str, title_key=None, message_key=None, params=None):
    language = normalize_language(getattr(user, "language_preference", None))
    return {
        "title": render_template(title_key, language, params, title),
        "message": render_template(message_key, language, params, message),
        "language": language,
    }
