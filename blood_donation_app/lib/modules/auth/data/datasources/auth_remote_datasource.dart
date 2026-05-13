import 'package:blood_donation_app/core/network/api_client.dart';
import 'package:blood_donation_app/modules/auth/data/models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<Map<String, dynamic>> login({
    required String username,
    required String password,
    required String role,
  });
  Future<Map<String, dynamic>> register({
    required String firstName,
    required String lastName,
    required String username,
    required String email,
    required String password,
    required String confirmPassword,
    required String phone,
    required String role,
    String? donorBloodGroup,
    String? recipientRequiredBloodGroup,
  });
  Future<void> logout({String? refreshToken});
  Future<UserModel> getProfile();
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
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  AuthRemoteDataSourceImpl(this._apiClient);
  final ApiClient _apiClient;

  @override
  Future<Map<String, dynamic>> login({
    required String username,
    required String password,
    required String role,
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/accounts/auth/login/',
      data: {'username': username, 'password': password, 'role': role},
    );
    return response.data!;
  }

  @override
  Future<Map<String, dynamic>> register({
    required String firstName,
    required String lastName,
    required String username,
    required String email,
    required String password,
    required String confirmPassword,
    required String phone,
    required String role,
    String? donorBloodGroup,
    String? recipientRequiredBloodGroup,
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/accounts/auth/signup/',
      data: {
        'first_name': firstName,
        'last_name': lastName,
        'username': username,
        'email': email,
        'password': password,
        'confirm_password': confirmPassword,
        'phone': phone,
        'role': role,
        if (donorBloodGroup != null) 'donor_blood_group': donorBloodGroup,
        if (recipientRequiredBloodGroup != null)
          'recipient_required_blood_group': recipientRequiredBloodGroup,
      },
    );
    return response.data!;
  }

  @override
  Future<void> logout({String? refreshToken}) async {
    await _apiClient.post(
      '/accounts/auth/logout/',
      data: refreshToken == null ? {} : {'refresh': refreshToken},
    );
  }

  @override
  Future<UserModel> getProfile() async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/accounts/users/me/',
    );
    return UserModel.fromJson(response.data!);
  }

  @override
  Future<void> forgotPassword(String emailOrUsername) async {
    await _apiClient.post(
      '/accounts/auth/forgot-password/',
      data: {'email_or_username': emailOrUsername},
    );
  }

  @override
  Future<void> verifyResetCode({
    required String emailOrUsername,
    required String code,
  }) async {
    await _apiClient.post(
      '/accounts/auth/verify-reset-code/',
      data: {'email_or_username': emailOrUsername, 'code': code},
    );
  }

  @override
  Future<void> resetPassword({
    required String emailOrUsername,
    required String code,
    required String newPassword,
    required String confirmPassword,
  }) async {
    await _apiClient.post(
      '/accounts/auth/reset-password/',
      data: {
        'email_or_username': emailOrUsername,
        'code': code,
        'new_password': newPassword,
        'confirm_password': confirmPassword,
      },
    );
  }
}
