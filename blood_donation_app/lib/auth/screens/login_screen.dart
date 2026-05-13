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

class AppLoginScreen extends StatefulWidget {
  const AppLoginScreen({super.key});

  @override
  State<AppLoginScreen> createState() => _AppLoginScreenState();
}

class _AppLoginScreenState extends State<AppLoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  AppRole _role = AppRole.donor;

  @override
  void initState() {
    super.initState();
    _role = AppSession.getSelectedRole();
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    setState(() => _loading = true);
    try {
      final auth = AuthService(getIt());
      final user = await auth.login(
        username: _usernameController.text.trim(),
        password: _passwordController.text,
        role: _role,
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
        debugPrint('Login error: $error');
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
      title: 'Login',
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _usernameController,
              decoration: AppStyle.fieldDecoration('Username'),
            ),
            const SizedBox(height: 12),
            RoleChoiceCard(
              title: 'Donor',
              description: 'Receive requests and respond fast.',
              icon: Icons.bloodtype,
              selected: _role == AppRole.donor,
              onTap: () => setState(() => _role = AppRole.donor),
            ),
            const SizedBox(height: 10),
            RoleChoiceCard(
              title: 'Recipient',
              description: 'Create requests and monitor updates.',
              icon: Icons.emergency,
              selected: _role == AppRole.recipient,
              onTap: () => setState(() => _role = AppRole.recipient),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: AppStyle.fieldDecoration('Password'),
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
                onPressed: _loading ? null : _login,
                child: _loading
                    ? const CircularProgressIndicator()
                    : const Text('Sign In'),
              ),
            ),
            TextButton(
              onPressed: () => Navigator.pushNamed(context, AppRoutes.signup),
              child: const Text('Create account'),
            ),
          ],
        ),
      ),
    );
  }
}
