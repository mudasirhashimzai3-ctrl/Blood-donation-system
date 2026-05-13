import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:blood_donation_app/core/config/app_config.dart';
import 'package:blood_donation_app/core/network/api_client.dart';
import 'package:blood_donation_app/core/storage/local_storage.dart';
import 'package:blood_donation_app/core/storage/secure_storage.dart';
import 'package:blood_donation_app/modules/auth/di.dart';
import 'package:blood_donation_app/modules/blood_bank/di.dart';
import 'package:blood_donation_app/modules/donation/di.dart';
import 'package:blood_donation_app/modules/donor/di.dart';

final getIt = GetIt.instance;

Future<void> configureDependencies(AppEnvironment env) async {
  await _registerCore();
  _registerNetwork();
  _registerModules();
}

Future<void> _registerCore() async {
  final sharedPrefs = await SharedPreferences.getInstance();
  getIt.registerLazySingleton<LocalStorage>(() => LocalStorage(sharedPrefs));

  const secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );
  getIt.registerLazySingleton<SecureStorage>(
    () => const SecureStorage(secureStorage),
  );
}

void _registerNetwork() {
  getIt.registerLazySingleton<ApiClient>(
    () => ApiClient(getIt<SecureStorage>()),
  );
}

void _registerModules() {
  AuthDi.register(getIt);
  DonorDi.register(getIt);
  DonationDi.register(getIt);
  BloodBankDi.register(getIt);
  // NotificationsDi.register(getIt); // wire when implemented
}
