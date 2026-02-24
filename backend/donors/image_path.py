from core.utils import upload_image_path


def donor_profile_picture_upload_path(instance, filename):
    donor_name = f"{getattr(instance, 'first_name', '')} {getattr(instance, 'last_name', '')}".strip()
    return upload_image_path(
        instance=instance,
        filename=filename,
        folder_name="donors/profile-pictures",
        instance_field_name="first_name",
        name=donor_name or "donor",
    )
