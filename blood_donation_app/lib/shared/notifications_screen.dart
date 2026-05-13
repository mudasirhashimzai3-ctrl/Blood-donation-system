import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/models/app_models.dart';
import 'package:blood_donation_app/services/app_services.dart';
import 'package:flutter/material.dart';

class AppNotificationsScreen extends StatefulWidget {
  const AppNotificationsScreen({super.key});

  @override
  State<AppNotificationsScreen> createState() => _AppNotificationsScreenState();
}

class _AppNotificationsScreenState extends State<AppNotificationsScreen> {
  late Future<List<NotificationItem>> _future;

  @override
  void initState() {
    super.initState();
    _future = NotificationsService(getIt()).getNotifications();
  }

  Future<void> _refresh() async {
    setState(() {
      _future = NotificationsService(getIt()).getNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: () async {
              await NotificationsService(getIt()).markAllAsRead();
              await _refresh();
            },
            child: const Text('Mark all read'),
          ),
        ],
      ),
      body: FutureBuilder<List<NotificationItem>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final items = snapshot.data ?? const [];
          if (items.isEmpty) return const Center(child: Text('No notifications'));
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.builder(
              itemCount: items.length,
              itemBuilder: (context, index) {
                final n = items[index];
                return ListTile(
                  title: Text(n.title),
                  subtitle: Text(n.message),
                  trailing: n.isRead ? null : const Icon(Icons.circle, size: 10, color: Colors.red),
                  onTap: () async {
                    if (!n.isRead) {
                      await NotificationsService(getIt()).markAsRead(n.id);
                      await _refresh();
                    }
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }
}
