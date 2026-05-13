import 'package:flutter/material.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/core/theme/app_colors.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';
import 'package:blood_donation_app/core/utils/validators.dart';
import 'package:blood_donation_app/core/widgets/buttons/app_button.dart';
import 'package:blood_donation_app/core/widgets/fields/app_text_field.dart';
import 'package:blood_donation_app/core/widgets/layouts/app_scaffold.dart';
import 'package:blood_donation_app/modules/auth/domain/repositories/auth_repository.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _identityController = TextEditingController();
  final _codeController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  int _step = 0;
  bool _loading = false;

  @override
  void dispose() {
    _identityController.dispose();
    _codeController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _sendCode() async {
    final value = _identityController.text.trim();
    if (value.isEmpty) return;
    await _run(() async {
      await getIt<AuthRepository>().forgotPassword(value);
      setState(() => _step = 1);
    }, success: 'Verification code sent.');
  }

  Future<void> _verifyCode() async {
    await _run(() async {
      await getIt<AuthRepository>().verifyResetCode(
        emailOrUsername: _identityController.text.trim(),
        code: _codeController.text.trim(),
      );
      setState(() => _step = 2);
    }, success: 'Code verified.');
  }

  Future<void> _resetPassword() async {
    await _run(() async {
      await getIt<AuthRepository>().resetPassword(
        emailOrUsername: _identityController.text.trim(),
        code: _codeController.text.trim(),
        newPassword: _newPasswordController.text,
        confirmPassword: _confirmPasswordController.text,
      );
      if (!mounted) return;
      Navigator.of(context).pop();
    }, success: 'Password reset successful.');
  }

  Future<void> _run(Future<void> Function() action, {String? success}) async {
    setState(() => _loading = true);
    try {
      await action();
      if (!mounted || success == null) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(success)));
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.toString()),
          backgroundColor: AppColors.error,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Reset Password',
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.screenPaddingH),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppTextField(
              controller: _identityController,
              label: 'Email or Username',
              validator: (v) => AppValidators.required(v, 'Email or Username'),
              enabled: _step == 0 && !_loading,
            ),
            const SizedBox(height: AppDimensions.md),
            if (_step >= 1) ...[
              AppTextField(
                controller: _codeController,
                label: 'Verification Code',
                keyboardType: TextInputType.number,
                enabled: _step == 1 && !_loading,
              ),
              const SizedBox(height: AppDimensions.md),
            ],
            if (_step >= 2) ...[
              AppTextField(
                controller: _newPasswordController,
                label: 'New Password',
                obscureText: true,
                validator: AppValidators.password,
                enabled: !_loading,
              ),
              const SizedBox(height: AppDimensions.md),
              AppTextField(
                controller: _confirmPasswordController,
                label: 'Confirm Password',
                obscureText: true,
                validator: (v) => AppValidators.confirmPassword(
                  v,
                  _newPasswordController.text,
                ),
                enabled: !_loading,
              ),
              const SizedBox(height: AppDimensions.md),
            ],
            AppButton(
              label: _step == 0
                  ? 'Send Code'
                  : _step == 1
                  ? 'Verify Code'
                  : 'Reset Password',
              isLoading: _loading,
              onPressed: _step == 0
                  ? _sendCode
                  : _step == 1
                  ? _verifyCode
                  : _resetPassword,
            ),
          ],
        ),
      ),
    );
  }
}
