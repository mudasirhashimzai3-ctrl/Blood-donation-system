import 'package:blood_donation_app/services/app_services.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('normalizes legacy priority labels to API request_type enums', () {
    expect(normalizeRequestType('normal'), 'normal');
    expect(normalizeRequestType('urgent'), 'urgent');
    expect(normalizeRequestType('critical'), 'critical');
    expect(normalizeRequestType('Emergency'), 'critical');
    expect(normalizeRequestType('High'), 'urgent');
    expect(normalizeRequestType('Low'), 'normal');
    expect(normalizeRequestType('unknown'), 'normal');
  });
}
