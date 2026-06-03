import 'package:blood_donation_app/core/network/api_client.dart';
import 'package:blood_donation_app/modules/donation/data/datasources/donation_remote_datasource.dart';
import 'package:blood_donation_app/modules/donation/data/repositories/donation_repository_impl.dart';
import 'package:blood_donation_app/modules/donation/domain/repositories/donation_repository.dart';
import 'package:get_it/get_it.dart';

class DonationDi {
  DonationDi._();

  static void register(GetIt getIt) {
    getIt.registerLazySingleton<DonationRemoteDataSource>(
      () => DonationRemoteDataSourceImpl(getIt<ApiClient>()),
    );
    getIt.registerLazySingleton<DonationRepository>(
      () => DonationRepositoryImpl(getIt<DonationRemoteDataSource>()),
    );
  }
}
