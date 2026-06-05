import 'dart:async';

import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/core/errors/exceptions.dart';
import 'package:blood_donation_app/core/network/api_client.dart';
import 'package:blood_donation_app/core/storage/secure_storage.dart';
import 'package:blood_donation_app/models/app_models.dart';
import 'package:blood_donation_app/modules/notifications/data/services/notifications_socket_service.dart';
import 'package:blood_donation_app/shared/app_session.dart';
import 'package:flutter/foundation.dart';

String normalizeRequestType(String raw) {
  final value = raw.trim().toLowerCase();
  switch (value) {
    case 'critical':
    case 'urgent':
    case 'normal':
      return value;
    case 'emergency':
      return 'critical';
    case 'high':
      return 'urgent';
    case 'low':
      return 'normal';
    default:
      return 'normal';
  }
}

Map<String, dynamic> _normalizeProfilePayload({
  required Map<String, dynamic> payload,
  required AppRole role,
}) {
  final normalized = Map<String, dynamic>.from(payload);
  if (role == AppRole.donor) {
    normalized['status'] =
        (normalized['status']?.toString().trim().isNotEmpty ?? false)
            ? normalized['status']
            : 'active';
    normalized['profile_status'] = normalized['status'];
  } else if (role == AppRole.recipient) {
    normalized['emergency_level'] =
        (normalized['emergency_level']?.toString().trim().isNotEmpty ?? false)
            ? normalized['emergency_level']
            : 'normal';
    normalized['profile_status'] = normalized['emergency_level'];
  }
  return normalized;
}

class AuthService {
  AuthService(this._apiClient);

  final ApiClient _apiClient;

  Future<AppUser> login({
    required String username,
    required String password,
    required AppRole role,
  }) async {
    await AppSession.setSelectedRole(role);
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/accounts/auth/login/',
      data: {
        'username': username,
        'password': password,
        'role': role.name,
      },
    );

    final data = response.data ?? <String, dynamic>{};
    final user = AppUser.fromJson(data['user'] as Map<String, dynamic>);
    if (user.role == AppRole.admin) {
      throw Exception('Admin is not supported in the mobile app.');
    }

    await AppSession.saveAuth(
      access: (data['access'] ?? '').toString(),
      refresh: data['refresh']?.toString(),
      user: user,
    );
    return user;
  }

  Future<AppUser> signup({
    required String firstName,
    required String lastName,
    required String username,
    required String email,
    required String phone,
    required String password,
    required String confirmPassword,
    required AppRole role,
    String? donorBloodGroup,
    String? donorLatitude,
    String? donorLongitude,
    int? donorAge,
    String? donorDateOfBirth,
    String? donorLastDonationDate,
    String? donorPermanentAddressCity,
    String? donorLocalAddressCity,
    String? recipientRequiredBloodGroup,
    int? recipientHospitalId,
    String? recipientEmergencyLevel,
  }) async {
    await AppSession.setSelectedRole(role);
    final payload = {
      'first_name': firstName,
      'last_name': lastName,
      'username': username,
      'email': email,
      'phone': phone,
      'password': password,
      'confirm_password': confirmPassword,
      'role': role.name,
      if (role == AppRole.donor &&
          donorBloodGroup != null &&
          donorBloodGroup.isNotEmpty)
        'donor_blood_group': donorBloodGroup,
      if (role == AppRole.donor &&
          donorLatitude != null &&
          donorLatitude.trim().isNotEmpty)
        'donor_latitude': donorLatitude.trim(),
      if (role == AppRole.donor &&
          donorLongitude != null &&
          donorLongitude.trim().isNotEmpty)
        'donor_longitude': donorLongitude.trim(),
      if (role == AppRole.donor && donorAge != null) 'donor_age': donorAge,
      if (role == AppRole.donor &&
          donorDateOfBirth != null &&
          donorDateOfBirth.trim().isNotEmpty)
        'donor_date_of_birth': donorDateOfBirth.trim(),
      if (role == AppRole.donor &&
          donorLastDonationDate != null &&
          donorLastDonationDate.trim().isNotEmpty)
        'donor_last_donation_date': donorLastDonationDate.trim(),
      if (role == AppRole.donor &&
          donorPermanentAddressCity != null &&
          donorPermanentAddressCity.trim().isNotEmpty)
        'donor_permanent_address_city': donorPermanentAddressCity.trim(),
      if (role == AppRole.donor &&
          donorLocalAddressCity != null &&
          donorLocalAddressCity.trim().isNotEmpty)
        'donor_local_address_city': donorLocalAddressCity.trim(),
      if (role == AppRole.recipient &&
          recipientRequiredBloodGroup != null &&
          recipientRequiredBloodGroup.isNotEmpty)
        'recipient_required_blood_group': recipientRequiredBloodGroup,
      if (role == AppRole.recipient && recipientHospitalId != null)
        'recipient_hospital': recipientHospitalId,
      if (role == AppRole.recipient &&
          recipientEmergencyLevel != null &&
          recipientEmergencyLevel.isNotEmpty)
        'recipient_emergency_level': recipientEmergencyLevel,
    };

    await _apiClient.post<Map<String, dynamic>>('/accounts/auth/signup/',
        data: payload);
    return login(username: username, password: password, role: role);
  }

  Future<AppUser?> getCurrentUser() async {
    try {
      final response =
          await _apiClient.get<Map<String, dynamic>>('/accounts/users/me/');
      final user = AppUser.fromJson(response.data ?? {});
      if (user.role == AppRole.admin) {
        await AppSession.clear();
        return null;
      }
      AppSession.currentUser = user;
      return user;
    } catch (_) {
      return AppSession.getCachedUser();
    }
  }

  Future<void> logout() async {
    try {
      await _apiClient.post('/accounts/auth/logout/', data: {});
    } catch (_) {}
    await AppSession.clear();
  }
}

class DonorService {
  DonorService(this._apiClient);

  final ApiClient _apiClient;

  Future<Map<String, dynamic>> getDashboard() async {
    final response =
        await _apiClient.get<Map<String, dynamic>>('/donors/mobile-dashboard/');
    final data = response.data ?? <String, dynamic>{};
    final nearby = ((data['nearby_requests'] as List?) ?? const [])
        .map((e) => BloodRequestItem.fromJson(e as Map<String, dynamic>))
        .toList(growable: false);
    final emergency = ((data['emergency_requests'] as List?) ?? const [])
        .map((e) => BloodRequestItem.fromJson(e as Map<String, dynamic>))
        .toList(growable: false);

    return {
      'profile': _normalizeProfilePayload(
        payload:
            Map<String, dynamic>.from((data['profile'] as Map?) ?? const {}),
        role: AppRole.donor,
      ),
      'nearbyRequests': nearby,
      'emergencyRequests': emergency,
      'historyCount': (data['history_count'] as num?)?.toInt() ?? 0,
      'unreadNotifications':
          (data['unread_notifications'] as num?)?.toInt() ?? 0,
    };
  }

  Future<List<DonationItem>> getDonationRequests() async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/donations/',
      queryParameters: {'status': 'pending'},
    );
    final items = (response.data?['results'] as List?) ?? const [];
    return items
        .map((e) => DonationItem.fromJson(e as Map<String, dynamic>))
        .toList(growable: false);
  }

  Future<List<DonationItem>> getDonationHistory() async {
    final response = await _apiClient.get<Map<String, dynamic>>('/donations/');
    final items = (response.data?['results'] as List?) ?? const [];
    return items
        .map((e) => DonationItem.fromJson(e as Map<String, dynamic>))
        .toList(growable: false);
  }

  Future<Map<String, dynamic>> getProfile() async {
    final response = await _apiClient.get<Map<String, dynamic>>('/donors/me/');
    return _normalizeProfilePayload(
      payload: response.data ?? <String, dynamic>{},
      role: AppRole.donor,
    );
  }

  Future<Map<String, dynamic>> updateProfile({
    String? firstName,
    String? lastName,
    String? phone,
    String? email,
    String? bloodGroup,
    int? age,
    String? localAddressCity,
    String? permanentAddressCity,
  }) async {
    final payload = <String, dynamic>{};
    if (firstName != null) payload['first_name'] = firstName.trim();
    if (lastName != null) payload['last_name'] = lastName.trim();
    if (phone != null) payload['phone'] = phone.trim();
    if (email != null) payload['email'] = email.trim();
    if (bloodGroup != null) payload['blood_group'] = bloodGroup.trim();
    if (age != null) payload['age'] = age;
    if (localAddressCity != null) {
      payload['local_address_city'] = localAddressCity.trim();
    }
    if (permanentAddressCity != null) {
      payload['permanent_address_city'] = permanentAddressCity.trim();
    }

    final response = await _apiClient.patch<Map<String, dynamic>>(
      '/donors/me/',
      data: payload,
    );
    return _normalizeProfilePayload(
      payload: response.data ?? <String, dynamic>{},
      role: AppRole.donor,
    );
  }

  Future<void> respondToDonation({
    required String donationId,
    required String action,
  }) async {
    await _apiClient
        .post('/donations/$donationId/respond/', data: {'action': action});
  }
}

class RecipientService {
  RecipientService(this._apiClient);

  final ApiClient _apiClient;

  Future<Map<String, dynamic>> getDashboard() async {
    final response = await _apiClient
        .get<Map<String, dynamic>>('/recipients/mobile-dashboard/');
    final data = response.data ?? <String, dynamic>{};
    final active = ((data['active_requests'] as List?) ?? const [])
        .map((e) => BloodRequestItem.fromJson(e as Map<String, dynamic>))
        .toList(growable: false);
    final emergency = ((data['emergency_requests'] as List?) ?? const [])
        .map((e) => BloodRequestItem.fromJson(e as Map<String, dynamic>))
        .toList(growable: false);

    return {
      'profile': _normalizeProfilePayload(
        payload:
            Map<String, dynamic>.from((data['profile'] as Map?) ?? const {}),
        role: AppRole.recipient,
      ),
      'activeRequests': active,
      'emergencyRequests': emergency,
      'unreadNotifications':
          (data['unread_notifications'] as num?)?.toInt() ?? 0,
    };
  }

  Future<List<BloodRequestItem>> getMyRequests() async {
    final response =
        await _apiClient.get<Map<String, dynamic>>('/blood-requests/');
    final items = (response.data?['results'] as List?) ?? const [];
    return items
        .map((e) => BloodRequestItem.fromJson(e as Map<String, dynamic>))
        .toList(growable: false);
  }

  Future<List<Map<String, dynamic>>> getDonorResponses() async {
    final response =
        await _apiClient.get<List<dynamic>>('/blood-requests/donor-responses/');
    final raw = response.data ?? const [];
    return raw
        .whereType<Map>()
        .map(Map<String, dynamic>.from)
        .toList(growable: false);
  }

  Future<Map<String, dynamic>> getProfile() async {
    final response =
        await _apiClient.get<Map<String, dynamic>>('/recipients/me/');
    return _normalizeProfilePayload(
      payload: response.data ?? <String, dynamic>{},
      role: AppRole.recipient,
    );
  }

  Future<Map<String, dynamic>> updateProfile({
    String? fullName,
    String? phone,
    String? email,
    String? requiredBloodGroup,
    String? emergencyLevel,
    int? hospitalId,
  }) async {
    final payload = <String, dynamic>{};
    if (fullName != null) payload['full_name'] = fullName.trim();
    if (phone != null) payload['phone'] = phone.trim();
    if (email != null) payload['email'] = email.trim();
    if (requiredBloodGroup != null) {
      payload['required_blood_group'] = requiredBloodGroup.trim();
    }
    if (emergencyLevel != null) {
      payload['emergency_level'] = normalizeRequestType(emergencyLevel);
    }
    if (hospitalId != null) payload['hospital'] = hospitalId;

    final response = await _apiClient.patch<Map<String, dynamic>>(
      '/recipients/me/',
      data: payload,
    );
    return _normalizeProfilePayload(
      payload: response.data ?? <String, dynamic>{},
      role: AppRole.recipient,
    );
  }

  Future<List<HospitalItem>> getHospitals({String? search}) async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/hospitals/',
      queryParameters: <String, dynamic>{
        'page_size': 200,
        if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
      },
    );
    final items = (response.data?['results'] as List?) ?? const [];
    return items
        .whereType<Map>()
        .map((entry) => HospitalItem.fromJson(Map<String, dynamic>.from(entry)))
        .toList(growable: false);
  }

  Future<void> createRequest({
    required int hospitalId,
    required String bloodGroup,
    required int units,
    required String emergencyLevel,
  }) async {
    final cleanedBloodGroup = bloodGroup.trim();
    if (cleanedBloodGroup.isEmpty) {
      throw const ValidationException(
        message: 'Blood group is required for creating a request.',
        fieldErrors: {
          'blood_group': ['Blood group is required.']
        },
      );
    }

    await _apiClient.post(
      '/blood-requests/',
      data: {
        'hospital': hospitalId,
        'blood_group': cleanedBloodGroup,
        'units_needed': units,
        'request_type': normalizeRequestType(emergencyLevel),
        'auto_match_enabled': true,
      },
    );
  }
}

class NotificationsService {
  NotificationsService(this._apiClient);

  final ApiClient _apiClient;

  Future<List<NotificationItem>> getNotifications() async {
    final response =
        await _apiClient.get<Map<String, dynamic>>('/notifications/');
    final items = (response.data?['results'] as List?) ?? const [];
    final mapped = items
        .map((e) => NotificationItem.fromJson(e as Map<String, dynamic>))
        .toList(growable: false);
    final sorted = [...mapped]..sort((a, b) {
        final aWeight = a.isEmergency ? 0 : 1;
        final bWeight = b.isEmergency ? 0 : 1;
        if (aWeight != bWeight) return aWeight - bWeight;
        return b.createdAt.compareTo(a.createdAt);
      });
    return sorted;
  }

  Future<int> unreadCount() async {
    final response = await _apiClient
        .get<Map<String, dynamic>>('/notifications/unread-count/');
    return (response.data?['count'] as num?)?.toInt() ?? 0;
  }

  Future<void> markAsRead(String id) async {
    await _apiClient.patch('/notifications/$id/read/', data: {'is_read': true});
  }

  Future<void> markAllAsRead() async {
    await _apiClient.post('/notifications/mark-all-read/', data: {});
  }
}

class RealtimeNotificationsService {
  RealtimeNotificationsService._();

  static final RealtimeNotificationsService instance =
      RealtimeNotificationsService._();

  final ValueNotifier<int> unreadCount = ValueNotifier<int>(0);
  final StreamController<Map<String, dynamic>> _eventsController =
      StreamController<Map<String, dynamic>>.broadcast();
  NotificationsSocketService? _socketService;

  Stream<Map<String, dynamic>> get events => _eventsController.stream;

  @visibleForTesting
  void handleSocketEvent(Map<String, dynamic> payload) {
    final event = payload['event']?.toString() ?? '';
    final data = payload['data'];
    if (event == 'notification.unread_count' && data is Map<String, dynamic>) {
      unreadCount.value = (data['count'] as num?)?.toInt() ?? unreadCount.value;
    }
    _eventsController.add(payload);
  }

  Future<void> connect() async {
    _socketService ??= NotificationsSocketService(getIt<SecureStorage>());
    await _socketService!.connect(
      onEvent: handleSocketEvent,
    );
  }

  Future<void> disconnect() async {
    await _socketService?.disconnect();
  }
}
