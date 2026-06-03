import 'package:blood_donation_app/core/utils/use_case.dart';
import 'package:blood_donation_app/modules/auth/domain/entities/user_entity.dart';
import 'package:blood_donation_app/modules/auth/domain/repositories/auth_repository.dart';
import 'package:equatable/equatable.dart';

class LoginUseCase extends UseCase<UserEntity, LoginParams> {
  LoginUseCase(this._repository);
  final AuthRepository _repository;

  @override
  Future<UserEntity> call(LoginParams params) {
    return _repository.login(
      username: params.username,
      password: params.password,
      role: params.role,
    );
  }
}

class LoginParams extends Equatable {
  const LoginParams({
    required this.username,
    required this.password,
    required this.role,
  });
  final String username;
  final String password;
  final UserRole role;

  @override
  List<Object?> get props => [username, password, role];
}
