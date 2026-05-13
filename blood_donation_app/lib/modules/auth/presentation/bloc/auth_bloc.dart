import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:blood_donation_app/modules/auth/domain/entities/user_entity.dart';
import 'package:blood_donation_app/modules/auth/domain/usecases/login_usecase.dart';
import 'package:blood_donation_app/modules/auth/domain/usecases/logout_usecase.dart';
import 'package:blood_donation_app/modules/auth/domain/usecases/register_usecase.dart';
import 'package:blood_donation_app/core/utils/use_case.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {

  AuthBloc({
    required LoginUseCase loginUseCase,
    required RegisterUseCase registerUseCase,
    required LogoutUseCase logoutUseCase,
  }) : _loginUseCase = loginUseCase,
       _registerUseCase = registerUseCase,
       _logoutUseCase = logoutUseCase,
       super(const AuthInitial()) {
    on<AuthLoginRequested>(_onLogin);
    on<AuthRegisterRequested>(_onRegister);
    on<AuthLogoutRequested>(_onLogout);
  }
  final LoginUseCase _loginUseCase;
  final RegisterUseCase _registerUseCase;
  final LogoutUseCase _logoutUseCase;

  Future<void> _onLogin(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    try {
      final user = await _loginUseCase(
        LoginParams(
          username: event.username,
          password: event.password,
          role: event.role,
        ),
      );
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onRegister(
    AuthRegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    try {
      final user = await _registerUseCase(
        RegisterParams(
          firstName: event.firstName,
          lastName: event.lastName,
          username: event.username,
          email: event.email,
          password: event.password,
          confirmPassword: event.confirmPassword,
          phone: event.phone,
          role: event.role,
          donorBloodGroup: event.donorBloodGroup,
          recipientRequiredBloodGroup: event.recipientRequiredBloodGroup,
        ),
      );
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onLogout(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    try {
      await _logoutUseCase(const NoParams());
      emit(const AuthUnauthenticated());
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }
}
