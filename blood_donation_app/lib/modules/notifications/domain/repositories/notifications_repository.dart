import 'package:blood_donation_app/modules/notifications/domain/entities/notification_entity.dart';

abstract class NotificationsRepository {
  Future<List<NotificationEntity>> getNotifications();
  Future<void> markAsRead(String id);
  Future<void> markAllAsRead();
  Future<int> getUnreadCount();
}
