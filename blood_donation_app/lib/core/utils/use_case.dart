import 'package:equatable/equatable.dart';

/// Base class for all use cases that return [Type] for given [Params].
abstract class UseCase<Type, Params> {
  Future<Type> call(Params params);
}

/// Use this when a use case takes no parameters.
class NoParams extends Equatable {
  const NoParams();

  @override
  List<Object?> get props => [];
}
