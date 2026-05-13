import 'package:blood_donation_app/modules/auth/domain/entities/user_entity.dart';

class UserModel extends UserEntity {

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final preferences = (json['preferences'] as Map?) ?? const {};
    final permissionsRaw = json['permissions'] as List?;
    return UserModel(
      id: json['id'].toString(),
      firstName: (json['firstName'] ?? json['first_name'] ?? '') as String,
      lastName: (json['lastName'] ?? json['last_name'] ?? '') as String,
      username: (json['username'] ?? '') as String,
      email: (json['email'] ?? '') as String,
      phone: json['phone'] as String?,
      role: _parseRole((json['role'] ?? json['role_name']) as String?),
      permissions:
          permissionsRaw?.map((e) => e.toString()).toList(growable: false) ??
          const [],
      language: (preferences['language'] ?? 'en').toString(),
      theme: (preferences['theme'] ?? 'light').toString(),
    );
  }
  const UserModel({
    required super.id,
    required super.firstName,
    required super.lastName,
    required super.username,
    required super.email,
    super.phone,
    required super.role,
    super.permissions,
    super.language,
    super.theme,
  });

  static UserRole _parseRole(String? value) {
    switch ((value ?? '').toLowerCase()) {
      case 'admin':
        return UserRole.admin;
      case 'recipient':
        return UserRole.recipient;
      default:
        return UserRole.donor;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
      'username': username,
      'email': email,
      'phone': phone,
      'role': role.name,
      'permissions': permissions,
      'preferences': {'language': language, 'theme': theme},
    };
  }
}
