/// Base exception type for application-level errors.
sealed class AppException implements Exception {
  const AppException(this.message);

  final String message;

  @override
  String toString() => '$runtimeType: $message';
}

/// Thrown when required configuration is missing or invalid.
final class ConfigurationException extends AppException {
  const ConfigurationException(super.message);
}

/// Thrown when a network or connectivity error occurs.
final class NetworkException extends AppException {
  const NetworkException(super.message);
}

/// Thrown when authentication fails or the session is invalid.
final class AuthenticationException extends AppException {
  const AuthenticationException(super.message);
}

/// Thrown for unexpected errors that do not fit other categories.
final class UnknownException extends AppException {
  const UnknownException(super.message);
}
