import 'package:get_it/get_it.dart';

/// Registers all home module dependencies into [getIt].
/// Call this from lib/core/di/injection.dart.
class HomeDi {
  HomeDi._();

  static void register(GetIt getIt) {
    // TODO: register repositories, use-cases, blocs for the home module
    //
    // Example:
    // getIt.registerLazySingleton<HomeDiRemoteDataSource>(
    //   () => HomeDiRemoteDataSourceImpl(getIt<ApiClient>()),
    // );
    // getIt.registerLazySingleton<HomeDiRepository>(
    //   () => HomeDiRepositoryImpl(getIt()),
    // );
    // getIt.registerFactory(() => HomeDiBloc(getIt()));
  }
}
