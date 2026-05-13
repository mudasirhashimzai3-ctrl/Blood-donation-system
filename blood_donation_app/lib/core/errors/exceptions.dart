class AppException implements Exception {

  const AppException({required this.message, this.statusCode});
  final String message;
  final int? statusCode;

  @override
  String toString() => 'AppException: $message (status: $statusCode)';
}

class NetworkException extends AppException {
  const NetworkException({super.message = 'No internet connection'});
}

class TimeoutException extends AppException {
  const TimeoutException({super.message = 'Request timed out'});
}

class ServerException extends AppException {
  const ServerException({required super.message, super.statusCode});
}

class UnauthorizedException extends AppException {
  const UnauthorizedException({super.message = 'Unauthorized'});
}

class ForbiddenException extends AppException {
  const ForbiddenException({super.message = 'Forbidden'});
}

class NotFoundException extends AppException {
  const NotFoundException({super.message = 'Not found'});
}

class ValidationException extends AppException {

  const ValidationException({
    super.message = 'Validation failed',
    this.fieldErrors,
    super.statusCode = 422,
  });
  final Map<String, List<String>>? fieldErrors;
}

class CacheException extends AppException {
  const CacheException({super.message = 'Cache error'});
}
