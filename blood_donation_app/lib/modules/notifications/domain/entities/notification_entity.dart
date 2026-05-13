import 'package:equatable/equatable.dart';

enum NotificationType { donationReminder, bloodRequest, systemAlert, general }

class NotificationEntity extends Equatable {

  const NotificationEntity({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    this.isRead = false,
    required this.createdAt,
    this.data,
  });
  final String id;
  final String title;
  final String body;
  final NotificationType type;
  final bool isRead;
  final DateTime createdAt;
  final Map<String, dynamic>? data;

  @override
  List<Object?> get props => [id, title, body, type, isRead, createdAt];
}
