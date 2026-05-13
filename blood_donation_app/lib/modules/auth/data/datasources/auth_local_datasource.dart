import 'dart:convert';
import 'package:blood_donation_app/core/constants/app_constants.dart';
import 'package:blood_donation_app/core/storage/local_storage.dart';
import 'package:blood_donation_app/core/storage/secure_storage.dart';
import 'package:blood_donation_app/modules/auth/data/models/user_model.dart';

abstract class AuthLocalDataSource {
  Future<void> cacheTokens({
    required String accessToken,
    required String? refreshToken,
  });
  Future<String?> getAccessToken();
  Future<String?> getRefreshToken();
  Future<bool> hasAccessToken();
  Future<void> cacheUser(UserModel user);
  Future<UserModel?> getCachedUser();
  Future<void> clearAll();
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {

  AuthLocalDataSourceImpl(this._secureStorage, this._localStorage);
  final SecureStorage _secureStorage;
  final LocalStorage _localStorage;

  @override
  Future<void> cacheTokens({
    required String accessToken,
    required String? refreshToken,
  }) async {
    await _secureStorage.write(AppConstants.accessTokenKey, accessToken);
    if (refreshToken != null) {
      await _secureStorage.write(AppConstants.refreshTokenKey, refreshToken);
    }
  }

  @override
  Future<String?> getAccessToken() =>
      _secureStorage.read(AppConstants.accessTokenKey);

  @override
  Future<String?> getRefreshToken() =>
      _secureStorage.read(AppConstants.refreshTokenKey);

  @override
  Future<bool> hasAccessToken() =>
      _secureStorage.containsKey(AppConstants.accessTokenKey);

  @override
  Future<void> cacheUser(UserModel user) async {
    await _localStorage.setString(
      AppConstants.userDataKey,
      jsonEncode(user.toJson()),
    );
  }

  @override
  Future<UserModel?> getCachedUser() async {
    final json = _localStorage.getString(AppConstants.userDataKey);
    if (json == null) return null;
    return UserModel.fromJson(jsonDecode(json) as Map<String, dynamic>);
  }

  @override
  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    await _localStorage.remove(AppConstants.userDataKey);
  }
}
