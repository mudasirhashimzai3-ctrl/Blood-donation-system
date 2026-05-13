import 'package:blood_donation_app/core/utils/use_case.dart';
import 'package:blood_donation_app/modules/auth/domain/repositories/auth_repository.dart';

class LogoutUseCase extends UseCase<void, NoParams> {
  LogoutUseCase(this._repository);
  final AuthRepository _repository;

  @override
  Future<void> call(NoParams params) => _repository.logout();
}
