import 'auth_status.dart';

/// Immutable snapshot of the current authentication state.
class AuthState {
  const AuthState({
    this.status = AuthStatus.unknown,
    this.userId,
    this.email,
    this.errorMessage,
  });

  final AuthStatus status;
  final String? userId;
  final String? email;
  final String? errorMessage;

  AuthState copyWith({
    AuthStatus? status,
    String? userId,
    String? email,
    String? errorMessage,
    bool clearUserId = false,
    bool clearEmail = false,
    bool clearErrorMessage = false,
  }) {
    return AuthState(
      status: status ?? this.status,
      userId: clearUserId ? null : (userId ?? this.userId),
      email: clearEmail ? null : (email ?? this.email),
      errorMessage:
          clearErrorMessage ? null : (errorMessage ?? this.errorMessage),
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        other is AuthState &&
            runtimeType == other.runtimeType &&
            status == other.status &&
            userId == other.userId &&
            email == other.email &&
            errorMessage == other.errorMessage;
  }

  @override
  int get hashCode => Object.hash(status, userId, email, errorMessage);
}
