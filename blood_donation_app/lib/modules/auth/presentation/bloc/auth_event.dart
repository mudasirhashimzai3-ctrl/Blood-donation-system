part of 'auth_bloc.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();
  @override
  List<Object?> get props => [];
}

class AuthCheckRequested extends AuthEvent {
  const AuthCheckRequested();
}

class AuthLoginRequested extends AuthEvent {

  const AuthLoginRequested({
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

class AuthRegisterRequested extends AuthEvent {

  const AuthRegisterRequested({
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

class AuthLogoutRequested extends AuthEvent {
  const AuthLogoutRequested();
}
