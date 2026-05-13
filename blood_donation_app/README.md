# 🩸 Blood Donation App

A Flutter mobile app for a blood donation management system, built with a clean,
module-based architecture.

---

## Architecture

```
lib/
├── main.dart               # Entry point
├── bootstrap.dart          # App widget + providers
├── core/                   # Shared infrastructure (fully implemented)
│   ├── config/             # App environment config
│   ├── constants/          # App-wide strings, constants
│   ├── di/                 # Dependency injection (GetIt)
│   ├── errors/             # Failures + exceptions
│   ├── network/            # Dio HTTP client + interceptors + response models
│   ├── router/             # GoRouter navigation
│   ├── storage/            # Secure + local storage
│   ├── theme/              # Colors, text styles, dimensions, ThemeData
│   ├── utils/              # Date utils, validators, extensions, UseCase base
│   └── widgets/            # Reusable UI components
│       ├── buttons/
│       ├── cards/
│       ├── dialogs/
│       ├── fields/
│       ├── layouts/
│       └── loaders/
└── modules/                # Feature modules
    ├── auth/               # ✅ Fully implemented
    ├── donor/              # 🔲 Domain layer done, data/presentation TBD
    ├── donation/           # 🔲 Domain layer done
    ├── blood_bank/         # 🔲 Domain layer done
    ├── home/               # 🔲 Stub
    └── notifications/      # 🔲 Stub
```

Each module follows **Clean Architecture**:
```
module/
├── data/
│   ├── datasources/    # Remote (API) + local (cache) data sources
│   ├── models/         # JSON-serializable data models (extend entities)
│   └── repositories/   # Repository implementations
├── domain/
│   ├── entities/       # Pure business objects (no framework deps)
│   ├── repositories/   # Abstract repository contracts
│   └── usecases/       # Single-responsibility business logic
├── presentation/
│   ├── bloc/           # BLoC: event / state / bloc
│   ├── screens/        # Full-page widgets
│   └── widgets/        # Module-scoped UI components
└── di.dart             # Module dependency registration
```

---

## Tech Stack

| Concern            | Package                    |
|--------------------|----------------------------|
| State management   | `flutter_bloc`             |
| Navigation         | `go_router`                |
| HTTP client        | `dio` + `pretty_dio_logger`|
| DI                 | `get_it`                   |
| Secure storage     | `flutter_secure_storage`   |
| Local storage      | `shared_preferences`       |
| UI extras          | `shimmer`, `cached_network_image`, `lottie` |
| Forms              | `reactive_forms`           |
| Connectivity       | `connectivity_plus`        |

---

## Getting Started

```bash
# 1. Install dependencies
flutter pub get

# 2. Run code generation (if you use @injectable or json_serializable)
dart run build_runner build --delete-conflicting-outputs

# 3. Run the app
flutter run
```

## Adding a New Module

1. Create the folder structure inside `lib/modules/<module>/`
2. Implement domain layer (entities → repositories → usecases)
3. Implement data layer (models → datasources → repository impl)
4. Implement presentation layer (bloc → screens → widgets)
5. Create `lib/modules/<module>/di.dart` and register all deps
6. Call `<Module>Di.register(getIt)` in `lib/core/di/injection.dart`
7. Add routes to `lib/core/router/app_router.dart`

## Environment

Change environment in `lib/core/config/app_config.dart`:
```dart
static const AppEnvironment environment = AppEnvironment.development;
```
