import { View, Text, StyleSheet } from 'react-native';

interface LogoHeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * LogoHeader Component
 *
 * Displays the app logo/branding with title and optional subtitle.
 * Used at the top of authentication screens.
 */
export function LogoHeader({ title, subtitle }: LogoHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Logo Icon */}
      <View style={styles.logoContainer}>
        <View style={styles.logoOuter}>
          <View style={styles.logoInner}>
            <Text style={styles.logoIcon}>🔬</Text>
          </View>
        </View>
      </View>

      {/* App Name */}
      <Text style={styles.appName}>SurgicalPrep</Text>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Subtitle */}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoOuter: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  logoInner: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 28,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
