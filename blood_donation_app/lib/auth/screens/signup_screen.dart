import 'package:blood_donation_app/core/constants/app_constants.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/models/app_models.dart';
import 'package:blood_donation_app/services/app_services.dart';
import 'package:blood_donation_app/shared/app_routes.dart';
import 'package:blood_donation_app/shared/app_session.dart';
import 'package:blood_donation_app/shared/ui/error_message.dart';
import 'package:blood_donation_app/shared/ui/app_style.dart';
import 'package:blood_donation_app/shared/widgets/gradient_scaffold.dart';
import 'package:blood_donation_app/shared/widgets/role_choice_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';

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
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  AppRole _role = AppRole.donor;
  String _bloodGroup = AppConstants.bloodTypes.first;
  bool _loading = false;

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
    _password.dispose();
    _confirm.dispose();
    super.dispose();
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
      );
      if (!mounted) return;
      if (user.role == AppRole.recipient) {
        Navigator.pushReplacementNamed(context, AppRoutes.recipientDashboard);
      } else {
        Navigator.pushReplacementNamed(context, AppRoutes.donorDashboard);
      }
    } catch (error) {
      if (!mounted) return;
      if (kDebugMode) {
        debugPrint('Signup error: $error');
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(toUserMessage(error))),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return GradientScaffold(
      title: 'Signup',
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            RoleChoiceCard(
              title: 'Donor',
              description: 'Always available to help in emergencies.',
              icon: Icons.bloodtype,
              selected: _role == AppRole.donor,
              onTap: () => setState(() => _role = AppRole.donor),
            ),
            const SizedBox(height: 10),
            RoleChoiceCard(
              title: 'Recipient',
              description: 'Request blood quickly and get live updates.',
              icon: Icons.emergency,
              selected: _role == AppRole.recipient,
              onTap: () => setState(() => _role = AppRole.recipient),
            ),
            const SizedBox(height: 12),
            TextField(
                controller: _firstName,
                decoration: AppStyle.fieldDecoration('First Name')),
            const SizedBox(height: 10),
            TextField(
                controller: _lastName,
                decoration: AppStyle.fieldDecoration('Last Name')),
            const SizedBox(height: 10),
            TextField(
                controller: _username,
                decoration: AppStyle.fieldDecoration('Username')),
            const SizedBox(height: 10),
            TextField(
                controller: _email,
                decoration: AppStyle.fieldDecoration('Email')),
            const SizedBox(height: 10),
            TextField(
                controller: _phone,
                decoration: AppStyle.fieldDecoration('Phone')),
            const SizedBox(height: 10),
            if (_role == AppRole.donor) ...[
              DropdownButtonFormField<String>(
                value: _bloodGroup,
                items: AppConstants.bloodTypes
                    .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                    .toList(),
                onChanged: (value) => setState(
                    () => _bloodGroup = value ?? AppConstants.bloodTypes.first),
                decoration: AppStyle.fieldDecoration('Blood Group'),
              ),
              const SizedBox(height: 10),
            ],
            TextField(
              controller: _password,
              obscureText: true,
              decoration: AppStyle.fieldDecoration('Password'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _confirm,
              obscureText: true,
              decoration: AppStyle.fieldDecoration('Confirm Password'),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: AppStyle.redPrimary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _loading ? null : _signup,
                child: _loading
                    ? const CircularProgressIndicator()
                    : const Text('Create Account'),
              ),
            ),
            TextButton(
              onPressed: () =>
                  Navigator.pushReplacementNamed(context, AppRoutes.login),
              child: const Text('Already have account? Sign in'),
            ),
          ],
        ),
      ),
    );
  }
}
