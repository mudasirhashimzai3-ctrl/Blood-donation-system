class AppStrings {
  AppStrings._();

  // General
  static const String appName = 'Blood Donation';
  static const String ok = 'OK';
  static const String cancel = 'Cancel';
  static const String confirm = 'Confirm';
  static const String save = 'Save';
  static const String edit = 'Edit';
  static const String delete = 'Delete';
  static const String retry = 'Retry';
  static const String loading = 'Loading...';
  static const String noData = 'No data available';
  static const String unknownError =
      'An unexpected error occurred. Please try again.';

  // Network
  static const String noInternet =
      'No internet connection. Please check your network.';
  static const String serverError = 'Server error. Please try again later.';
  static const String timeoutError = 'Request timed out. Please try again.';

  // Auth
  static const String login = 'Login';
  static const String logout = 'Logout';
  static const String register = 'Register';
  static const String email = 'Email';
  static const String password = 'Password';
  static const String forgotPassword = 'Forgot Password?';
  static const String sessionExpired =
      'Your session has expired. Please login again.';

  // Validation
  static const String fieldRequired = 'This field is required';
  static const String invalidEmail = 'Please enter a valid email address';
  static const String passwordTooShort =
      'Password must be at least 8 characters';
  static const String passwordsDoNotMatch = 'Passwords do not match';
  static const String invalidPhone = 'Please enter a valid phone number';

  // Donation
  static const String donate = 'Donate';
  static const String requestBlood = 'Request Blood';
  static const String bloodType = 'Blood Type';
  static const String donationHistory = 'Donation History';
  static const String lastDonation = 'Last Donation';
  static const String nextEligibleDate = 'Next Eligible Date';

  // Blood Bank
  static const String nearbyBloodBanks = 'Nearby Blood Banks';
  static const String bloodAvailability = 'Blood Availability';
  static const String findDonors = 'Find Donors';
}
