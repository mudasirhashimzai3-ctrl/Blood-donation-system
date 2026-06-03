import 'package:blood_donation_app/auth/widgets/auth_entry_primitives.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/models/app_models.dart';
import 'package:blood_donation_app/services/app_services.dart';
import 'package:blood_donation_app/shared/app_routes.dart';
import 'package:blood_donation_app/shared/app_session.dart';
import 'package:blood_donation_app/shared/ui/error_message.dart';
import 'package:blood_donation_app/shared/ui/app_style.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

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
      if (kDebugMode) debugPrint('Login error: $error');
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
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AuthGlassCard(
              padding: const EdgeInsets.all(18),
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
                          '$roleLabel Access',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: AuthEntryPrimitives.ink,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Continue with your account credentials.',
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
                    controller: _usernameController,
                    decoration: AppStyle.fieldDecoration('Username'),
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
                        backgroundColor: AuthEntryPrimitives.ink,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      onPressed: _loading ? null : _login,
                      child: _loading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child:
                                  CircularProgressIndicator(strokeWidth: 2.3),
                            )
                          : const Text('Sign In'),
                    ),
                  ),
                ],
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
