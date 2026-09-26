import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/errors/app_exception.dart';
import '../../../data/repositories/auth/auth_repository.dart';
import 'auth_repository_provider.dart';
import '../domain/auth_state.dart';
import '../domain/auth_status.dart';

/// Coordinates authentication state for the application.
class AuthController extends Notifier<AuthState> {
  StreamSubscription<AuthChangeSnapshot>? _authSubscription;

  AuthRepository get _repository => ref.read(authRepositoryProvider);

  @override
  AuthState build() {
    ref.onDispose(() {
      unawaited(_authSubscription?.cancel());
    });

    return const AuthState();
  }

  Future<void> initialize() async {
    state = state.copyWith(
      status: AuthStatus.loading,
      clearErrorMessage: true,
    );

    final session = _repository.currentSession;
    if (session != null) {
      state = _authenticatedState(
        userId: session.user.id,
        email: session.user.email,
      );
    } else {
      state = const AuthState(status: AuthStatus.unauthenticated);
    }

    listenAuthChanges();
  }

  void listenAuthChanges() {
    unawaited(_authSubscription?.cancel());
    _authSubscription = _repository.authStateChanges().listen(
      (snapshot) {
        if (snapshot.userId != null) {
          state = _authenticatedState(
            userId: snapshot.userId!,
            email: snapshot.email,
          );
          return;
        }

        state = const AuthState(status: AuthStatus.unauthenticated);
      },
      onError: (Object error) {
        state = _errorState(error);
      },
    );
  }

  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(
      status: AuthStatus.loading,
      clearErrorMessage: true,
    );

    try {
      await _repository.signInWithPassword(email: email, password: password);

      final user = _repository.currentUser;
      if (user == null) {
        throw const AuthenticationException('Sign in failed.');
      }

      state = _authenticatedState(userId: user.id, email: user.email);
    } on AuthenticationException catch (error) {
      state = AuthState(
        status: AuthStatus.error,
        errorMessage: error.message,
      );
    } catch (_) {
      state = const AuthState(
        status: AuthStatus.error,
        errorMessage: 'Sign in failed.',
      );
    }
  }

  Future<void> signOut() async {
    state = state.copyWith(
      status: AuthStatus.loading,
      clearErrorMessage: true,
    );

    try {
      await _repository.signOut();
      state = const AuthState(status: AuthStatus.unauthenticated);
    } on AuthenticationException catch (error) {
      state = AuthState(
        status: AuthStatus.error,
        errorMessage: error.message,
      );
    } catch (_) {
      state = const AuthState(
        status: AuthStatus.error,
        errorMessage: 'Sign out failed.',
      );
    }
  }

  Future<void> refresh() async {
    state = state.copyWith(
      status: AuthStatus.loading,
      clearErrorMessage: true,
    );

    try {
      final session = await _repository.refreshSession();
      if (session != null) {
        state = _authenticatedState(
          userId: session.user.id,
          email: session.user.email,
        );
        return;
      }

      state = const AuthState(status: AuthStatus.unauthenticated);
    } on AuthenticationException catch (error) {
      state = AuthState(
        status: AuthStatus.error,
        errorMessage: error.message,
      );
    } catch (_) {
      state = const AuthState(
        status: AuthStatus.error,
        errorMessage: 'Session refresh failed.',
      );
    }
  }

  AuthState _authenticatedState({
    required String userId,
    String? email,
  }) {
    return AuthState(
      status: AuthStatus.authenticated,
      userId: userId,
      email: email,
    );
  }

  AuthState _errorState(Object error) {
    if (error is AuthenticationException) {
      return AuthState(
        status: AuthStatus.error,
        errorMessage: error.message,
      );
    }

    return const AuthState(
      status: AuthStatus.error,
      errorMessage: 'Authentication error.',
    );
  }
}
