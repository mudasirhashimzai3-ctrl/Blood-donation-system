TERMINAL_STATUSES = {"completed", "cancelled", "declined", "expired"}

ALLOWED_STATUS_TRANSITIONS = {
    "pending": {"accepted", "declined", "expired", "cancelled"},
    "accepted": {"en_route", "cancelled"},
    "en_route": {"arrived", "cancelled"},
    "arrived": {"completed", "cancelled"},
    "completed": set(),
    "cancelled": set(),
    "declined": set(),
    "expired": set(),
}


def is_terminal_status(status: str) -> bool:
    return status in TERMINAL_STATUSES


def can_transition(current_status: str, next_status: str) -> bool:
    if current_status == next_status:
        return True
    return next_status in ALLOWED_STATUS_TRANSITIONS.get(current_status, set())
