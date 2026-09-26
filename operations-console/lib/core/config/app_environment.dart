/// Compile-time environment configuration read from `--dart-define` values.
abstract final class AppEnvironment {
  static const String supabaseUrl = String.fromEnvironment('SUPABASE_URL');

  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
  );

  static const String appEnv = String.fromEnvironment(
    'APP_ENV',
    defaultValue: 'development',
  );
}
