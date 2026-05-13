import 'package:get_it/get_it.dart';
import 'package:blood_donation_app/core/network/api_client.dart';
import 'package:blood_donation_app/modules/donor/data/datasources/donor_remote_datasource.dart';
import 'package:blood_donation_app/modules/donor/data/repositories/donor_repository_impl.dart';
import 'package:blood_donation_app/modules/donor/domain/repositories/donor_repository.dart';
import 'package:blood_donation_app/modules/donor/domain/usecases/get_nearby_donors_usecase.dart';

class DonorDi {
  DonorDi._();

  static void register(GetIt getIt) {
    getIt.registerLazySingleton<DonorRemoteDataSource>(
      () => DonorRemoteDataSourceImpl(getIt<ApiClient>()),
    );
    getIt.registerLazySingleton<DonorRepository>(
      () => DonorRepositoryImpl(getIt<DonorRemoteDataSource>()),
    );
    getIt.registerLazySingleton(
      () => GetNearbyDonorsUseCase(getIt<DonorRepository>()),
    );
  }
}
