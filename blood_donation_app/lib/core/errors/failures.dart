import 'package:equatable/equatable.dart';

abstract class Failure extends Equatable {

  const Failure({required this.message, this.statusCode});
  final String message;
  final int? statusCode;

  @override
  List<Object?> get props => [message, statusCode];
}

// Network failures
class NetworkFailure extends Failure {
  const NetworkFailure({super.message = 'No internet connection'});
}

class TimeoutFailure extends Failure {
  const TimeoutFailure({super.message = 'Request timed out'});
}

class ServerFailure extends Failure {
  const ServerFailure({required super.message, super.statusCode});
}

class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure({
    super.message = 'Unauthorized. Please login again.',
  });
}

class ForbiddenFailure extends Failure {
  const ForbiddenFailure({
    super.message = 'You do not have permission to perform this action.',
  });
}

class NotFoundFailure extends Failure {
  const NotFoundFailure({super.message = 'Resource not found.'});
}

class ValidationFailure extends Failure {

  const ValidationFailure({
    super.message = 'Validation failed',
    this.fieldErrors,
  });
  final Map<String, List<String>>? fieldErrors;

  @override
  List<Object?> get props => [message, fieldErrors];
}

// Local storage failures
class CacheFailure extends Failure {
  const CacheFailure({super.message = 'Cache error occurred'});
}

// Auth failures
class SessionExpiredFailure extends Failure {
  const SessionExpiredFailure({
    super.message = 'Session expired. Please login again.',
  });
}

// Unknown
class UnknownFailure extends Failure {
  const UnknownFailure({super.message = 'An unexpected error occurred'});
}
