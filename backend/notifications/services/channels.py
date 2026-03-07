from asgiref.sync import async_to_sync

try:
    from channels.layers import get_channel_layer
except Exception:  # pragma: no cover
    get_channel_layer = None


def _group_name(user_id: int) -> str:
    return f"user_notifications_{user_id}"


def _send(user_id: int, event: str, data: dict):
    if get_channel_layer is None:
        return

    try:
        channel_layer = get_channel_layer()
    except Exception:  # pragma: no cover
        return

    if not channel_layer:
        return

    try:
        async_to_sync(channel_layer.group_send)(
            _group_name(user_id),
            {
                "type": "notify.message",
                "event": event,
                "data": data,
            },
        )
    except Exception:  # pragma: no cover
        return


def _serialize(notification):
    return {
        "id": notification.id,
        "user_id": notification.user_id,
        "user_type": notification.user_type,
        "request_id": notification.request_id,
        "donation_id": notification.donation_id,
        "event_key": notification.event_key,
        "type": notification.type,
        "title": notification.title,
        "message": notification.message,
        "sent_via": notification.sent_via,
        "status": notification.status,
        "priority": notification.priority,
        "is_read": notification.is_read,
        "read_at": notification.read_at.isoformat() if notification.read_at else None,
        "sent_at": notification.sent_at.isoformat() if notification.sent_at else None,
        "created_at": notification.created_at.isoformat() if notification.created_at else None,
        "updated_at": notification.updated_at.isoformat() if notification.updated_at else None,
    }


def publish_created(notification):
    _send(notification.user_id, "notification.created", _serialize(notification))


def publish_updated(notification):
    _send(notification.user_id, "notification.updated", _serialize(notification))


def publish_deleted(user_id: int, notification_id: int):
    _send(user_id, "notification.deleted", {"id": notification_id})


def publish_unread_count(user_id: int, count: int):
    _send(user_id, "notification.unread_count", {"count": count})
