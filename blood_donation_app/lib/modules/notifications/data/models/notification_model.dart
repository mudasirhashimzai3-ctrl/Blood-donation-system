import 'package:blood_donation_app/modules/notifications/domain/entities/notification_entity.dart';

class NotificationModel extends NotificationEntity {

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'].toString(),
      title: (json['title'] ?? '') as String,
      body: (json['message'] ?? '') as String,
      type: _mapType((json['type'] ?? 'general').toString()),
      isRead: json['is_read'] as bool? ?? false,
      createdAt: DateTime.parse((json['created_at']) as String),
      data: json['metadata'] as Map<String, dynamic>?,
    );
  }
  const NotificationModel({
    required super.id,
    required super.title,
    required super.body,
    required super.type,
    required super.isRead,
    required super.createdAt,
    super.data,
  });

  static NotificationType _mapType(String raw) {
    switch (raw) {
      case 'donation_update':
        return NotificationType.donationReminder;
      case 'request_update':
        return NotificationType.bloodRequest;
      case 'system':
        return NotificationType.systemAlert;
      default:
        return NotificationType.general;
    }
  }
}
