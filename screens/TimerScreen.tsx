import Slider from '@react-native-community/slider';
import { Flame, Pause, Play, Square } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import Colors from '../constants/Colors';
import { useTimerContext } from '../contexts/TimerContext';
import { useTimer } from '../hooks/app.hook';
import { formatDuration, setAppState } from '../services/app.service';

const PRESETS = [15, 25, 45, 60];

interface TimerScreenProps {
  todayMinutes?: number;
}

export default function FocusFlowTimer({ todayMinutes = 0 }: TimerScreenProps) {
  const [minutes, setMinutes] = useState(25);
  const [selectedPreset, setSelectedPreset] = useState(25);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<any>(null);
  const { remainingSeconds } = useTimerContext();
  const { isRunning, startSession, cancelCurrentSession } = useTimer();

  // Sync local minutes with global durationMinutes when not running
  const { durationMinutes } = useTimerContext();
  useEffect(() => {
    if (!isRunning && durationMinutes > 0) {
      setMinutes(durationMinutes);
      setSelectedPreset(
        PRESETS.includes(durationMinutes) ? durationMinutes : 0,
      );
    }
  }, [isRunning, durationMinutes]);

  const handleStartSession = async () => {
    await startSession(minutes);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    await cancelCurrentSession();
    setIsPaused(false);
  };

  const handlePresetPress = (preset: number) => {
    if (isRunning) return;
    setSelectedPreset(preset);
    setMinutes(preset);
  };

  const handleSliderChange = (value: number) => {
    if (isRunning) return;
    const rounded = Math.round(value);
    setMinutes(rounded);
    setSelectedPreset(PRESETS.includes(rounded) ? rounded : 0);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Calculate progress for the ring - use global remainingSeconds
  const totalSeconds = minutes * 60;
  const secondsRemaining = isRunning ? remainingSeconds : totalSeconds;
  // Ensure progress is always between 0 and 1, even during state transitions
  const rawProgress = isRunning ? remainingSeconds / totalSeconds : 1;
  const progress = Math.max(0, Math.min(1, rawProgress));
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  useEffect(() => {
    setAppState();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.dark.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Focus Flow</Text>
      </View>

      {/* Main Content - Scrollable */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
          {/* Today's Stats Badge */}
          <View style={styles.statsBadge}>
            <Flame size={16} stroke={Colors.dark.primary} />
            <Text style={styles.statsBadgeText}>
              <Text style={styles.statsBadgeHighlight}>
                {formatDuration(todayMinutes)}{' '}
              </Text>
              today
            </Text>
          </View>

          {/* Circular Timer */}
          <View style={styles.timerContainer}>
            <View style={styles.timerGlow} />
            <Svg width={280} height={280} style={styles.timerSvg}>
              {/* Background Circle */}
              <Circle
                cx={140}
                cy={140}
                r={120}
                stroke={Colors.dark.border}
                strokeWidth={6}
                fill="none"
              />
              {/* Progress Circle */}
              <Circle
                cx={140}
                cy={140}
                r={120}
                stroke={Colors.dark.primary}
                strokeWidth={6}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation={-90}
                origin="140, 140"
              />
              {/* Indicator Dot */}
              <Circle
                cx={
                  140 + 120 * Math.cos(((progress * 360 - 90) * Math.PI) / 180)
                }
                cy={
                  140 + 120 * Math.sin(((progress * 360 - 90) * Math.PI) / 180)
                }
                r={8}
                fill={Colors.dark.background}
                stroke={Colors.dark.primary}
                strokeWidth={3}
              />
            </Svg>
            <View style={styles.timerTextContainer}>
              <Text style={styles.timerText}>
                {formatTime(secondsRemaining)}
              </Text>
              <Text style={styles.timerLabel}>
                {isRunning ? (isPaused ? 'PAUSED' : 'FOCUS') : 'MINUTES'}
              </Text>
            </View>
          </View>

          {/* Slider - disabled when running */}
          <View style={[styles.sliderContainer, isRunning && styles.disabled]}>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>5m</Text>
              <Text style={styles.sliderLabel}>60m</Text>
            </View>
            <View style={styles.sliderWrapper}>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={60}
                value={minutes}
                onValueChange={handleSliderChange}
                minimumTrackTintColor={Colors.dark.primary}
                maximumTrackTintColor={Colors.dark.border}
                thumbTintColor={Colors.dark.white}
                disabled={isRunning}
              />
            </View>
          </View>

          {/* Preset Buttons - disabled when running */}
          <View style={[styles.presetContainer, isRunning && styles.disabled]}>
            {PRESETS.map(preset => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetBtn,
                  selectedPreset === preset && styles.presetBtnActive,
                ]}
                onPress={() => handlePresetPress(preset)}
                disabled={isRunning}
              >
                <Text
                  style={[
                    styles.presetBtnText,
                    selectedPreset === preset && styles.presetBtnTextActive,
                  ]}
                >
                  {preset}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Control Buttons */}
          {!isRunning ? (
            <TouchableOpacity
              style={styles.startBtn}
              activeOpacity={0.9}
              onPress={handleStartSession}
            >
              <Play
                size={24}
                color={Colors.dark.background}
                fill={Colors.dark.background}
              />
              <Text style={styles.startBtnText}>Start Session</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={styles.stopBtn}
                activeOpacity={0.9}
                onPress={handleStop}
              >
                <Square
                  size={20}
                  color={Colors.dark.white}
                  fill={Colors.dark.white}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pauseBtn}
                activeOpacity={0.9}
                onPress={handlePauseResume}
              >
                {isPaused ? (
                  <>
                    <Play
                      size={24}
                      color={Colors.dark.background}
                      fill={Colors.dark.background}
                    />
                    <Text style={styles.pauseBtnText}>Resume</Text>
                  </>
                ) : (
                  <>
                    <Pause
                      size={24}
                      color={Colors.dark.background}
                      fill={Colors.dark.background}
                    />
                    <Text style={styles.pauseBtnText}>Pause</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.zinc50,
    letterSpacing: -0.5,
  },
  settingsBtn: {
    padding: 8,
    borderRadius: 20,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  statsBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.dark.zinc400,
  },
  statsBadgeHighlight: {
    color: Colors.dark.white,
  },
  timerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  timerGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.dark.primaryMuted,
    opacity: 0.3,
  },
  timerSvg: {
    transform: [{ rotate: '0deg' }],
  },
  timerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 64,
    fontWeight: '700',
    color: Colors.dark.white,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.dark.zinc500,
    letterSpacing: 3,
    marginTop: 4,
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.dark.zinc500,
  },
  sliderWrapper: {
    height: 48,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  presetContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  presetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  presetBtnActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderColor: 'rgba(249, 115, 22, 0.5)',
  },
  presetBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.zinc400,
  },
  presetBtnTextActive: {
    color: Colors.dark.primary,
  },
  disabled: {
    opacity: 0.5,
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
    marginTop: 32,
    shadowColor: Colors.dark.white,
    shadowOffset: { width: 0, height: 0 },
    marginBottom: 100,
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
  controlsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
    marginBottom: 100,
    width: '100%',
  },
  stopBtn: {
    width: 64,
    height: 64,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 64,
    backgroundColor: Colors.dark.white,
    borderRadius: 24,
    shadowColor: Colors.dark.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 8,
  },
  pauseBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.background,
    letterSpacing: -0.5,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 9, 11, 0.9)',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  navItem: {
    alignItems: 'center',
    gap: 6,
  },
  navItemActive: {
    alignItems: 'center',
  },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.primary,
    marginTop: 4,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.dark.zinc500,
    letterSpacing: 0.5,
  },
  navLabelActive: {
    color: Colors.dark.primary,
  },
});
