import { router } from "expo-router";
import {
  ArrowRight,
  Settings,
  Smartphone,
  Timer,
  Unlock,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#09090b",
  card: "#18181b",
  border: "#27272a",
  primary: "#f97316",
  primaryMuted: "rgba(249, 115, 22, 0.2)",
  white: "#ffffff",
  zinc50: "#fafafa",
  zinc400: "#a1a1aa",
  zinc500: "#71717a",
};

const STEPS = [
  {
    icon: Unlock,
    title: "Unlock Your Phone",
    description:
      "The countdown starts automatically every time you unlock your device",
  },
  {
    icon: Timer,
    title: "Countdown Begins",
    description: "Watch as your allocated screen time counts down in real-time",
  },
  {
    icon: Settings,
    title: "Set Your Time",
    description:
      "Customize your desired screen time limit in minutes to match your goals",
  },
];

export default function FocusFlowHowItWorks() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>How It Works</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <View style={styles.heroGlow} />
            <View style={styles.heroCircle}>
              <Smartphone size={48} color={COLORS.primary} />
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
                <step.icon size={24} color={COLORS.primary} />
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
            onPress={() => router.push("/(tabs)")}>
            <Text style={styles.continueBtnText}>Continue</Text>
            <ArrowRight size={20} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.zinc50,
  },
  headerSpacer: {
    width: 44,
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
    alignItems: "center",
    marginBottom: 40,
  },
  heroIconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  heroGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryMuted,
    opacity: 0.5,
  },
  heroCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: COLORS.zinc50,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 16,
    color: COLORS.zinc400,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
  stepsContainer: {
    gap: 32,
    marginBottom: 40,
  },
  stepRow: {
    flexDirection: "row",
    gap: 16,
  },
  stepIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.zinc50,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.zinc400,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  infoCardHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  infoCardNumber: {
    fontSize: 48,
    fontWeight: "700",
    color: COLORS.primary,
  },
  infoCardLabel: {
    fontSize: 14,
    color: COLORS.zinc400,
    marginTop: 4,
  },
  infoCardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  infoCardRows: {
    gap: 12,
  },
  infoCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoCardRowLabel: {
    fontSize: 14,
    color: COLORS.zinc400,
  },
  infoCardRowValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.zinc50,
  },
  continueContainer: {
    marginTop: 8,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    height: 56,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 8,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.background,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(9, 9, 11, 0.9)",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  navItem: {
    alignItems: "center",
    gap: 6,
  },
  navItemActive: {
    alignItems: "center",
  },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: COLORS.zinc500,
    letterSpacing: 0.5,
  },
  navLabelActive: {
    color: COLORS.primary,
  },
});
