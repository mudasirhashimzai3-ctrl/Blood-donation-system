import 'package:blood_donation_app/core/network/api_client.dart';
import 'package:blood_donation_app/modules/notifications/data/models/notification_model.dart';

class NotificationService {
  NotificationService(this._apiClient);
  final ApiClient _apiClient;

  Future<List<NotificationModel>> getNotifications() async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/notifications/',
    );
    final data = (response.data?['results'] as List?) ?? const [];
    return data
        .map((item) => NotificationModel.fromJson(item as Map<String, dynamic>))
        .toList(growable: false);
  }

  Future<void> markAsRead(String id, {required bool isRead}) async {
    await _apiClient.patch(
      '/notifications/$id/read/',
      data: {'is_read': isRead},
    );
  }

  Future<void> markAllRead() async {
    await _apiClient.post('/notifications/mark-all-read/', data: {});
  }
}
