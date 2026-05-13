class AppConstants {
  AppConstants._();

  // Storage keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String onboardingDoneKey = 'onboarding_done';

  // Blood types
  static const List<String> bloodTypes = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
  ];

  // Donation eligibility
  static const int minDonationAgeYears = 18;
  static const int maxDonationAgeYears = 65;
  static const double minWeightKg = 50.0;
  static const int minDaysBetweenDonations = 56; // 8 weeks

  // Pagination
  static const int defaultPageSize = 20;

  // Animation durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 350);
  static const Duration longAnimation = Duration(milliseconds: 500);
}
