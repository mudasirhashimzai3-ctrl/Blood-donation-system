import 'package:blood_donation_app/services/app_services.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('realtime notifications service updates unread count and emits events',
      () async {
    final service = RealtimeNotificationsService.instance;
    service.unreadCount.value = 0;

    final received = <Map<String, dynamic>>[];
    final subscription = service.events.listen(received.add);

    service.handleSocketEvent({
      'event': 'notification.created',
      'data': {'id': 1, 'title': 'New'},
    });
    service.handleSocketEvent({
      'event': 'notification.unread_count',
      'data': {'count': 3},
    });

    await Future<void>.delayed(const Duration(milliseconds: 1));
    await subscription.cancel();

    expect(service.unreadCount.value, 3);
    expect(received.length, 2);
    expect(received.first['event'], 'notification.created');
    expect(received.last['event'], 'notification.unread_count');
  });

  test('realtime notifications service identifies mobile data refresh events',
      () {
    final service = RealtimeNotificationsService.instance;

    expect(
      service.shouldRefreshMobileData({
        'event': 'notification.created',
        'data': {'event_key': 'blood_request_created'},
      }),
      isTrue,
    );
    expect(
      service.shouldRefreshMobileData({
        'event': 'notification.updated',
        'data': {'type': 'donation_update'},
      }),
      isTrue,
    );
    expect(
      service.shouldRefreshMobileData({
        'event': 'notification.unread_count',
        'data': {'count': 2},
      }),
      isFalse,
    );
  });
}
