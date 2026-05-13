class AppRoutes {
  AppRoutes._();

  // Paths
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';
  static const String home = '/home';
  static const String donorProfile = '/profile';
  static const String donationHistory = '/donations';
  static const String donationDetail = '/donations/:id';
  static const String bloodBanks = '/blood-banks';
  static const String bloodBankDetail = '/blood-banks/:id';
  static const String notifications = '/notifications';
  static const String requestBlood = '/request-blood';

  // Named routes
  static const String splashName = 'splash';
  static const String loginName = 'login';
  static const String registerName = 'register';
  static const String forgotPasswordName = 'forgot-password';
  static const String homeName = 'home';
  static const String donorProfileName = 'donor-profile';
  static const String donationHistoryName = 'donation-history';
  static const String donationDetailName = 'donation-detail';
  static const String bloodBanksName = 'blood-banks';
  static const String bloodBankDetailName = 'blood-bank-detail';
  static const String notificationsName = 'notifications';
  static const String requestBloodName = 'request-blood';
}
