import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/core/router/app_routes.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';
import 'package:blood_donation_app/core/widgets/buttons/app_button.dart';
import 'package:blood_donation_app/core/widgets/layouts/app_scaffold.dart';
import 'package:blood_donation_app/modules/auth/domain/entities/user_entity.dart';
import 'package:blood_donation_app/modules/auth/domain/repositories/auth_repository.dart';
import 'package:blood_donation_app/modules/auth/presentation/bloc/auth_bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late Future<UserEntity?> _future;

  @override
  void initState() {
    super.initState();
    _future = getIt<AuthRepository>().getCurrentUser();
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Profile',
      showBackButton: false,
      body: FutureBuilder<UserEntity?>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final user = snapshot.data;
          if (user == null) {
            return const Center(child: Text('User profile unavailable'));
          }
          return Padding(
            padding: const EdgeInsets.all(AppDimensions.screenPaddingH),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user.fullName,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                Text('Username: ${user.username}'),
                Text('Email: ${user.email}'),
                Text('Phone: ${user.phone ?? '-'}'),
                Text('Role: ${user.role.name}'),
                const SizedBox(height: AppDimensions.xl),
                AppButton(
                  label: 'Logout',
                  variant: AppButtonVariant.outlined,
                  onPressed: () {
                    context.read<AuthBloc>().add(const AuthLogoutRequested());
                    context.goNamed(AppRoutes.loginName);
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
