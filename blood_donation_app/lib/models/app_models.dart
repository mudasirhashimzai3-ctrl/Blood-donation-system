enum AppRole { donor, recipient, admin, unknown }

class AppUser {
  const AppUser({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.username,
    required this.email,
    required this.role,
    this.profileStatus,
    this.phone,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String username;
  final String email;
  final String? phone;
  final AppRole role;
  final String? profileStatus;

  String get fullName {
    final joined = '$firstName $lastName'.trim();
    return joined.isEmpty ? username : joined;
  }

  factory AppUser.fromJson(Map<String, dynamic> json) {
    final rawRole = ((json['role'] ?? json['role_name']) ?? '').toString();
    return AppUser(
      id: json['id'].toString(),
      firstName: (json['firstName'] ?? json['first_name'] ?? '').toString(),
      lastName: (json['lastName'] ?? json['last_name'] ?? '').toString(),
      username: (json['username'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      phone: json['phone']?.toString(),
      role: _parseRole(rawRole),
      profileStatus: _parseProfileStatus(
        rawRole: rawRole,
        rawProfileStatus: json['profile_status'] ?? json['profileStatus'],
      ),
    );
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
      'profile_status': profileStatus,
    };
  }

  static AppRole _parseRole(String value) {
    switch (value.toLowerCase()) {
      case 'donor':
        return AppRole.donor;
      case 'recipient':
        return AppRole.recipient;
      case 'admin':
        return AppRole.admin;
      default:
        return AppRole.unknown;
    }
  }

  static String _parseProfileStatus({
    required String rawRole,
    required dynamic rawProfileStatus,
  }) {
    final profileStatus = rawProfileStatus?.toString().trim();
    if (profileStatus != null && profileStatus.isNotEmpty) return profileStatus;
    final role = _parseRole(rawRole);
    if (role == AppRole.recipient) return 'normal';
    if (role == AppRole.admin) return 'admin';
    return 'active';
  }
}

class BloodRequestItem {
  const BloodRequestItem({
    required this.id,
    required this.bloodGroup,
    required this.unitsNeeded,
    required this.requestType,
    required this.status,
    required this.isEmergency,
    this.hospitalName,
    this.recipientName,
    this.assignedDonorName,
    this.responseDeadline,
    this.createdAt,
  });

  final String id;
  final String bloodGroup;
  final int unitsNeeded;
  final String requestType;
  final String status;
  final bool isEmergency;
  final String? hospitalName;
  final String? recipientName;
  final String? assignedDonorName;
  final DateTime? responseDeadline;
  final DateTime? createdAt;

  factory BloodRequestItem.fromJson(Map<String, dynamic> json) {
    DateTime? parseDate(dynamic value) {
      if (value == null) return null;
      return DateTime.tryParse(value.toString());
    }

    return BloodRequestItem(
      id: json['id'].toString(),
      bloodGroup: (json['blood_group'] ?? '').toString(),
      unitsNeeded: (json['units_needed'] as num?)?.toInt() ?? 0,
      requestType: (json['request_type'] ?? '').toString(),
      status: (json['status'] ?? '').toString(),
      isEmergency: json['is_emergency'] == true,
      hospitalName: json['hospital_name']?.toString(),
      recipientName: json['recipient_name']?.toString(),
      assignedDonorName: json['assigned_donor_name']?.toString(),
      responseDeadline: parseDate(json['response_deadline']),
      createdAt: parseDate(json['created_at']),
    );
  }
}

class HospitalItem {
  const HospitalItem({
    required this.id,
    required this.name,
    this.province,
    this.city,
    this.address,
  });

  final int id;
  final String name;
  final String? province;
  final String? city;
  final String? address;

  factory HospitalItem.fromJson(Map<String, dynamic> json) {
    return HospitalItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: (json['name'] ?? '').toString(),
      province: json['province']?.toString(),
      city: json['city']?.toString(),
      address: json['address']?.toString(),
    );
  }
}

class DonationItem {
  const DonationItem({
    required this.id,
    required this.requestId,
    required this.status,
    required this.distanceKm,
    required this.estimatedArrivalMinutes,
    this.donorName,
    this.hospitalName,
    this.requestBloodGroup,
    this.respondedAt,
    this.isPrimary = false,
  });

  final String id;
  final String requestId;
  final String status;
  final double distanceKm;
  final int? estimatedArrivalMinutes;
  final String? donorName;
  final String? hospitalName;
  final String? requestBloodGroup;
  final DateTime? respondedAt;
  final bool isPrimary;

  bool get isPending => status == 'pending';

  factory DonationItem.fromJson(Map<String, dynamic> json) {
    return DonationItem(
      id: json['id'].toString(),
      requestId: (json['request'] ?? '').toString(),
      status: (json['status'] ?? '').toString(),
      distanceKm: (json['distance_km'] as num?)?.toDouble() ?? 0,
      estimatedArrivalMinutes:
          (json['estimated_arrival_time'] as num?)?.toInt(),
      donorName: json['donor_name']?.toString(),
      hospitalName: json['hospital_name']?.toString(),
      requestBloodGroup: json['request_blood_group']?.toString(),
      respondedAt: json['responded_at'] == null
          ? null
          : DateTime.tryParse(json['responded_at'].toString()),
      isPrimary: json['is_primary'] == true,
    );
  }
}

class NotificationItem {
  const NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.priority,
    required this.isRead,
    required this.createdAt,
    this.metadata,
  });

  final String id;
  final String title;
  final String message;
  final String type;
  final String priority;
  final bool isRead;
  final DateTime createdAt;
  final Map<String, dynamic>? metadata;

  bool get isEmergency =>
      priority == 'critical' ||
      priority == 'high' ||
      metadata?['is_emergency'] == true;

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'].toString(),
      title: (json['title'] ?? '').toString(),
      message: (json['message'] ?? '').toString(),
      type: (json['type'] ?? '').toString(),
      priority: (json['priority'] ?? 'normal').toString(),
      isRead: json['is_read'] == true,
      createdAt: DateTime.tryParse((json['created_at'] ?? '').toString()) ??
          DateTime.now(),
      metadata: json['metadata'] is Map<String, dynamic>
          ? json['metadata'] as Map<String, dynamic>
          : null,
    );
  }
}
