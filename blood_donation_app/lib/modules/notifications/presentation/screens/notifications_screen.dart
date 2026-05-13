import 'package:flutter/material.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/core/storage/secure_storage.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';
import 'package:blood_donation_app/core/widgets/cards/app_card.dart';
import 'package:blood_donation_app/core/widgets/layouts/app_scaffold.dart';
import 'package:blood_donation_app/core/widgets/loaders/app_loading_indicator.dart';
import 'package:blood_donation_app/modules/notifications/data/services/notification_service.dart';
import 'package:blood_donation_app/modules/notifications/data/services/notifications_socket_service.dart';
import 'package:blood_donation_app/modules/notifications/domain/entities/notification_entity.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late final NotificationService _service;
  late final NotificationsSocketService _socketService;
  late Future<List<NotificationEntity>> _future;

  @override
  void initState() {
    super.initState();
    _service = NotificationService(getIt());
    _socketService = NotificationsSocketService(getIt<SecureStorage>());
    _future = _service.getNotifications();
    _socketService.connect(onEvent: (_) => _reload());
  }

  @override
  void dispose() {
    _socketService.disconnect();
    super.dispose();
  }

  Future<void> _reload() async {
    if (!mounted) return;
    setState(() {
      _future = _service.getNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Notifications',
      showBackButton: false,
      actions: [
        TextButton(
          onPressed: () async {
            await _service.markAllRead();
            await _reload();
          },
          child: const Text('Mark all read'),
        ),
      ],
      body: FutureBuilder<List<NotificationEntity>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: AppLoadingIndicator(size: 28));
          }
          if (snapshot.hasError) {
            return Center(child: Text(snapshot.error.toString()));
          }

          final items = snapshot.data ?? const [];
          if (items.isEmpty) {
            return const Center(child: Text('No notifications.'));
          }

          return RefreshIndicator(
            onRefresh: _reload,
            child: ListView.separated(
              padding: const EdgeInsets.all(AppDimensions.screenPaddingH),
              itemCount: items.length,
              separatorBuilder: (_, __) =>
                  const SizedBox(height: AppDimensions.sm),
              itemBuilder: (context, index) {
                final item = items[index];
                return AppCard(
                  onTap: item.isRead
                      ? null
                      : () async {
                          await _service.markAsRead(item.id, isRead: true);
                          await _reload();
                        },
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              item.title,
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                          ),
                          if (!item.isRead)
                            const Icon(
                              Icons.circle,
                              size: 10,
                              color: Colors.red,
                            ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(item.body),
                      const SizedBox(height: 6),
                      Text(
                        item.createdAt.toLocal().toString().split('.').first,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
