BLOOD_COMPATIBILITY = {
    "O-": ("O-",),
    "O+": ("O-", "O+"),
    "A-": ("O-", "A-"),
    "A+": ("O-", "O+", "A-", "A+"),
    "B-": ("O-", "B-"),
    "B+": ("O-", "O+", "B-", "B+"),
    "AB-": ("O-", "A-", "B-", "AB-"),
    "AB+": ("O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"),
}


def get_compatible_donor_groups(recipient_blood_group: str) -> tuple[str, ...]:
    return BLOOD_COMPATIBILITY.get(recipient_blood_group, (recipient_blood_group,))


def get_match_type(donor_blood_group: str, recipient_blood_group: str) -> str:
    return "exact" if donor_blood_group == recipient_blood_group else "compatible"
