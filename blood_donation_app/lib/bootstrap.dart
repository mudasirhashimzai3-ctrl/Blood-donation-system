import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/core/router/app_router.dart';
import 'package:blood_donation_app/core/theme/app_theme.dart';
import 'package:blood_donation_app/modules/auth/presentation/bloc/auth_bloc.dart';

class Bootstrap extends StatelessWidget {
  const Bootstrap({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [BlocProvider<AuthBloc>(create: (_) => getIt<AuthBloc>())],
      child: MaterialApp.router(
        title: 'Blood Donation',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        routerConfig: AppRouter.router,
      ),
    );
  }
}
