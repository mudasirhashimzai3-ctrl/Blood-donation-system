import 'package:equatable/equatable.dart';

/// Base class for all use cases that return [Result] for given [Params].
abstract class UseCase<Result, Params> {
  Future<Result> call(Params params);
}

/// Use this when a use case takes no parameters.
class NoParams extends Equatable {
  const NoParams();

  @override
  List<Object?> get props => [];
}
