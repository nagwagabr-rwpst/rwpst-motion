import 'dart:async';

import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/errors/app_exception.dart';

/// Plain-data snapshot emitted when auth state changes.
final class AuthChangeSnapshot {
  const AuthChangeSnapshot({this.userId, this.email});

  final String? userId;
  final String? email;
}

/// Data access layer for Supabase authentication.
final class AuthRepository {
  AuthRepository({GoTrueClient? auth})
      : _auth = auth ?? Supabase.instance.client.auth;

  final GoTrueClient _auth;

  Session? get currentSession => _auth.currentSession;

  User? get currentUser => _auth.currentUser;

  Future<void> signInWithPassword({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (response.user == null) {
        throw const AuthenticationException('Sign in failed.');
      }
    } on AuthException catch (error) {
      throw AuthenticationException(error.message);
    } catch (_) {
      throw const AuthenticationException('Sign in failed.');
    }
  }

  Future<void> signOut() async {
    try {
      await _auth.signOut();
    } on AuthException catch (error) {
      throw AuthenticationException(error.message);
    } catch (_) {
      throw const AuthenticationException('Sign out failed.');
    }
  }

  Future<Session?> refreshSession() async {
    try {
      final response = await _auth.refreshSession();
      return response.session;
    } on AuthException catch (error) {
      throw AuthenticationException(error.message);
    } catch (_) {
      throw const AuthenticationException('Session refresh failed.');
    }
  }

  Stream<AuthChangeSnapshot> authStateChanges() {
    return _auth.onAuthStateChange.map((event) {
      final user = event.session?.user;
      if (user == null) {
        return const AuthChangeSnapshot();
      }

      return AuthChangeSnapshot(userId: user.id, email: user.email);
    });
  }
}
