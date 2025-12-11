import {
  ArrowRight,
  Settings,
  Smartphone,
  Timer,
  Unlock,
} from 'lucide-react-native';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';

const STEPS = [
  {
    icon: Unlock,
    title: 'Unlock Your Phone',
    description:
      'The countdown starts automatically every time you unlock your device',
  },
  {
    icon: Timer,
    title: 'Countdown Begins',
    description: 'Watch as your allocated screen time counts down in real-time',
  },
  {
    icon: Settings,
    title: 'Set Your Time',
    description:
      'Customize your desired screen time limit in minutes to match your goals',
  },
];

export default function OnboardingScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.dark.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>How It Works</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <View style={styles.heroGlow} />
            <View style={styles.heroCircle}>
              <Smartphone size={48} stroke={Colors.dark.primary} />
            </View>
          </View>
          <Text style={styles.heroTitle}>Stay Focused</Text>
          <Text style={styles.heroDescription}>
            Take control of your screen time with a simple countdown timer
          </Text>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {STEPS.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepIconBox}>
                <step.icon size={24} stroke={Colors.dark.primary} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Text style={styles.infoCardNumber}>25</Text>
            <Text style={styles.infoCardLabel}>Minutes Default</Text>
          </View>
          <View style={styles.infoCardDivider} />
          <View style={styles.infoCardRows}>
            <View style={styles.infoCardRow}>
              <Text style={styles.infoCardRowLabel}>Recommended</Text>
              <Text style={styles.infoCardRowValue}>20-30 min</Text>
            </View>
            <View style={styles.infoCardRow}>
              <Text style={styles.infoCardRowLabel}>Adjustable</Text>
              <Text style={styles.infoCardRowValue}>5-120 min</Text>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.continueContainer}>
          <TouchableOpacity
            style={styles.continueBtn}
            activeOpacity={0.9}
            onPress={() => navigation.replace('Tabs')}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
            <ArrowRight size={20} stroke={Colors.dark.background} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.zinc50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 120,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.dark.primaryMuted,
    opacity: 0.5,
  },
  heroCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.dark.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.dark.zinc50,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 16,
    color: Colors.dark.zinc400,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  stepsContainer: {
    gap: 32,
    marginBottom: 40,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stepIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.zinc50,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.dark.zinc400,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  infoCardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  infoCardNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.dark.primary,
  },
  infoCardLabel: {
    fontSize: 14,
    color: Colors.dark.zinc400,
    marginTop: 4,
  },
  infoCardDivider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginBottom: 16,
  },
  infoCardRows: {
    gap: 12,
  },
  infoCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCardRowLabel: {
    fontSize: 14,
    color: Colors.dark.zinc400,
  },
  infoCardRowValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.zinc50,
  },
  continueContainer: {
    marginTop: 8,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 56,
    backgroundColor: Colors.dark.white,
    borderRadius: 24,
    shadowColor: Colors.dark.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 8,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.background,
  },
});
