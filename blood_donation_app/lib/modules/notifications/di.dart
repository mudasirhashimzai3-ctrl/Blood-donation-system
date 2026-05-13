import 'package:get_it/get_it.dart';

/// Registers all notifications module dependencies into [getIt].
/// Call this from lib/core/di/injection.dart.
class NotificationsDi {
  NotificationsDi._();

  static void register(GetIt getIt) {
    // TODO: register repositories, use-cases, blocs for the notifications module
    //
    // Example:
    // getIt.registerLazySingleton<NotificationsDiRemoteDataSource>(
    //   () => NotificationsDiRemoteDataSourceImpl(getIt<ApiClient>()),
    // );
    // getIt.registerLazySingleton<NotificationsDiRepository>(
    //   () => NotificationsDiRepositoryImpl(getIt()),
    // );
    // getIt.registerFactory(() => NotificationsDiBloc(getIt()));
  }
}
