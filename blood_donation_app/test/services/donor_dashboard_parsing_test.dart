import 'package:blood_donation_app/models/app_models.dart';
import 'package:blood_donation_app/services/app_services.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('parses donation_requests into DonationItem rows', () {
    final dashboard = DonorService.parseDonorDashboardData({
      'profile': {
        'id': 7,
        'first_name': 'Ali',
        'last_name': 'Ahmadi',
        'blood_group': 'O+',
      },
      'nearby_requests': [
        {
          'id': 11,
          'blood_group': 'O+',
          'units_needed': 1,
          'request_type': 'urgent',
          'status': 'pending',
          'is_emergency': true,
        },
      ],
      'donation_requests': [
        {
          'id': 42,
          'request': 11,
          'status': 'pending',
          'distance_dynamic': '1.25',
          'estimated_time_dynamic': '8',
          'hospital_name': 'City Hospital',
          'recipient_name': 'Zahra Patient',
          'recipient_condition': 'critical',
          'request_blood_group': 'O+',
          'request_type': 'urgent',
          'condition': 'urgent',
        },
      ],
      'history_count': 3,
      'unread_notifications': 2,
    });

    final requests = dashboard['donationRequests'] as List<DonationItem>;
    expect(requests, hasLength(1));
    expect(requests.single.id, '42');
    expect(requests.single.requestId, '11');
    expect(requests.single.distanceKm, 1.25);
    expect(requests.single.estimatedArrivalMinutes, 8);
    expect(requests.single.hospitalName, 'City Hospital');
    expect(requests.single.recipientName, 'Zahra Patient');
    expect(requests.single.recipientCondition, 'critical');
    expect(requests.single.condition, 'critical');
    expect(requests.single.requestBloodGroup, 'O+');
    expect(requests.single.requestType, 'urgent');
    expect(dashboard['nearbyRequests'], isA<List<BloodRequestItem>>());
  });
}
