import 'package:blood_donation_app/core/constants/app_constants.dart';
import 'package:blood_donation_app/core/router/app_routes.dart';
import 'package:blood_donation_app/core/theme/app_colors.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';
import 'package:blood_donation_app/core/theme/app_text_styles.dart';
import 'package:blood_donation_app/core/utils/validators.dart';
import 'package:blood_donation_app/core/widgets/buttons/app_button.dart';
import 'package:blood_donation_app/core/widgets/fields/app_dropdown_field.dart';
import 'package:blood_donation_app/core/widgets/fields/app_text_field.dart';
import 'package:blood_donation_app/core/widgets/layouts/app_scaffold.dart';
import 'package:blood_donation_app/modules/auth/domain/entities/user_entity.dart';
import 'package:blood_donation_app/modules/auth/presentation/bloc/auth_bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();

  UserRole _selectedRole = UserRole.donor;
  String? _selectedBloodType;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _usernameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  void _onRegister() {
    if (!_formKey.currentState!.validate()) return;
    context.read<AuthBloc>().add(
      AuthRegisterRequested(
        firstName: _firstNameController.text.trim(),
        lastName: _lastNameController.text.trim(),
        username: _usernameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        confirmPassword: _confirmController.text,
        phone: _phoneController.text.trim(),
        role: _selectedRole,
        donorBloodGroup: _selectedRole == UserRole.donor
            ? _selectedBloodType
            : null,
        recipientRequiredBloodGroup: _selectedRole == UserRole.recipient
            ? _selectedBloodType
            : null,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthAuthenticated) {
          context.goNamed(AppRoutes.homeName);
        } else if (state is AuthFailure) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: AppColors.error,
            ),
          );
        }
      },
      child: AppScaffold(
        title: 'Create Account',
        body: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(
            horizontal: AppDimensions.screenPaddingH,
            vertical: AppDimensions.screenPaddingV,
          ),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Join and save lives', style: AppTextStyles.displayMedium),
                const SizedBox(height: AppDimensions.xs),
                Text(
                  'Create your account to get started',
                  style: AppTextStyles.bodyLarge.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: AppDimensions.xl),
                AppDropdownField<UserRole>(
                  label: 'Role',
                  value: _selectedRole,
                  items: const [
                    DropdownMenuItem(
                      value: UserRole.donor,
                      child: Text('Donor'),
                    ),
                    DropdownMenuItem(
                      value: UserRole.recipient,
                      child: Text('Recipient'),
                    ),
                  ],
                  onChanged: (value) {
                    if (value != null) {
                      setState(() {
                        _selectedRole = value;
                        _selectedBloodType = null;
                      });
                    }
                  },
                ),
                const SizedBox(height: AppDimensions.md),
                Row(
                  children: [
                    Expanded(
                      child: AppTextField(
                        controller: _firstNameController,
                        label: 'First Name',
                        textInputAction: TextInputAction.next,
                        validator: (v) =>
                            AppValidators.required(v, 'First name'),
                      ),
                    ),
                    const SizedBox(width: AppDimensions.sm),
                    Expanded(
                      child: AppTextField(
                        controller: _lastNameController,
                        label: 'Last Name',
                        textInputAction: TextInputAction.next,
                        validator: (v) =>
                            AppValidators.required(v, 'Last name'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppDimensions.md),
                AppTextField(
                  controller: _usernameController,
                  label: 'Username',
                  hint: 'your_username',
                  prefixIcon: const Icon(Icons.person_outline_rounded),
                  textInputAction: TextInputAction.next,
                  validator: (v) => AppValidators.required(v, 'Username'),
                ),
                const SizedBox(height: AppDimensions.md),
                AppTextField(
                  controller: _emailController,
                  label: 'Email Address',
                  hint: 'you@example.com',
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: const Icon(Icons.email_outlined),
                  textInputAction: TextInputAction.next,
                  validator: AppValidators.email,
                ),
                const SizedBox(height: AppDimensions.md),
                AppTextField(
                  controller: _phoneController,
                  label: 'Phone Number',
                  hint: '+93700000000',
                  keyboardType: TextInputType.phone,
                  prefixIcon: const Icon(Icons.phone_outlined),
                  textInputAction: TextInputAction.next,
                  validator: AppValidators.phone,
                ),
                const SizedBox(height: AppDimensions.md),
                AppDropdownField<String>(
                  label: _selectedRole == UserRole.recipient
                      ? 'Required Blood Group'
                      : 'Blood Group',
                  value: _selectedBloodType,
                  prefixIcon: const Icon(Icons.bloodtype_outlined),
                  items: AppConstants.bloodTypes
                      .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                      .toList(),
                  onChanged: (v) => setState(() => _selectedBloodType = v),
                  validator: (value) {
                    if (_selectedRole == UserRole.donor &&
                        (value == null || value.isEmpty)) {
                      return 'Blood group is required for donor';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: AppDimensions.md),
                AppTextField(
                  controller: _passwordController,
                  label: 'Password',
                  hint: 'Min. 8 characters',
                  obscureText: true,
                  prefixIcon: const Icon(Icons.lock_outline_rounded),
                  textInputAction: TextInputAction.next,
                  validator: AppValidators.password,
                ),
                const SizedBox(height: AppDimensions.md),
                AppTextField(
                  controller: _confirmController,
                  label: 'Confirm Password',
                  hint: 'Re-enter your password',
                  obscureText: true,
                  prefixIcon: const Icon(Icons.lock_outline_rounded),
                  textInputAction: TextInputAction.done,
                  validator: (v) => AppValidators.confirmPassword(
                    v,
                    _passwordController.text,
                  ),
                ),
                const SizedBox(height: AppDimensions.xl),
                BlocBuilder<AuthBloc, AuthState>(
                  builder: (context, state) => AppButton(
                    label: 'Create Account',
                    isLoading: state is AuthLoading,
                    onPressed: _onRegister,
                  ),
                ),
                const SizedBox(height: AppDimensions.lg),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Already have an account? ',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => context.goNamed(AppRoutes.loginName),
                      child: Text(
                        'Sign In',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppDimensions.xl),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
