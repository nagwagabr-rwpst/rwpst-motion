import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/config/app_environment.dart';
import '../../core/errors/app_exception.dart';

/// Singleton wrapper around the Supabase Flutter client.
final class SupabaseService {
  SupabaseService._();

  static final SupabaseService _instance = SupabaseService._();

  static SupabaseService get instance => _instance;

  SupabaseClient get client => Supabase.instance.client;

  static Future<void> initialize() async {
    final url = AppEnvironment.supabaseUrl;
    final anonKey = AppEnvironment.supabaseAnonKey;

    if (url.isEmpty) {
      throw const ConfigurationException(
        'SUPABASE_URL is not configured. '
        'Provide it via --dart-define=SUPABASE_URL=...',
      );
    }

    if (anonKey.isEmpty) {
      throw const ConfigurationException(
        'SUPABASE_ANON_KEY is not configured. '
        'Provide it via --dart-define=SUPABASE_ANON_KEY=...',
      );
    }

    await Supabase.initialize(url: url, publishableKey: anonKey);
  }
}
