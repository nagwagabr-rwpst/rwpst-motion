import 'package:flutter/material.dart';

/// Material 3 themes with explicit color schemes for the operations console.
abstract final class AppTheme {
  static const ColorScheme _lightColorScheme = ColorScheme(
    brightness: Brightness.light,
    primary: Color(0xFF1B4F72),
    onPrimary: Color(0xFFFFFFFF),
    primaryContainer: Color(0xFFD4E6F1),
    onPrimaryContainer: Color(0xFF0B2E44),
    secondary: Color(0xFF2E86AB),
    onSecondary: Color(0xFFFFFFFF),
    secondaryContainer: Color(0xFFB8DCE8),
    onSecondaryContainer: Color(0xFF0A3D52),
    tertiary: Color(0xFF5D6D7E),
    onTertiary: Color(0xFFFFFFFF),
    tertiaryContainer: Color(0xFFD5D8DC),
    onTertiaryContainer: Color(0xFF2C3E50),
    error: Color(0xFFC0392B),
    onError: Color(0xFFFFFFFF),
    errorContainer: Color(0xFFFADBD8),
    onErrorContainer: Color(0xFF641E16),
    surface: Color(0xFFF8F9FA),
    onSurface: Color(0xFF1C2833),
    onSurfaceVariant: Color(0xFF566573),
    outline: Color(0xFFABB2B9),
    outlineVariant: Color(0xFFD5D8DC),
    shadow: Color(0xFF000000),
    scrim: Color(0xFF000000),
    inverseSurface: Color(0xFF2C3E50),
    onInverseSurface: Color(0xFFECF0F1),
    inversePrimary: Color(0xFF85C1E9),
    surfaceTint: Color(0xFF1B4F72),
  );

  static const ColorScheme _darkColorScheme = ColorScheme(
    brightness: Brightness.dark,
    primary: Color(0xFF85C1E9),
    onPrimary: Color(0xFF0B2E44),
    primaryContainer: Color(0xFF1B4F72),
    onPrimaryContainer: Color(0xFFD4E6F1),
    secondary: Color(0xFF5DADE2),
    onSecondary: Color(0xFF0A3D52),
    secondaryContainer: Color(0xFF1A5276),
    onSecondaryContainer: Color(0xFFB8DCE8),
    tertiary: Color(0xFFAEB6BF),
    onTertiary: Color(0xFF2C3E50),
    tertiaryContainer: Color(0xFF4A5568),
    onTertiaryContainer: Color(0xFFD5D8DC),
    error: Color(0xFFE74C3C),
    onError: Color(0xFF641E16),
    errorContainer: Color(0xFF922B21),
    onErrorContainer: Color(0xFFFADBD8),
    surface: Color(0xFF1C2833),
    onSurface: Color(0xFFECF0F1),
    onSurfaceVariant: Color(0xFFABB2B9),
    outline: Color(0xFF566573),
    outlineVariant: Color(0xFF34495E),
    shadow: Color(0xFF000000),
    scrim: Color(0xFF000000),
    inverseSurface: Color(0xFFECF0F1),
    onInverseSurface: Color(0xFF1C2833),
    inversePrimary: Color(0xFF1B4F72),
    surfaceTint: Color(0xFF85C1E9),
  );

  static ThemeData get light => _buildTheme(_lightColorScheme);

  static ThemeData get dark => _buildTheme(_darkColorScheme);

  static ThemeData _buildTheme(ColorScheme colorScheme) {
    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: colorScheme.surface,
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: false,
        backgroundColor: colorScheme.surface,
        foregroundColor: colorScheme.onSurface,
        surfaceTintColor: colorScheme.surfaceTint,
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: colorScheme.surfaceContainerHighest,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: colorScheme.outlineVariant),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colorScheme.surfaceContainerHighest,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: colorScheme.outline),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: colorScheme.outlineVariant),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: colorScheme.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: colorScheme.error),
        ),
        labelStyle: TextStyle(color: colorScheme.onSurfaceVariant),
        hintStyle: TextStyle(color: colorScheme.onSurfaceVariant),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      ),
      dividerTheme: DividerThemeData(
        color: colorScheme.outlineVariant,
        thickness: 1,
        space: 1,
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      dialogTheme: DialogThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        elevation: 0,
        height: 64,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        indicatorColor: colorScheme.secondaryContainer,
      ),
      navigationRailTheme: NavigationRailThemeData(
        elevation: 0,
        labelType: NavigationRailLabelType.all,
        indicatorColor: colorScheme.secondaryContainer,
      ),
      listTileTheme: ListTileThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      tooltipTheme: TooltipThemeData(
        decoration: BoxDecoration(
          color: colorScheme.inverseSurface,
          borderRadius: BorderRadius.circular(4),
        ),
        textStyle: TextStyle(color: colorScheme.onInverseSurface),
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: colorScheme.primary,
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}
