import 'package:blood_donation_app/core/errors/exceptions.dart';

String toUserMessage(Object error) {
  if (error is ValidationException) {
    final fieldErrors = error.fieldErrors;
    if (fieldErrors != null && fieldErrors.isNotEmpty) {
      final firstEntry = fieldErrors.entries.first;
      final firstMessage = firstEntry.value.isNotEmpty
          ? firstEntry.value.first
          : 'Invalid ${firstEntry.key}.';
      return firstMessage;
    }
    return error.message;
  }

  if (error is TimeoutException) {
    return 'Request timed out. Check your network and API host.';
  }
  if (error is NetworkException) {
    return 'Cannot connect to server. Check API_BASE_URL, network, and CORS (web).';
  }
  if (error is UnauthorizedException) {
    return 'Invalid credentials. Please try again.';
  }
  if (error is ForbiddenException) {
    return 'Access denied for this account.';
  }
  if (error is NotFoundException) {
    return 'Requested resource was not found.';
  }
  if (error is ServerException) {
    return error.message.isNotEmpty
        ? error.message
        : 'Server error. Please try again.';
  }
  if (error is AppException) {
    return error.message.isNotEmpty
        ? error.message
        : 'Unable to complete the request. Please try again.';
  }
  final message = error.toString().trim();
  return message.isNotEmpty
      ? message
      : 'Unable to complete the request. Please try again.';
}
