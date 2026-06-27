import 'dart:async';
import 'dart:convert';

import 'package:blood_donation_app/core/config/app_config.dart';
import 'package:blood_donation_app/core/constants/app_constants.dart';
import 'package:blood_donation_app/core/storage/secure_storage.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class NotificationsSocketService {

  NotificationsSocketService(this._secureStorage);
  final SecureStorage _secureStorage;
  WebSocketChannel? _channel;
  StreamSubscription? _subscription;

  Future<void> connect({
    required void Function(Map<String, dynamic> payload) onEvent,
    void Function(Object error)? onError,
  }) async {
    final token = await _secureStorage.read(AppConstants.accessTokenKey);
    if (token == null || token.isEmpty) return;

    await disconnect();

    final socketUrl =
        '${AppConfig.websocketBaseUrl}/ws/notifications/?token=$token';
    _channel = WebSocketChannel.connect(Uri.parse(socketUrl));
    _subscription = _channel!.stream.listen(
      (message) {
        try {
          final payload =
              jsonDecode(message.toString()) as Map<String, dynamic>;
          onEvent(payload);
        } catch (_) {}
      },
      onError: onError,
      cancelOnError: false,
    );
  }

  Future<void> disconnect() async {
    await _subscription?.cancel();
    await _channel?.sink.close();
    _subscription = null;
    _channel = null;
  }
}
