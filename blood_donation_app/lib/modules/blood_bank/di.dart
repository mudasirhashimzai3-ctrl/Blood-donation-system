import 'package:blood_donation_app/core/network/api_client.dart';
import 'package:blood_donation_app/modules/blood_bank/data/datasources/blood_bank_remote_datasource.dart';
import 'package:blood_donation_app/modules/blood_bank/data/repositories/blood_bank_repository_impl.dart';
import 'package:blood_donation_app/modules/blood_bank/domain/repositories/blood_bank_repository.dart';
import 'package:get_it/get_it.dart';

class BloodBankDi {
  BloodBankDi._();

  static void register(GetIt getIt) {
    getIt.registerLazySingleton<BloodBankRemoteDataSource>(
      () => BloodBankRemoteDataSourceImpl(getIt<ApiClient>()),
    );
    getIt.registerLazySingleton<BloodBankRepository>(
      () => BloodBankRepositoryImpl(getIt<BloodBankRemoteDataSource>()),
    );
  }
}
