import 'package:blood_donation_app/modules/donor/domain/entities/donor_entity.dart';

class DonorModel extends DonorEntity {
  const DonorModel({
    required super.id,
    required super.name,
    required super.bloodType,
    super.phone,
    super.email,
    super.avatarUrl,
    super.latitude,
    super.longitude,
    super.city,
    super.isAvailable,
    super.lastDonationDate,
    super.totalDonations,
  });

  factory DonorModel.fromJson(Map<String, dynamic> json) {
    final firstName = (json['first_name'] ?? '') as String;
    final lastName = (json['last_name'] ?? '') as String;
    final displayName = '$firstName $lastName'.trim();
    return DonorModel(
      id: json['id'].toString(),
      name: displayName.isEmpty ? 'Unknown donor' : displayName,
      bloodType: (json['blood_group'] ?? 'O+') as String,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      avatarUrl: json['profile_picture_url'] as String?,
      latitude: json['latitude'] != null
          ? double.parse(json['latitude'].toString())
          : null,
      longitude: json['longitude'] != null
          ? double.parse(json['longitude'].toString())
          : null,
      city:
          (json['local_address_city'] ?? json['permanent_address_city'])
              as String?,
      isAvailable: (json['status'] ?? 'active') == 'active',
      lastDonationDate: json['last_donation_date'] != null
          ? DateTime.parse(json['last_donation_date'] as String)
          : null,
      totalDonations: json['total_donations'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'blood_type': bloodType,
    'phone': phone,
    'email': email,
    'avatar_url': avatarUrl,
    'latitude': latitude,
    'longitude': longitude,
    'city': city,
    'is_available': isAvailable,
    'last_donation_date': lastDonationDate?.toIso8601String(),
    'total_donations': totalDonations,
  };
}
