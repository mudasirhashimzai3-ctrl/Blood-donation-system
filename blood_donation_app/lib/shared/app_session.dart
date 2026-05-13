import 'dart:convert';

import 'package:blood_donation_app/core/constants/app_constants.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/core/storage/local_storage.dart';
import 'package:blood_donation_app/core/storage/secure_storage.dart';
import 'package:blood_donation_app/models/app_models.dart';

class AppSession {
  AppSession._();

  static const _selectedRoleKey = 'selected_mobile_role';
  static AppUser? currentUser;

  static LocalStorage get _local => getIt<LocalStorage>();
  static SecureStorage get _secure => getIt<SecureStorage>();

  static Future<void> setOnboardingDone() async {
    await _local.setBool(AppConstants.onboardingDoneKey, true);
  }

  static bool isOnboardingDone() {
    return _local.getBool(AppConstants.onboardingDoneKey) ?? false;
  }

  static Future<void> setSelectedRole(AppRole role) async {
    await _local.setString(_selectedRoleKey, role.name);
  }

  static AppRole getSelectedRole() {
    final value = _local.getString(_selectedRoleKey);
    switch (value) {
      case 'recipient':
        return AppRole.recipient;
      case 'donor':
      default:
        return AppRole.donor;
    }
  }

  static Future<void> saveAuth({
    required String access,
    String? refresh,
    required AppUser user,
  }) async {
    currentUser = user;
    await _secure.write(AppConstants.accessTokenKey, access);
    if (refresh != null && refresh.isNotEmpty) {
      await _secure.write(AppConstants.refreshTokenKey, refresh);
    }
    await _local.setString(AppConstants.userDataKey, jsonEncode(user.toJson()));
  }

  static Future<bool> hasAccessToken() async {
    return _secure.containsKey(AppConstants.accessTokenKey);
  }

  static Future<void> clear() async {
    currentUser = null;
    await _secure.delete(AppConstants.accessTokenKey);
    await _secure.delete(AppConstants.refreshTokenKey);
    await _local.remove(AppConstants.userDataKey);
  }

  static AppUser? getCachedUser() {
    final raw = _local.getString(AppConstants.userDataKey);
    if (raw == null || raw.isEmpty) return null;
    try {
      return AppUser.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }
}
