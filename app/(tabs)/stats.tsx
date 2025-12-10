import Colors from "@/constants/Colors";
import { router } from "expo-router";
import {
  ChevronRight,
  Flame,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { useStats } from "../../hooks/app.hook";
import { formatDuration } from "../../services/app.service";

const DAILY_GOAL_MINUTES = 180; // 3 hours

export default function FocusFlowStats() {
  const [selectedPeriod, setSelectedPeriod] = useState("Week");
  const periods = ["Day", "Week", "Month"];

  const {
    isLoading,
    todayStats,
    weeklyData,
    overallStats,
    recentSessions,
    weeklyTotal,
    refresh,
  } = useStats();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const todayProgress = Math.min(
    todayStats.totalMinutes / DAILY_GOAL_MINUTES,
    1
  );
  const progressPercent = Math.round(todayProgress * 100);
  const circumference = 2 * Math.PI * 45;

  const statsGrid = [
    {
      icon: Target,
      label: "Sessions",
      value: String(overallStats.completed_sessions),
      color: Colors["dark"].primary,
    },
    {
      icon: Flame,
      label: "Day Streak",
      value: String(overallStats.current_streak),
      color: Colors["dark"].primary,
    },
    {
      icon: TrendingUp,
      label: "Avg Session",
      value: formatDuration(overallStats.avg_session_minutes),
      color: Colors["dark"].green,
    },
    {
      icon: Zap,
      label: "Best Day",
      value: formatDuration(overallStats.best_day_minutes),
      color: Colors["dark"].purple,
    },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors["dark"].primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors["dark"].background}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistics</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors["dark"].primary}
          />
        }>
        {/* Today's Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryLabel}>Today's Focus</Text>
            <Text style={styles.summaryValue}>{todayStats.formattedTime}</Text>
            <Text style={styles.summarySubtext}>
              <Text style={styles.summaryHighlight}>{progressPercent}%</Text> of
              daily goal
            </Text>
            <View style={styles.goalBadge}>
              <Flame size={14} color={Colors["dark"].primary} />
              <Text style={styles.goalBadgeText}>
                {formatDuration(DAILY_GOAL_MINUTES)} goal
              </Text>
            </View>
          </View>
          <View style={styles.summaryRight}>
            <Svg width={110} height={110}>
              <Circle
                cx={55}
                cy={55}
                r={45}
                stroke={Colors["dark"].border}
                strokeWidth={8}
                fill="none"
              />
              <Circle
                cx={55}
                cy={55}
                r={45}
                stroke={Colors["dark"].primary}
                strokeWidth={8}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - todayProgress)}
                strokeLinecap="round"
                rotation={-90}
                origin="55, 55"
              />
            </Svg>
            <View style={styles.progressCenter}>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
            </View>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodBtn,
                selectedPeriod === period && styles.periodBtnActive,
              ]}
              onPress={() => setSelectedPeriod(period)}>
              <Text
                style={[
                  styles.periodBtnText,
                  selectedPeriod === period && styles.periodBtnTextActive,
                ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Focus Time</Text>
          <View style={styles.chartContainer}>
            {weeklyData.map((item, index) => {
              const maxHeight = 120;
              const maxHours = Math.max(...weeklyData.map((d) => d.hours), 1);
              const barHeight = Math.max(
                (item.hours / maxHours) * maxHeight,
                8
              );
              const isToday = index === weeklyData.length - 1;
              return (
                <View key={item.day} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: isToday
                            ? Colors["dark"].primary
                            : Colors["dark"].border,
                        },
                        isToday && styles.barActive,
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.barLabel, isToday && styles.barLabelActive]}>
                    {item.day}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: Colors["dark"].primary },
                ]}
              />
              <Text style={styles.legendText}>This week</Text>
            </View>
            <Text style={styles.chartTotal}>Total: {weeklyTotal}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statsGrid.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View
                style={[
                  styles.statIconBox,
                  { backgroundColor: `${stat.color}20` },
                ]}>
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Sessions */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => router.push("/sessions")}>
              <Text style={styles.seeAllText}>See all</Text>
              <ChevronRight size={16} color={Colors["dark"].zinc400} />
            </TouchableOpacity>
          </View>
          {recentSessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No sessions yet. Start your first focus session!
              </Text>
            </View>
          ) : (
            recentSessions.map((session, index) => (
              <View key={index} style={styles.sessionRow}>
                <View style={styles.sessionLeft}>
                  <View
                    style={[
                      styles.sessionDot,
                      {
                        backgroundColor: session.completed
                          ? Colors["dark"].green
                          : Colors["dark"].zinc500,
                      },
                    ]}
                  />
                  <View>
                    <Text style={styles.sessionDate}>
                      {session.displayDate}
                    </Text>
                    <Text style={styles.sessionMeta}>
                      {session.sessions} session
                      {session.sessions !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
                <Text style={styles.sessionDuration}>{session.duration}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors["dark"].background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors["dark"].border,
    height: 56,
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
    color: Colors["dark"].zinc50,
  },
  calendarBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors["dark"].card,
    borderWidth: 1,
    borderColor: Colors["dark"].border,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors["dark"].zinc400,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: "700",
    color: Colors["dark"].zinc50,
    letterSpacing: -1,
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: Colors["dark"].zinc400,
    marginBottom: 12,
  },
  summaryHighlight: {
    color: Colors["dark"].primary,
    fontWeight: "600",
  },
  goalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors["dark"].primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  goalBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors["dark"].primary,
  },
  summaryRight: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors["dark"].zinc50,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: Colors["dark"].card,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  periodBtnActive: {
    backgroundColor: Colors["dark"].primary,
  },
  periodBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors["dark"].zinc400,
  },
  periodBtnTextActive: {
    color: Colors["dark"].white,
  },
  chartCard: {
    backgroundColor: Colors["dark"].card,
    borderWidth: 1,
    borderColor: Colors["dark"].border,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors["dark"].zinc50,
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 140,
    marginBottom: 16,
  },
  chartBar: {
    alignItems: "center",
    flex: 1,
  },
  barContainer: {
    height: 120,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
  },
  bar: {
    width: 28,
    borderRadius: 8,
    minHeight: 8,
  },
  barActive: {
    shadowColor: Colors["dark"].primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  barLabel: {
    fontSize: 12,
    color: Colors["dark"].zinc500,
    marginTop: 8,
  },
  barLabelActive: {
    color: Colors["dark"].primary,
    fontWeight: "600",
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors["dark"].border,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors["dark"].zinc400,
  },
  chartTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors["dark"].zinc50,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    backgroundColor: Colors["dark"].card,
    borderWidth: 1,
    borderColor: Colors["dark"].border,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors["dark"].zinc50,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors["dark"].zinc400,
  },
  recentSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors["dark"].zinc50,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors["dark"].zinc400,
  },
  emptyState: {
    backgroundColor: Colors["dark"].card,
    borderWidth: 1,
    borderColor: Colors["dark"].border,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors["dark"].zinc400,
    textAlign: "center",
  },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors["dark"].card,
    borderWidth: 1,
    borderColor: Colors["dark"].border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sessionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sessionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors["dark"].zinc50,
    marginBottom: 2,
  },
  sessionMeta: {
    fontSize: 12,
    color: Colors["dark"].zinc400,
  },
  sessionDuration: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors["dark"].zinc50,
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
    borderTopColor: Colors["dark"].border,
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
    backgroundColor: Colors["dark"].primary,
    marginTop: 4,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: Colors["dark"].zinc500,
    letterSpacing: 0.5,
  },
  navLabelActive: {
    color: Colors["dark"].primary,
  },
});
