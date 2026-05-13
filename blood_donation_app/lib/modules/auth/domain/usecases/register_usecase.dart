import 'package:equatable/equatable.dart';
import 'package:blood_donation_app/core/utils/use_case.dart';
import 'package:blood_donation_app/modules/auth/domain/entities/user_entity.dart';
import 'package:blood_donation_app/modules/auth/domain/repositories/auth_repository.dart';

class RegisterUseCase extends UseCase<UserEntity, RegisterParams> {
  RegisterUseCase(this._repository);
  final AuthRepository _repository;

  @override
  Future<UserEntity> call(RegisterParams params) {
    return _repository.register(
      firstName: params.firstName,
      lastName: params.lastName,
      username: params.username,
      email: params.email,
      password: params.password,
      confirmPassword: params.confirmPassword,
      phone: params.phone,
      role: params.role,
      donorBloodGroup: params.donorBloodGroup,
      recipientRequiredBloodGroup: params.recipientRequiredBloodGroup,
    );
  }
}

class RegisterParams extends Equatable {

  const RegisterParams({
    required this.firstName,
    required this.lastName,
    required this.username,
    required this.email,
    required this.password,
    required this.confirmPassword,
    required this.phone,
    required this.role,
    this.donorBloodGroup,
    this.recipientRequiredBloodGroup,
  });
  final String firstName;
  final String lastName;
  final String username;
  final String email;
  final String password;
  final String confirmPassword;
  final String phone;
  final UserRole role;
  final String? donorBloodGroup;
  final String? recipientRequiredBloodGroup;

  @override
  List<Object?> get props => [
    firstName,
    lastName,
    username,
    email,
    password,
    confirmPassword,
    phone,
    role,
    donorBloodGroup,
    recipientRequiredBloodGroup,
  ];
}
