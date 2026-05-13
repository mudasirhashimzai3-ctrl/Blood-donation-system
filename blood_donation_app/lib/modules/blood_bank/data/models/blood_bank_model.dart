import 'package:blood_donation_app/modules/blood_bank/domain/entities/blood_bank_entity.dart';

class BloodBankModel extends BloodBankEntity {
  const BloodBankModel({
    required super.id,
    required super.name,
    required super.address,
    required super.city,
    required super.phone,
    super.email,
    super.website,
    required super.latitude,
    required super.longitude,
    required super.bloodInventory,
    super.openingHours,
    super.isOpen,
    super.distanceKm,
  });

  factory BloodBankModel.fromJson(Map<String, dynamic> json) {
    final latitudeRaw = json['latitude'];
    final longitudeRaw = json['longitude'];

    final inventory = <String, int>{};
    return BloodBankModel(
      id: json['id'].toString(),
      name: (json['name'] ?? '') as String,
      address: (json['address'] ?? '') as String,
      city: (json['city'] ?? '') as String,
      phone: (json['phone'] ?? '') as String,
      email: json['email'] as String?,
      latitude: latitudeRaw != null ? double.parse(latitudeRaw.toString()) : 0,
      longitude: longitudeRaw != null
          ? double.parse(longitudeRaw.toString())
          : 0,
      bloodInventory: inventory,
      distanceKm: (json['distance_km'] as num?)?.toDouble(),
    );
  }
}
