enum AppRole { donor, recipient, admin, unknown }

const allowedBloodRequestUnits = <double>[1, 1.5, 2];

double parseBloodRequestUnits(dynamic value, {double fallback = 0}) {
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '') ?? fallback;
}

String formatBloodRequestUnits(double value) {
  if (value % 1 == 0) return value.toInt().toString();
  return value.toStringAsFixed(1);
}

class AppUser {
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
  factory BloodRequestItem.fromJson(Map<String, dynamic> json) {
    DateTime? parseDate(dynamic value) {
      if (value == null) return null;
      return DateTime.tryParse(value.toString());
    }

    final status = (json['status'] ?? '').toString();
    return BloodRequestItem(
      id: json['id'].toString(),
      bloodGroup: (json['blood_group'] ?? '').toString(),
      unitsNeeded: parseBloodRequestUnits(json['units_needed']),
      requestType: (json['request_type'] ?? '').toString(),
      status: status,
      isActive: json['is_active'] == true ||
          (json['is_active'] == null &&
              status != 'completed' &&
              status != 'cancelled'),
      isEmergency: json['is_emergency'] == true,
      hospitalName: json['hospital_name']?.toString(),
      recipientName: json['recipient_name']?.toString(),
      assignedDonorName: json['assigned_donor_name']?.toString(),
      responseDeadline: parseDate(json['response_deadline']),
      createdAt: parseDate(json['created_at']),
    );
  }
  const BloodRequestItem({
    required this.id,
    required this.bloodGroup,
    required this.unitsNeeded,
    required this.requestType,
    required this.status,
    required this.isActive,
    required this.isEmergency,
    this.hospitalName,
    this.recipientName,
    this.assignedDonorName,
    this.responseDeadline,
    this.createdAt,
  });

  final String id;
  final String bloodGroup;
  final double unitsNeeded;
  final String requestType;
  final String status;
  final bool isActive;
  final bool isEmergency;
  final String? hospitalName;
  final String? recipientName;
  final String? assignedDonorName;
  final DateTime? responseDeadline;
  final DateTime? createdAt;
}

class HospitalItem {
  factory HospitalItem.fromJson(Map<String, dynamic> json) {
    return HospitalItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: (json['name'] ?? '').toString(),
      province: json['province']?.toString(),
      city: json['city']?.toString(),
      address: json['address']?.toString(),
    );
  }
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
}

class AvailableDonorItem {
  factory AvailableDonorItem.fromJson(Map<String, dynamic> json) {
    double parseDistance(dynamic value) {
      if (value is num) return value.toDouble();
      return double.tryParse(value?.toString() ?? '') ?? 0;
    }

    return AvailableDonorItem(
      id: json['id'].toString(),
      fullName: (json['full_name'] ?? '').toString(),
      bloodGroup: (json['blood_group'] ?? '').toString(),
      matchStatus: (json['match_status'] ?? '').toString(),
      distanceKm: parseDistance(json['distance_km']),
      eligibilityStatus: (json['eligibility_status'] ?? '').toString(),
      isEligible: json['is_eligible'] == true,
      phone: (json['phone'] ?? '').toString(),
    );
  }

  const AvailableDonorItem({
    required this.id,
    required this.fullName,
    required this.bloodGroup,
    required this.matchStatus,
    required this.distanceKm,
    required this.eligibilityStatus,
    required this.isEligible,
    required this.phone,
  });

  final String id;
  final String fullName;
  final String bloodGroup;
  final String matchStatus;
  final double distanceKm;
  final String eligibilityStatus;
  final bool isEligible;
  final String phone;
}

class DonationItem {
  factory DonationItem.fromJson(Map<String, dynamic> json) {
    double parseDistance(dynamic value) {
      if (value is num) return value.toDouble();
      return double.tryParse(value?.toString() ?? '') ?? 0;
    }

    int? parseMinutes(dynamic value) {
      if (value is num) return value.toInt();
      return int.tryParse(value?.toString() ?? '');
    }

    String? firstText(List<dynamic> values) {
      for (final value in values) {
        final text = value?.toString().trim();
        if (text != null && text.isNotEmpty) return text;
      }
      return null;
    }

    return DonationItem(
      id: json['id'].toString(),
      requestId: (json['request'] ?? '').toString(),
      status: (json['status'] ?? '').toString(),
      distanceKm: parseDistance(
        json['distance_km'] ?? json['distance_dynamic'],
      ),
      estimatedArrivalMinutes: parseMinutes(
        json['estimated_arrival_time'] ?? json['estimated_time_dynamic'],
      ),
      donorName: json['donor_name']?.toString(),
      hospitalName: json['hospital_name']?.toString(),
      recipientName: json['recipient_name']?.toString(),
      recipientCondition: json['recipient_condition']?.toString(),
      requestBloodGroup: json['request_blood_group']?.toString(),
      requestType: json['request_type']?.toString(),
      condition: firstText([
        json['recipient_condition'],
        json['condition'],
        json['request_type'],
      ]),
      respondedAt: json['responded_at'] == null
          ? null
          : DateTime.tryParse(json['responded_at'].toString()),
      isPrimary: json['is_primary'] == true,
      canAcceptResponse: json['can_accept_response'] == true,
      acceptResponseUnavailableReason:
          json['accept_response_unavailable_reason']?.toString(),
    );
  }
  const DonationItem({
    required this.id,
    required this.requestId,
    required this.status,
    required this.distanceKm,
    required this.estimatedArrivalMinutes,
    this.donorName,
    this.hospitalName,
    this.recipientName,
    this.recipientCondition,
    this.requestBloodGroup,
    this.requestType,
    this.condition,
    this.respondedAt,
    this.isPrimary = false,
    this.canAcceptResponse = false,
    this.acceptResponseUnavailableReason,
  });

  final String id;
  final String requestId;
  final String status;
  final double distanceKm;
  final int? estimatedArrivalMinutes;
  final String? donorName;
  final String? hospitalName;
  final String? recipientName;
  final String? recipientCondition;
  final String? requestBloodGroup;
  final String? requestType;
  final String? condition;
  final DateTime? respondedAt;
  final bool isPrimary;
  final bool canAcceptResponse;
  final String? acceptResponseUnavailableReason;

  bool get isPending => status == 'pending';
  bool get canAccept => isPending && canAcceptResponse;
}

class NotificationItem {
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
}
