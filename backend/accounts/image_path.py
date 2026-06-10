from core.utils import upload_image_path


def user_avatar_upload_path(instance, filename):
    display_name = instance.get_full_name().strip() or instance.username or "user"
    return upload_image_path(
        instance=instance,
        filename=filename,
        folder_name="accounts/avatars",
        instance_field_name="username",
        name=display_name,
    )
