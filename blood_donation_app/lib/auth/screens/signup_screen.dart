import 'dart:async';

import 'package:blood_donation_app/auth/widgets/auth_entry_primitives.dart';
import 'package:blood_donation_app/core/constants/app_constants.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/models/app_models.dart';
import 'package:blood_donation_app/services/app_services.dart';
import 'package:blood_donation_app/shared/app_routes.dart';
import 'package:blood_donation_app/shared/app_session.dart';
import 'package:blood_donation_app/shared/ui/app_style.dart';
import 'package:blood_donation_app/shared/ui/error_message.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

class AppSignupScreen extends StatefulWidget {
  const AppSignupScreen({super.key});

  @override
  State<AppSignupScreen> createState() => _AppSignupScreenState();
}

class _AppSignupScreenState extends State<AppSignupScreen> {
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _username = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _age = TextEditingController();
  final _latitude = TextEditingController();
  final _longitude = TextEditingController();
  final _dateOfBirth = TextEditingController();
  final _lastDonationDate = TextEditingController();
  final _permanentAddressCity = TextEditingController();
  final _localAddressCity = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  AppRole _role = AppRole.donor;
  String _bloodGroup = AppConstants.bloodTypes.first;
  bool _loading = false;
  bool _locating = false;
  bool _passwordVisible = false;
  bool _confirmPasswordVisible = false;

  @override
  void initState() {
    super.initState();
    _role = AppSession.getSelectedRole();
  }

  @override
  void dispose() {
    _firstName.dispose();
    _lastName.dispose();
    _username.dispose();
    _email.dispose();
    _phone.dispose();
    _age.dispose();
    _latitude.dispose();
    _longitude.dispose();
    _dateOfBirth.dispose();
    _lastDonationDate.dispose();
    _permanentAddressCity.dispose();
    _localAddressCity.dispose();
    _password.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _pickDate(TextEditingController controller) async {
    final initialDate = DateTime.tryParse(controller.text) ?? DateTime.now();
    final selected = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (selected == null) return;
    controller.text =
        '${selected.year.toString().padLeft(4, '0')}-${selected.month.toString().padLeft(2, '0')}-${selected.day.toString().padLeft(2, '0')}';
  }

  bool _validateCoordinate({
    required TextEditingController controller,
    required String label,
    required double min,
    required double max,
  }) {
    final raw = controller.text.trim();
    if (raw.isEmpty) return true;
    final parsed = double.tryParse(raw);
    if (parsed == null || parsed < min || parsed > max) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$label must be between $min and $max.')),
      );
      return false;
    }
    return true;
  }

  void _showLocationMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  Future<void> _registerMyLocation() async {
    if (_locating) return;
    setState(() => _locating = true);

    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        _showLocationMessage(
          'Location services are disabled. Please enable location and try again.',
        );
        return;
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.denied) {
        _showLocationMessage('Location permission was denied.');
        return;
      }

      if (permission == LocationPermission.deniedForever) {
        _showLocationMessage(
          'Location permission is permanently denied. Enable it in app settings.',
        );
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 15),
        ),
      );

      if (!mounted) return;
      setState(() {
        _latitude.text = position.latitude.toStringAsFixed(6);
        _longitude.text = position.longitude.toStringAsFixed(6);
      });
      _showLocationMessage('Location registered.');
    } on TimeoutException {
      _showLocationMessage('Location request timed out. Please try again.');
    } on UnsupportedError {
      _showLocationMessage('Location is not supported on this device.');
    } catch (error) {
      if (kDebugMode) debugPrint('Register location error: $error');
      _showLocationMessage('Failed to register location.');
    } finally {
      if (mounted) setState(() => _locating = false);
    }
  }

  Future<void> _signup() async {
    final phone = _phone.text.trim();
    if (phone.length != 10 || int.tryParse(phone) == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Phone number must be exactly 10 digits.')),
      );
      return;
    }

    if (_role == AppRole.donor && _bloodGroup.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Blood group is required for donor signup.')),
      );
      return;
    }

    if (_role == AppRole.donor) {
      if (!_validateCoordinate(
        controller: _latitude,
        label: 'Latitude',
        min: -90,
        max: 90,
      )) {
        return;
      }
      if (!_validateCoordinate(
        controller: _longitude,
        label: 'Longitude',
        min: -180,
        max: 180,
      )) {
        return;
      }
      final age = _age.text.trim();
      if (age.isNotEmpty) {
        final parsedAge = int.tryParse(age);
        if (parsedAge == null || parsedAge < 1 || parsedAge > 150) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Age must be a valid number between 1 and 150.'),
            ),
          );
          return;
        }
      }
    }

    setState(() => _loading = true);
    try {
      final auth = AuthService(getIt());
      final user = await auth.signup(
        firstName: _firstName.text.trim(),
        lastName: _lastName.text.trim(),
        username: _username.text.trim(),
        email: _email.text.trim(),
        phone: phone,
        password: _password.text,
        confirmPassword: _confirm.text,
        role: _role,
        donorBloodGroup: _role == AppRole.donor ? _bloodGroup : null,
        donorLatitude: _role == AppRole.donor ? _latitude.text : null,
        donorLongitude: _role == AppRole.donor ? _longitude.text : null,
        donorAge:
            _role == AppRole.donor ? int.tryParse(_age.text.trim()) : null,
        donorDateOfBirth: _role == AppRole.donor ? _dateOfBirth.text : null,
        donorLastDonationDate:
            _role == AppRole.donor ? _lastDonationDate.text : null,
        donorPermanentAddressCity:
            _role == AppRole.donor ? _permanentAddressCity.text : null,
        donorLocalAddressCity:
            _role == AppRole.donor ? _localAddressCity.text : null,
      );
      if (!mounted) return;
      if (user.role == AppRole.recipient) {
        await Navigator.pushReplacementNamed(
          context,
          AppRoutes.recipientDashboard,
        );
      } else {
        await Navigator.pushReplacementNamed(context, AppRoutes.donorDashboard);
      }
    } catch (error) {
      if (!mounted) return;
      if (kDebugMode) debugPrint('Signup error: $error');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(toUserMessage(error))),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isRecipient = _role == AppRole.recipient;
    final roleLabel = isRecipient ? 'Recipient' : 'Donor';
    final gradient = isRecipient
        ? const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AuthEntryPrimitives.recipientStart,
              AuthEntryPrimitives.recipientEnd,
            ],
          )
        : const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AuthEntryPrimitives.donorStart,
              AuthEntryPrimitives.donorEnd
            ],
          );
    final icon = isRecipient
        ? Icons.medical_services_rounded
        : Icons.volunteer_activism_rounded;

    return AuthEntryScaffold(
      maxContentWidth: 620,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AuthGlassCard(
              child: Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      gradient: gradient,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Icon(icon, color: Colors.white),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '$roleLabel Registration',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: AuthEntryPrimitives.ink,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Create your account to continue.',
                          style: TextStyle(color: AuthEntryPrimitives.mutedInk),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            AuthGlassCard(
              child: Column(
                children: [
                  TextField(
                    controller: _firstName,
                    decoration: AppStyle.fieldDecoration('First Name'),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _lastName,
                    decoration: AppStyle.fieldDecoration('Last Name'),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _username,
                    decoration: AppStyle.fieldDecoration('Username'),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _email,
                    decoration: AppStyle.fieldDecoration('Email'),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _phone,
                    decoration: AppStyle.fieldDecoration('Phone'),
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 10),
                  if (_role == AppRole.donor) ...[
                    DropdownButtonFormField<String>(
                      initialValue: _bloodGroup,
                      items: AppConstants.bloodTypes
                          .map(
                            (e) => DropdownMenuItem(
                              value: e,
                              child: Text(e),
                            ),
                          )
                          .toList(),
                      onChanged: (value) => setState(
                        () => _bloodGroup =
                            value ?? AppConstants.bloodTypes.first,
                      ),
                      decoration: AppStyle.fieldDecoration('Blood Group'),
                    ),
                    const SizedBox(height: 10),
                    const _SignupSectionTitle(
                      title: 'Donor Profile',
                      subtitle: 'Matches the donor admin profile fields.',
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _age,
                      keyboardType: TextInputType.number,
                      decoration: AppStyle.fieldDecoration('Age'),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _dateOfBirth,
                      readOnly: true,
                      onTap: () => _pickDate(_dateOfBirth),
                      decoration:
                          AppStyle.fieldDecoration('Date of Birth').copyWith(
                        suffixIcon: IconButton(
                          onPressed: () => _pickDate(_dateOfBirth),
                          icon: const Icon(Icons.calendar_today_rounded),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _lastDonationDate,
                      readOnly: true,
                      onTap: () => _pickDate(_lastDonationDate),
                      decoration: AppStyle.fieldDecoration('Last Donation Date')
                          .copyWith(
                        suffixIcon: IconButton(
                          onPressed: () => _pickDate(_lastDonationDate),
                          icon: const Icon(Icons.event_available_rounded),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _locating ? null : _registerMyLocation,
                        icon: _locating
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.my_location_rounded),
                        label: Text(
                          _locating
                              ? 'Registering Location...'
                              : 'Register My Location',
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _latitude,
                            keyboardType: const TextInputType.numberWithOptions(
                              decimal: true,
                              signed: true,
                            ),
                            decoration: AppStyle.fieldDecoration('Latitude'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: _longitude,
                            keyboardType: const TextInputType.numberWithOptions(
                              decimal: true,
                              signed: true,
                            ),
                            decoration: AppStyle.fieldDecoration('Longitude'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _permanentAddressCity,
                      decoration:
                          AppStyle.fieldDecoration('Permanent Address City'),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _localAddressCity,
                      decoration:
                          AppStyle.fieldDecoration('Local Address City'),
                    ),
                    const SizedBox(height: 10),
                  ],
                  TextField(
                    controller: _password,
                    obscureText: !_passwordVisible,
                    decoration: AppStyle.fieldDecoration('Password').copyWith(
                      suffixIcon: IconButton(
                        tooltip: _passwordVisible
                            ? 'Hide password'
                            : 'Show password',
                        onPressed: () => setState(
                          () => _passwordVisible = !_passwordVisible,
                        ),
                        icon: Icon(
                          _passwordVisible
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _confirm,
                    obscureText: !_confirmPasswordVisible,
                    decoration:
                        AppStyle.fieldDecoration('Confirm Password').copyWith(
                      suffixIcon: IconButton(
                        tooltip: _confirmPasswordVisible
                            ? 'Hide password'
                            : 'Show password',
                        onPressed: () => setState(
                          () => _confirmPasswordVisible =
                              !_confirmPasswordVisible,
                        ),
                        icon: Icon(
                          _confirmPasswordVisible
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      style: FilledButton.styleFrom(
                        backgroundColor: AuthEntryPrimitives.ink,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      onPressed: _loading ? null : _signup,
                      child: _loading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child:
                                  CircularProgressIndicator(strokeWidth: 2.3),
                            )
                          : const Text('Create Account'),
                    ),
                  ),
                ],
              ),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Already have an account? Sign in'),
            ),
          ],
        ),
      ),
    );
  }
}

class _SignupSectionTitle extends StatelessWidget {
  const _SignupSectionTitle({
    required this.title,
    required this.subtitle,
  });

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AuthEntryPrimitives.ink,
              fontSize: 15,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            subtitle,
            style: const TextStyle(
              color: AuthEntryPrimitives.mutedInk,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
