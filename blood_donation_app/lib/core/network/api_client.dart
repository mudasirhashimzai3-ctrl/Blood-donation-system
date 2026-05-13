import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';
import 'package:blood_donation_app/core/config/app_config.dart';
import 'package:blood_donation_app/core/constants/app_constants.dart';
import 'package:blood_donation_app/core/errors/exceptions.dart';
import 'package:blood_donation_app/core/storage/secure_storage.dart';

class ApiClient {

  ApiClient(this._secureStorage) {
    final options = BaseOptions(
      baseUrl: AppConfig.baseUrl,
      connectTimeout: AppConfig.connectTimeout,
      receiveTimeout: AppConfig.receiveTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    );

    _dio = Dio(options);
    _refreshDio = Dio(options);

    _dio.interceptors.addAll([
      _AuthInterceptor(
        secureStorage: _secureStorage,
        dio: _dio,
        refreshDio: _refreshDio,
      ),
      if (AppConfig.isDebug)
        PrettyDioLogger(
          requestHeader: true,
          requestBody: true,
          responseBody: true,
          responseHeader: false,
          compact: false,
        ),
    ]);
  }
  late final Dio _dio;
  late final Dio _refreshDio;
  final SecureStorage _secureStorage;

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.patch<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioException(e);
    }
  }

  AppException _handleDioException(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const TimeoutException();
      case DioExceptionType.connectionError:
        return const NetworkException();
      case DioExceptionType.badResponse:
        return _handleResponseError(e.response);
      default:
        return AppException(message: e.message ?? 'Unknown error');
    }
  }

  AppException _handleResponseError(Response? response) {
    if (response == null) return const ServerException(message: 'Server error');

    final statusCode = response.statusCode ?? 0;
    final data = response.data;
    final message = _extractErrorMessage(data);
    final fieldErrors = _extractFieldErrors(data);

    switch (statusCode) {
      case 400:
      case 422:
        if (fieldErrors != null && fieldErrors.isNotEmpty) {
          return ValidationException(
            message: message,
            fieldErrors: fieldErrors,
            statusCode: statusCode,
          );
        }
        return ServerException(message: message, statusCode: statusCode);
      case 401:
        return UnauthorizedException(message: message);
      case 403:
        return ForbiddenException(message: message);
      case 404:
        return NotFoundException(message: message);
      case >= 500:
        return ServerException(message: message, statusCode: statusCode);
      default:
        return ServerException(message: message, statusCode: statusCode);
    }
  }

  String _extractErrorMessage(dynamic data) {
    if (data == null) return 'Server error';
    if (data is Map) {
      final detail = data['detail']?.toString();
      if (detail != null && detail.isNotEmpty) return detail;
      final message = data['message']?.toString();
      if (message != null && message.isNotEmpty) return message;
      final error = data['error']?.toString();
      if (error != null && error.isNotEmpty) return error;
    }
    return 'Server error';
  }

  Map<String, List<String>>? _extractFieldErrors(dynamic data) {
    if (data == null || data is! Map) return null;

    final errors = <String, List<String>>{};
    for (final entry in data.entries) {
      final key = entry.key.toString();
      if (key == 'detail' || key == 'message' || key == 'error') continue;

      final value = entry.value;
      if (value is List) {
        errors[key] = value.map((e) => e.toString()).toList();
      } else if (value != null) {
        errors[key] = [value.toString()];
      }
    }

    return errors.isEmpty ? null : errors;
  }
}

class _AuthInterceptor extends Interceptor {

  _AuthInterceptor({
    required this.secureStorage,
    required this.dio,
    required this.refreshDio,
  });
  final SecureStorage secureStorage;
  final Dio dio;
  final Dio refreshDio;
  bool _isRefreshing = false;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await secureStorage.read(AppConstants.accessTokenKey);
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final isUnauthorized = err.response?.statusCode == 401;
    final alreadyRetried = err.requestOptions.extra['retried'] == true;

    if (!isUnauthorized || alreadyRetried || _isRefreshing) {
      handler.next(err);
      return;
    }

    _isRefreshing = true;
    try {
      final refreshed = await _tryRefreshToken();
      if (!refreshed) {
        await _clearTokens();
        handler.next(err);
        return;
      }

      final newAccessToken = await secureStorage.read(
        AppConstants.accessTokenKey,
      );
      if (newAccessToken == null || newAccessToken.isEmpty) {
        await _clearTokens();
        handler.next(err);
        return;
      }

      final requestOptions = err.requestOptions;
      requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
      requestOptions.extra['retried'] = true;

      final response = await dio.fetch(requestOptions);
      handler.resolve(response);
    } catch (_) {
      await _clearTokens();
      handler.next(err);
    } finally {
      _isRefreshing = false;
    }
  }

  Future<bool> _tryRefreshToken() async {
    final refreshToken = await secureStorage.read(AppConstants.refreshTokenKey);
    if (refreshToken == null || refreshToken.isEmpty) return false;

    final response = await refreshDio.post<Map<String, dynamic>>(
      '/accounts/token/mobile-refresh/',
      data: {'refresh': refreshToken},
    );

    if (response.statusCode != 200 || response.data == null) return false;
    final data = response.data!;
    final accessToken = data['access']?.toString();
    final rotatedRefreshToken = data['refresh']?.toString() ?? refreshToken;
    if (accessToken == null || accessToken.isEmpty) return false;

    await secureStorage.write(AppConstants.accessTokenKey, accessToken);
    await secureStorage.write(
      AppConstants.refreshTokenKey,
      rotatedRefreshToken,
    );
    return true;
  }

  Future<void> _clearTokens() async {
    await secureStorage.delete(AppConstants.accessTokenKey);
    await secureStorage.delete(AppConstants.refreshTokenKey);
  }
}
