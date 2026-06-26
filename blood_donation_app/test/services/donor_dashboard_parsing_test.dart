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
          'units_needed': 1.5,
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
    final nearbyRequests =
        dashboard['nearbyRequests'] as List<BloodRequestItem>;
    expect(nearbyRequests.single.unitsNeeded, 1.5);
    expect(formatBloodRequestUnits(nearbyRequests.single.unitsNeeded), '1.5');
  });

  test('parses blood request units from numeric and string JSON', () {
    final numeric = BloodRequestItem.fromJson({
      'id': 11,
      'blood_group': 'O+',
      'units_needed': 1.5,
      'request_type': 'urgent',
      'status': 'pending',
      'is_emergency': true,
    });
    final stringValue = BloodRequestItem.fromJson({
      'id': 12,
      'blood_group': 'A+',
      'units_needed': '2.0',
      'request_type': 'normal',
      'status': 'pending',
      'is_emergency': false,
    });

    expect(numeric.unitsNeeded, 1.5);
    expect(formatBloodRequestUnits(numeric.unitsNeeded), '1.5');
    expect(stringValue.unitsNeeded, 2);
    expect(formatBloodRequestUnits(stringValue.unitsNeeded), '2');
  });
}
