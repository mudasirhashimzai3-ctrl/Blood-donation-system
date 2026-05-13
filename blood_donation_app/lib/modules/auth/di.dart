import 'package:get_it/get_it.dart';
import 'package:blood_donation_app/core/network/api_client.dart';
import 'package:blood_donation_app/core/storage/local_storage.dart';
import 'package:blood_donation_app/core/storage/secure_storage.dart';
import 'package:blood_donation_app/modules/auth/data/datasources/auth_local_datasource.dart';
import 'package:blood_donation_app/modules/auth/data/datasources/auth_remote_datasource.dart';
import 'package:blood_donation_app/modules/auth/data/repositories/auth_repository_impl.dart';
import 'package:blood_donation_app/modules/auth/domain/repositories/auth_repository.dart';
import 'package:blood_donation_app/modules/auth/domain/usecases/login_usecase.dart';
import 'package:blood_donation_app/modules/auth/domain/usecases/logout_usecase.dart';
import 'package:blood_donation_app/modules/auth/domain/usecases/register_usecase.dart';
import 'package:blood_donation_app/modules/auth/presentation/bloc/auth_bloc.dart';

class AuthDi {
  AuthDi._();

  static void register(GetIt getIt) {
    // Data sources
    getIt.registerLazySingleton<AuthRemoteDataSource>(
      () => AuthRemoteDataSourceImpl(getIt<ApiClient>()),
    );
    getIt.registerLazySingleton<AuthLocalDataSource>(
      () => AuthLocalDataSourceImpl(
        getIt<SecureStorage>(),
        getIt<LocalStorage>(),
      ),
    );

    // Repository
    getIt.registerLazySingleton<AuthRepository>(
      () => AuthRepositoryImpl(
        getIt<AuthRemoteDataSource>(),
        getIt<AuthLocalDataSource>(),
      ),
    );

    // Use cases
    getIt.registerLazySingleton(() => LoginUseCase(getIt<AuthRepository>()));
    getIt.registerLazySingleton(() => RegisterUseCase(getIt<AuthRepository>()));
    getIt.registerLazySingleton(() => LogoutUseCase(getIt<AuthRepository>()));

    // BLoC (factory so each widget tree gets a fresh instance)
    getIt.registerFactory(
      () => AuthBloc(
        loginUseCase: getIt<LoginUseCase>(),
        registerUseCase: getIt<RegisterUseCase>(),
        logoutUseCase: getIt<LogoutUseCase>(),
      ),
    );
  }
}
