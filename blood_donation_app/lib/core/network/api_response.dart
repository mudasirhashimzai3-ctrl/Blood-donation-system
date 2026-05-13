class ApiResponse<T> {

  const ApiResponse({
    required this.success,
    this.message,
    this.data,
    this.meta,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) {
    return ApiResponse<T>(
      success: json['success'] as bool? ?? true,
      message: json['message'] as String?,
      data: json['data'] != null && fromJsonT != null
          ? fromJsonT(json['data'])
          : null,
      meta: json['meta'] as Map<String, dynamic>?,
    );
  }
  final bool success;
  final String? message;
  final T? data;
  final Map<String, dynamic>? meta;
}

class PaginatedResponse<T> {

  const PaginatedResponse({
    required this.items,
    required this.currentPage,
    required this.totalPages,
    required this.totalItems,
    required this.perPage,
    required this.hasNextPage,
  });

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJsonT,
  ) {
    final data = json['data'] as Map<String, dynamic>?;
    final meta =
        data?['meta'] as Map<String, dynamic>? ??
        json['meta'] as Map<String, dynamic>?;
    final rawItems = (data?['items'] ?? json['data']) as List? ?? [];

    return PaginatedResponse<T>(
      items: rawItems.map((e) => fromJsonT(e as Map<String, dynamic>)).toList(),
      currentPage: meta?['current_page'] as int? ?? 1,
      totalPages: meta?['last_page'] as int? ?? 1,
      totalItems: meta?['total'] as int? ?? 0,
      perPage: meta?['per_page'] as int? ?? 20,
      hasNextPage:
          (meta?['current_page'] as int? ?? 1) <
          (meta?['last_page'] as int? ?? 1),
    );
  }
  final List<T> items;
  final int currentPage;
  final int totalPages;
  final int totalItems;
  final int perPage;
  final bool hasNextPage;
}
