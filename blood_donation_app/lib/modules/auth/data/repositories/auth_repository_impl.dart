import 'package:blood_donation_app/modules/auth/data/datasources/auth_local_datasource.dart';
import 'package:blood_donation_app/modules/auth/data/datasources/auth_remote_datasource.dart';
import 'package:blood_donation_app/modules/auth/data/models/user_model.dart';
import 'package:blood_donation_app/modules/auth/domain/entities/user_entity.dart';
import 'package:blood_donation_app/modules/auth/domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {

  AuthRepositoryImpl(this._remote, this._local);
  final AuthRemoteDataSource _remote;
  final AuthLocalDataSource _local;

  @override
  Future<UserEntity> login({
    required String username,
    required String password,
    required UserRole role,
  }) async {
    final data = await _remote.login(
      username: username,
      password: password,
      role: role.name,
    );
    final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);
    await _local.cacheTokens(
      accessToken: data['access'] as String,
      refreshToken: data['refresh'] as String?,
    );
    await _local.cacheUser(user);
    return user;
  }

  @override
  Future<UserEntity> register({
    required String firstName,
    required String lastName,
    required String username,
    required String email,
    required String password,
    required String confirmPassword,
    required String phone,
    required UserRole role,
    String? donorBloodGroup,
    String? recipientRequiredBloodGroup,
  }) async {
    final data = await _remote.register(
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
      phone: phone,
      role: role.name,
      donorBloodGroup: donorBloodGroup,
      recipientRequiredBloodGroup: recipientRequiredBloodGroup,
    );
    final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);
    await _local.cacheUser(user);
    return user;
  }

  @override
  Future<void> logout() async {
    try {
      final refreshToken = await _local.getRefreshToken();
      await _remote.logout(refreshToken: refreshToken);
    } catch (_) {
      // Always clear local data even if server call fails
    } finally {
      await _local.clearAll();
    }
  }

  @override
  Future<UserEntity?> getCurrentUser() async {
    try {
      final user = await _remote.getProfile();
      await _local.cacheUser(user);
      return user;
    } catch (_) {
      await _local.clearAll();
      return null;
    }
  }

  @override
  Future<void> forgotPassword(String email) {
    return _remote.forgotPassword(email);
  }

  @override
  Future<void> verifyResetCode({
    required String emailOrUsername,
    required String code,
  }) {
    return _remote.verifyResetCode(
      emailOrUsername: emailOrUsername,
      code: code,
    );
  }

  @override
  Future<void> resetPassword({
    required String emailOrUsername,
    required String code,
    required String newPassword,
    required String confirmPassword,
  }) {
    return _remote.resetPassword(
      emailOrUsername: emailOrUsername,
      code: code,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
    );
  }

  @override
  Future<bool> isLoggedIn() async {
    return _local.hasAccessToken();
  }
}
