import {
  ArrowRight,
  BarChart2,
  Flame,
  Timer,
  Trophy,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { getAppState, initDatabase } from '../services/app.service';

const FEATURES = [
  { icon: Flame, title: '25m', subtitle: 'Focus Time' },
  { icon: BarChart2, title: 'Track', subtitle: 'Progress' },
  { icon: Trophy, title: 'Achieve', subtitle: 'Goals' },
];

export default function WelcomeScreen({ navigation }: any) {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initDatabase();
      const appState = await getAppState();
      if (appState.inUse) {
        navigation.replace('Tabs');
      }
      setDbReady(true);
    };
    init();
  }, [navigation]);

  if (!dbReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.dark.background}
      />

      <View style={styles.main}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoGlow} />
          <View style={styles.logoCircle}>
            <Timer size={64} stroke={Colors.dark.primary} />
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Focus Flow</Text>
          <Text style={styles.subtitle}>
            Master your time with focused work sessions. Track your productivity
            and build better habits.
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          <View style={styles.featuresGrid}>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <feature.icon size={24} stroke={Colors.dark.primary} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
              </View>
            ))}
          </View>

          {/* How it works ? Button */}
          <TouchableOpacity
            style={styles.startBtn}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Onboarding')}
          >
            <ArrowRight size={24} stroke={Colors.dark.background} />
            <Text style={styles.startBtnText}>How it works ?</Text>
          </TouchableOpacity>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            No signup required • Start focusing now
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingTop: StatusBar.currentHeight || 0,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  logoSection: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.dark.primaryMuted,
    opacity: 0.5,
  },
  logoCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: Colors.dark.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 48,
    maxWidth: 320,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.dark.zinc50,
    letterSpacing: -1,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.dark.zinc400,
    textAlign: 'center',
    lineHeight: 28,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 360,
  },
  featuresGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    width: 120,
    height: 120,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  featureIconContainer: {
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.zinc50,
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 12,
    color: Colors.dark.zinc400,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 64,
    backgroundColor: Colors.dark.white,
    borderRadius: 24,
    shadowColor: Colors.dark.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 8,
  },
  startBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.background,
    letterSpacing: -0.5,
  },
  footerText: {
    fontSize: 12,
    color: Colors.dark.zinc400,
    textAlign: 'center',
    marginTop: 16,
  },
  loading: {
    flex: 1,
    backgroundColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
