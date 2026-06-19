from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "frontend" / "src"
LOCALES = {
    "en": ROOT / "locales" / "en.json",
    "da": ROOT / "locales" / "da.json",
    "pa": ROOT / "locales" / "pa.json",
}


def get_value(data: dict, dotted_key: str):
    if dotted_key in data:
        return data[dotted_key]
    current = data
    for part in dotted_key.split("."):
        if not isinstance(current, dict) or part not in current:
            return None
        current = current[part]
    return current


def set_value(data: dict, dotted_key: str, value):
    if dotted_key in data:
        data[dotted_key] = value
        return
    current = data
    parts = dotted_key.split(".")
    for part in parts[:-1]:
        child = current.get(part)
        if not isinstance(child, dict):
            child = {}
            current[part] = child
        current = child
    current[parts[-1]] = value


EXACT = {
    "da": {
        "Secure Donor Portal": "پورتال امن اهداکننده",
        "Blood Donation Command Center": "مرکز فرماندهی اهدای خون",
        "Sign in to coordinate donors, recipients, and urgent blood requests.": "برای هماهنگی اهداکنندگان، دریافت‌کنندگان و درخواست‌های فوری خون وارد شوید.",
        "Access your secure operations workspace": "به فضای کاری عملیاتی امن خود دسترسی پیدا کنید",
        "Recover Access": "بازیابی دسترسی",
        "Enter your account email or username to receive a secure verification code.": "ایمیل یا نام کاربری حساب خود را وارد کنید تا کد تایید امن دریافت کنید.",
        "Verify Security Code": "تایید کد امنیتی",
        "Enter the 6-digit code sent to {{email}}": "کد ۶ رقمی ارسال‌شده به {{email}} را وارد کنید",
        "Set a New Password": "تعیین رمز عبور جدید",
        "Create a strong password to secure your blood donation operations account.": "برای حفاظت از حساب عملیاتی اهدای خون خود یک رمز عبور قوی بسازید.",
        "Email Verified": "ایمیل تایید شد",
        "Your email is confirmed and your account is ready for secure sign in.": "ایمیل شما تایید شد و حساب شما برای ورود امن آماده است.",
        "The verification link is invalid or expired. Request a new verification email.": "لینک تایید نامعتبر یا منقضی شده است. ایمیل تایید جدید درخواست کنید.",
        "Please wait while we validate your secure link.": "لطفا صبر کنید تا لینک امن شما بررسی شود.",
        "© 2026 Blood Donation Network. All rights reserved.": "© ۲۰۲۶ شبکه اهدای خون. تمام حقوق محفوظ است.",
        "Operations Dashboard": "داشبورد عملیات",
        "Real-time view of donor availability, active requests, and donation outcomes": "نمای لحظه‌ای از دسترسی اهداکنندگان، درخواست‌های فعال و نتایج اهدا",
        "Manage donor records by blood group": "سوابق اهداکنندگان را بر اساس گروه خون مدیریت کنید",
        "Manage recipient records with emergency requirements": "سوابق دریافت‌کنندگان را با نیازهای اضطراری مدیریت کنید",
        "Manage hospital records for recipient assignments": "سوابق شفاخانه‌ها را برای تعیین دریافت‌کنندگان مدیریت کنید",
        "Manage blood request workflow from pending to completion": "روند درخواست خون را از انتظار تا تکمیل مدیریت کنید",
        "Submit a new blood request": "ثبت درخواست جدید خون",
        "View request workflow and donor matches": "مشاهده روند درخواست و مطابقت اهداکنندگان",
        "Track donor assignment and response lifecycle": "تعیین اهداکننده و چرخه پاسخ را پیگیری کنید",
        "Review lifecycle, response and reminder details": "جزئیات چرخه، پاسخ و یادآوری را بررسی کنید",
        "Track in-app, email and SMS notification delivery": "ارسال اطلاعیه‌های درون‌برنامه، ایمیل و پیامک را پیگیری کنید",
        "Inspect delivery status and context payload": "وضعیت ارسال و اطلاعات زمینه را بررسی کنید",
        "Manage your account settings and preferences": "تنظیمات و ترجیحات حساب خود را مدیریت کنید",
        "Update your password to keep your account secure": "برای امن نگه‌داشتن حساب، رمز عبور خود را به‌روزرسانی کنید",
        "Track nearby requests and respond to donations": "درخواست‌های نزدیک را پیگیری و به اهداها پاسخ دهید",
        "Create requests and track donor responses": "درخواست‌ها را ایجاد و پاسخ‌های اهداکنندگان را پیگیری کنید",
        "Find active eligible donors by blood group and distance.": "اهداکنندگان فعال واجد شرایط را بر اساس گروه خون و فاصله پیدا کنید.",
        "Create an active blood request before searching for donors.": "پیش از جستجوی اهداکنندگان، یک درخواست خون فعال ایجاد کنید.",
        "No nearby requests right now.": "در حال حاضر درخواست نزدیکی وجود ندارد.",
        "No donor responses available yet": "هنوز پاسخی از اهداکنندگان وجود ندارد",
        "Select reminder channels and dispatch now.": "کانال‌های یادآوری را انتخاب و اکنون ارسال کنید.",
        "This action cannot be undone.": "این عمل قابل برگشت نیست.",
        "Are you sure you want to delete this donor? This action cannot be undone.": "آیا مطمئن هستید که می‌خواهید این اهداکننده را حذف کنید؟ این عمل قابل برگشت نیست.",
        "Are you sure you want to delete this recipient? This action cannot be undone.": "آیا مطمئن هستید که می‌خواهید این دریافت‌کننده را حذف کنید؟ این عمل قابل برگشت نیست.",
        "Are you sure you want to delete this hospital? This action cannot be undone.": "آیا مطمئن هستید که می‌خواهید این شفاخانه را حذف کنید؟ این عمل قابل برگشت نیست.",
        "This will soft-delete the donor record.": "این کار سابقه اهداکننده را به‌صورت نرم حذف می‌کند.",
        "This will soft-delete the recipient record.": "این کار سابقه دریافت‌کننده را به‌صورت نرم حذف می‌کند.",
        "This will soft-delete the hospital record.": "این کار سابقه شفاخانه را به‌صورت نرم حذف می‌کند.",
    },
    "pa": {
        "Secure Donor Portal": "د مرسته کوونکي خوندي پورټل",
        "Blood Donation Command Center": "د وینې مرستې د قوماندې مرکز",
        "Sign in to coordinate donors, recipients, and urgent blood requests.": "د مرسته کوونکو، ترلاسه کوونکو او بیړنیو وینې غوښتنو د همغږۍ لپاره ننوځئ.",
        "Access your secure operations workspace": "خپل خوندي عملیاتي کاري ځای ته لاسرسی ومومئ",
        "Recover Access": "لاسرسی بېرته ترلاسه کړئ",
        "Enter your account email or username to receive a secure verification code.": "د خوندي تایید کوډ ترلاسه کولو لپاره د حساب ایمیل یا کارن نوم ولیکئ.",
        "Verify Security Code": "امنیتي کوډ تایید کړئ",
        "Enter the 6-digit code sent to {{email}}": "{{email}} ته لېږل شوی ۶ عددي کوډ ولیکئ",
        "Set a New Password": "نوی پټنوم وټاکئ",
        "Create a strong password to secure your blood donation operations account.": "د وینې مرستې عملیاتي حساب د خوندي کولو لپاره قوي پټنوم جوړ کړئ.",
        "Email Verified": "ایمیل تایید شو",
        "Your email is confirmed and your account is ready for secure sign in.": "ستاسو ایمیل تایید شو او حساب مو د خوندي ننوتلو لپاره چمتو دی.",
        "The verification link is invalid or expired. Request a new verification email.": "د تایید لینک ناسم یا پای ته رسېدلی دی. نوی تایید ایمیل وغواړئ.",
        "Please wait while we validate your secure link.": "مهرباني وکړئ انتظار وکړئ تر څو ستاسو خوندي لینک تایید کړو.",
        "© 2026 Blood Donation Network. All rights reserved.": "© ۲۰۲۶ د وینې مرستې شبکه. ټول حقوق خوندي دي.",
        "Operations Dashboard": "د عملیاتو ډشبورډ",
        "Real-time view of donor availability, active requests, and donation outcomes": "د مرسته کوونکو شتون، فعالو غوښتنو او د مرستې پایلو ژوندی لید",
        "Manage donor records by blood group": "د وینې ډلې له مخې د مرسته کوونکو ریکارډونه مدیریت کړئ",
        "Manage recipient records with emergency requirements": "د بیړنیو اړتیاوو سره د ترلاسه کوونکو ریکارډونه مدیریت کړئ",
        "Manage hospital records for recipient assignments": "د ترلاسه کوونکو د ټاکلو لپاره د روغتونونو ریکارډونه مدیریت کړئ",
        "Manage blood request workflow from pending to completion": "د وینې غوښتنې بهیر له انتظار څخه تر بشپړیدو مدیریت کړئ",
        "Submit a new blood request": "د وینې نوې غوښتنه ثبت کړئ",
        "View request workflow and donor matches": "د غوښتنې بهیر او د مرسته کوونکو برابرښت وګورئ",
        "Track donor assignment and response lifecycle": "د مرسته کوونکي ټاکنه او د ځواب ژوند دوره وڅارئ",
        "Review lifecycle, response and reminder details": "د ژوند دورې، ځواب او یادونې جزئیات وګورئ",
        "Track in-app, email and SMS notification delivery": "د اپ دننه، ایمیل او SMS خبرتیاوو لېږد وڅارئ",
        "Inspect delivery status and context payload": "د لېږد حالت او اړوند معلومات وګورئ",
        "Manage your account settings and preferences": "د خپل حساب تنظیمات او خوښې مدیریت کړئ",
        "Update your password to keep your account secure": "د حساب د خوندي ساتلو لپاره خپل پټنوم تازه کړئ",
        "Track nearby requests and respond to donations": "نږدې غوښتنې وڅارئ او مرستو ته ځواب ورکړئ",
        "Create requests and track donor responses": "غوښتنې جوړې او د مرسته کوونکو ځوابونه وڅارئ",
        "Find active eligible donors by blood group and distance.": "فعال وړ مرسته کوونکي د وینې ډلې او واټن له مخې ومومئ.",
        "Create an active blood request before searching for donors.": "د مرسته کوونکو له لټون مخکې فعاله د وینې غوښتنه جوړه کړئ.",
        "No nearby requests right now.": "اوس مهال نږدې غوښتنې نشته.",
        "No donor responses available yet": "لا د مرسته کوونکو ځوابونه نشته",
        "Select reminder channels and dispatch now.": "د یادونې چینلونه وټاکئ او اوس یې ولېږئ.",
        "This action cannot be undone.": "دا عمل بېرته نه ګرځي.",
        "Are you sure you want to delete this donor? This action cannot be undone.": "ایا ډاډه یاست چې دا مرسته کوونکی حذف کړئ؟ دا عمل بېرته نه ګرځي.",
        "Are you sure you want to delete this recipient? This action cannot be undone.": "ایا ډاډه یاست چې دا ترلاسه کوونکی حذف کړئ؟ دا عمل بېرته نه ګرځي.",
        "Are you sure you want to delete this hospital? This action cannot be undone.": "ایا ډاډه یاست چې دا روغتون حذف کړئ؟ دا عمل بېرته نه ګرځي.",
        "This will soft-delete the donor record.": "دا به د مرسته کوونکي ریکارډ نرم حذف کړي.",
        "This will soft-delete the recipient record.": "دا به د ترلاسه کوونکي ریکارډ نرم حذف کړي.",
        "This will soft-delete the hospital record.": "دا به د روغتون ریکارډ نرم حذف کړي.",
    },
}

WORDS = {
    "da": {
        "Donor": "اهداکننده",
        "Donors": "اهداکنندگان",
        "Recipient": "دریافت‌کننده",
        "Recipients": "دریافت‌کنندگان",
        "Hospital": "شفاخانه",
        "Hospitals": "شفاخانه‌ها",
        "Blood Request": "درخواست خون",
        "Blood Requests": "درخواست‌های خون",
        "Donation": "اهدا",
        "Donations": "اهداها",
        "Notification": "اطلاعیه",
        "Notifications": "اطلاعیه‌ها",
        "Dashboard": "داشبورد",
        "Details": "جزئیات",
        "Create": "ایجاد",
        "Add": "افزودن",
        "Edit": "ویرایش",
        "Update": "به‌روزرسانی",
        "Save": "ذخیره",
        "Delete": "حذف",
        "View": "مشاهده",
        "Search": "جستجو",
        "Loading": "در حال بارگذاری",
        "No": "هیچ",
        "found": "یافت نشد",
        "Status": "وضعیت",
        "Type": "نوع",
        "Priority": "اولویت",
        "Channel": "کانال",
        "Actions": "اقدامات",
        "Title": "عنوان",
        "Name": "نام",
        "Full Name": "نام کامل",
        "First Name": "نام",
        "Last Name": "تخلص",
        "Phone Number": "شماره تماس",
        "Phone": "شماره تماس",
        "Email": "ایمیل",
        "Address": "آدرس",
        "City": "شهر",
        "Blood Group": "گروه خون",
        "Required Blood Group": "گروه خون مورد نیاز",
        "Emergency Level": "سطح اضطرار",
        "Gender": "جنسیت",
        "Age": "سن",
        "Latitude": "عرض جغرافیایی",
        "Longitude": "طول جغرافیایی",
        "Active": "فعال",
        "Inactive": "غیرفعال",
        "Blocked": "مسدود",
        "Pending": "در انتظار",
        "Matched": "مطابقت‌شده",
        "Completed": "تکمیل‌شده",
        "Cancelled": "لغو‌شده",
        "Accepted": "قبول‌شده",
        "Declined": "رد‌شده",
        "Expired": "منقضی‌شده",
        "Normal": "عادی",
        "Urgent": "فوری",
        "Critical": "بحرانی",
        "Low": "پایین",
        "Medium": "متوسط",
        "High": "بالا",
        "Male": "مرد",
        "Female": "زن",
        "Other": "دیگر",
        "All": "همه",
        "Reset": "بازنشانی",
        "Cancel": "لغو",
        "Close": "بستن",
        "Read": "خوانده‌شده",
        "Unread": "خوانده‌نشده",
    },
    "pa": {
        "Donor": "مرسته کوونکی",
        "Donors": "مرسته کوونکي",
        "Recipient": "ترلاسه کوونکی",
        "Recipients": "ترلاسه کوونکي",
        "Hospital": "روغتون",
        "Hospitals": "روغتونونه",
        "Blood Request": "د وینې غوښتنه",
        "Blood Requests": "د وینې غوښتنې",
        "Donation": "مرسته",
        "Donations": "مرستې",
        "Notification": "خبرتیا",
        "Notifications": "خبرتیاوې",
        "Dashboard": "ډشبورډ",
        "Details": "جزئیات",
        "Create": "جوړول",
        "Add": "اضافه کول",
        "Edit": "سمول",
        "Update": "تازه کول",
        "Save": "خوندي کول",
        "Delete": "حذف",
        "View": "کتل",
        "Search": "لټون",
        "Loading": "بارېږي",
        "No": "هیڅ",
        "found": "ونه موندل شو",
        "Status": "حالت",
        "Type": "ډول",
        "Priority": "لومړیتوب",
        "Channel": "چینل",
        "Actions": "اقدامات",
        "Title": "عنوان",
        "Name": "نوم",
        "Full Name": "بشپړ نوم",
        "First Name": "نوم",
        "Last Name": "تخلص",
        "Phone Number": "د تلیفون شمېره",
        "Phone": "تلیفون",
        "Email": "ایمیل",
        "Address": "پته",
        "City": "ښار",
        "Blood Group": "د وینې ډله",
        "Required Blood Group": "اړینه د وینې ډله",
        "Emergency Level": "بیړنۍ کچه",
        "Gender": "جنسیت",
        "Age": "عمر",
        "Latitude": "عرض البلد",
        "Longitude": "طول البلد",
        "Active": "فعال",
        "Inactive": "غیرفعال",
        "Blocked": "بند شوی",
        "Pending": "په انتظار",
        "Matched": "برابر شوی",
        "Completed": "بشپړ شوی",
        "Cancelled": "لغوه شوی",
        "Accepted": "منل شوی",
        "Declined": "رد شوی",
        "Expired": "پای ته رسېدلی",
        "Normal": "عادي",
        "Urgent": "بیړنی",
        "Critical": "بحراني",
        "Low": "ټیټ",
        "Medium": "منځنی",
        "High": "لوړ",
        "Male": "نارینه",
        "Female": "ښځینه",
        "Other": "نور",
        "All": "ټول",
        "Reset": "بیا تنظیم",
        "Cancel": "لغوه کول",
        "Close": "تړل",
        "Read": "لوستل شوی",
        "Unread": "نالوستل شوی",
    },
}

EXTRA_KEYS = {
    "en": {
        "models.roles.admin": "Administrator",
        "models.roles.donor": "Donor",
        "models.roles.recipient": "Recipient",
        "models.channels.in_app": "In App",
        "models.channels.email": "Email",
        "models.channels.sms": "SMS",
        "models.notificationTypes.request_update": "Request Update",
        "models.notificationTypes.donation_update": "Donation Update",
        "models.notificationTypes.auth": "Authentication",
        "models.notificationTypes.system": "System",
        "models.notificationTypes.reminder": "Reminder",
        "models.status.active": "Active",
        "models.status.inactive": "Inactive",
        "models.status.blocked": "Blocked",
        "models.status.pending": "Pending",
        "models.status.matched": "Matched",
        "models.status.completed": "Completed",
        "models.status.cancelled": "Cancelled",
        "models.status.accepted": "Accepted",
        "models.status.declined": "Declined",
        "models.status.expired": "Expired",
        "models.status.queued": "Queued",
        "models.status.sent": "Sent",
        "models.status.delivered": "Delivered",
        "models.status.failed": "Failed",
        "notifications.filters.allStatuses": "All statuses",
        "notifications.filters.allTypes": "All types",
        "notifications.filters.allChannels": "All channels",
        "notifications.filters.reset": "Reset",
        "notifications.table.title": "Title",
        "notifications.table.type": "Type",
        "notifications.table.channel": "Channel",
        "notifications.table.status": "Status",
        "notifications.table.read": "Read",
        "notifications.table.created": "Created",
        "notifications.table.actions": "Actions",
        "notifications.read.read": "Read",
        "notifications.read.unread": "Unread",
        "notifications.empty": "No notifications found",
        "notifications.loadingRows": "Loading notifications...",
    },
    "da": {
        "models.roles.admin": "مدیر",
        "models.roles.donor": "اهداکننده",
        "models.roles.recipient": "دریافت‌کننده",
        "models.channels.in_app": "درون‌برنامه",
        "models.channels.email": "ایمیل",
        "models.channels.sms": "پیامک",
        "models.notificationTypes.request_update": "به‌روزرسانی درخواست",
        "models.notificationTypes.donation_update": "به‌روزرسانی اهدا",
        "models.notificationTypes.auth": "احراز هویت",
        "models.notificationTypes.system": "سیستم",
        "models.notificationTypes.reminder": "یادآوری",
        "models.status.active": "فعال",
        "models.status.inactive": "غیرفعال",
        "models.status.blocked": "مسدود",
        "models.status.pending": "در انتظار",
        "models.status.matched": "مطابقت‌شده",
        "models.status.completed": "تکمیل‌شده",
        "models.status.cancelled": "لغو‌شده",
        "models.status.accepted": "قبول‌شده",
        "models.status.declined": "رد‌شده",
        "models.status.expired": "منقضی‌شده",
        "models.status.queued": "در صف",
        "models.status.sent": "ارسال‌شده",
        "models.status.delivered": "تحویل‌شده",
        "models.status.failed": "ناموفق",
        "notifications.filters.allStatuses": "همه وضعیت‌ها",
        "notifications.filters.allTypes": "همه نوع‌ها",
        "notifications.filters.allChannels": "همه کانال‌ها",
        "notifications.filters.reset": "بازنشانی",
        "notifications.table.title": "عنوان",
        "notifications.table.type": "نوع",
        "notifications.table.channel": "کانال",
        "notifications.table.status": "وضعیت",
        "notifications.table.read": "خوانده‌شده",
        "notifications.table.created": "ایجاد شده",
        "notifications.table.actions": "اقدامات",
        "notifications.read.read": "خوانده‌شده",
        "notifications.read.unread": "خوانده‌نشده",
        "notifications.empty": "هیچ اطلاعیه‌ای یافت نشد",
        "notifications.loadingRows": "در حال بارگذاری اطلاعیه‌ها...",
    },
    "pa": {
        "models.roles.admin": "مدیر",
        "models.roles.donor": "مرسته کوونکی",
        "models.roles.recipient": "ترلاسه کوونکی",
        "models.channels.in_app": "په اپ کې",
        "models.channels.email": "ایمیل",
        "models.channels.sms": "SMS",
        "models.notificationTypes.request_update": "د غوښتنې تازه معلومات",
        "models.notificationTypes.donation_update": "د مرستې تازه معلومات",
        "models.notificationTypes.auth": "تصدیق",
        "models.notificationTypes.system": "سیستم",
        "models.notificationTypes.reminder": "یادونه",
        "models.status.active": "فعال",
        "models.status.inactive": "غیرفعال",
        "models.status.blocked": "بند شوی",
        "models.status.pending": "په انتظار",
        "models.status.matched": "برابر شوی",
        "models.status.completed": "بشپړ شوی",
        "models.status.cancelled": "لغوه شوی",
        "models.status.accepted": "منل شوی",
        "models.status.declined": "رد شوی",
        "models.status.expired": "پای ته رسېدلی",
        "models.status.queued": "په کتار کې",
        "models.status.sent": "لېږل شوی",
        "models.status.delivered": "رسېدلی",
        "models.status.failed": "ناکام",
        "notifications.filters.allStatuses": "ټول حالتونه",
        "notifications.filters.allTypes": "ټول ډولونه",
        "notifications.filters.allChannels": "ټول چینلونه",
        "notifications.filters.reset": "بیا تنظیم",
        "notifications.table.title": "عنوان",
        "notifications.table.type": "ډول",
        "notifications.table.channel": "چینل",
        "notifications.table.status": "حالت",
        "notifications.table.read": "لوستل شوی",
        "notifications.table.created": "جوړ شوی",
        "notifications.table.actions": "اقدامات",
        "notifications.read.read": "لوستل شوی",
        "notifications.read.unread": "نالوستل شوی",
        "notifications.empty": "هیڅ خبرتیا ونه موندل شوه",
        "notifications.loadingRows": "خبرتیاوې بارېږي...",
    },
}


def translate(lang: str, value):
    if isinstance(value, dict):
        return {key: translate(lang, item) for key, item in value.items()}
    if not isinstance(value, str):
        return value
    if value in EXACT[lang]:
        return EXACT[lang][value]
    if re.fullmatch(r"[ABO][B]?[-+]|O[-+]|SMS|ETA|ID|JSON|\\+93 70 000 0000|[0-9,+% ./:-]+", value):
        return value
    translated = value
    for source in sorted(WORDS[lang], key=len, reverse=True):
        translated = re.sub(rf"(?<![A-Za-z]){re.escape(source)}(?![A-Za-z])", WORDS[lang][source], translated)
    return translated


def main():
    locales = {lang: json.loads(path.read_text(encoding="utf-8")) for lang, path in LOCALES.items()}

    for path in ROOT.rglob("*.tsx"):
        text = path.read_text(encoding="utf-8", errors="ignore")
        for match in re.finditer(r't\(\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']*)["\']', text):
            key, default = match.groups()
            if get_value(locales["en"], key) is None:
                set_value(locales["en"], key, default)

    for lang, keys in EXTRA_KEYS.items():
        for key, value in keys.items():
            set_value(locales[lang], key, value)

    for lang in ("da", "pa"):
        for key, english_value in locales["en"].items():
            current = get_value(locales[lang], key)
            if current is None or current == english_value or (isinstance(current, str) and "?" in current):
                set_value(locales[lang], key, translate(lang, english_value))

    for lang, path in LOCALES.items():
        path.write_text(json.dumps(locales[lang], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
