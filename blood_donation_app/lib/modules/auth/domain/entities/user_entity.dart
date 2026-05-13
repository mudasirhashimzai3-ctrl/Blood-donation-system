import 'package:equatable/equatable.dart';

enum UserRole { admin, donor, recipient }

class UserEntity extends Equatable {

  const UserEntity({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.username,
    required this.email,
    this.phone,
    required this.role,
    this.permissions = const [],
    this.language = 'en',
    this.theme = 'light',
  });
  final String id;
  final String firstName;
  final String lastName;
  final String username;
  final String email;
  final String? phone;
  final UserRole role;
  final List<String> permissions;
  final String language;
  final String theme;

  String get fullName {
    final joined = '$firstName $lastName'.trim();
    return joined.isEmpty ? username : joined;
  }

  @override
  List<Object?> get props => [
    id,
    firstName,
    lastName,
    username,
    email,
    phone,
    role,
    permissions,
    language,
    theme,
  ];
}
