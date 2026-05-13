import 'package:blood_donation_app/modules/auth/domain/entities/user_entity.dart';

abstract class AuthRepository {
  Future<UserEntity> login({
    required String username,
    required String password,
    required UserRole role,
  });

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
  });
  Future<void> logout();
  Future<UserEntity?> getCurrentUser();
  Future<void> forgotPassword(String emailOrUsername);
  Future<void> verifyResetCode({
    required String emailOrUsername,
    required String code,
  });
  Future<void> resetPassword({
    required String emailOrUsername,
    required String code,
    required String newPassword,
    required String confirmPassword,
  });
  Future<bool> isLoggedIn();
}
