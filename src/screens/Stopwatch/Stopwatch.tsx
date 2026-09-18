import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { styles } from './Stopwatch.styles';
import CustomIconButton from '../../component/CustomIconButton';
import { IconName, LapItem, TimerStatus } from '../../types';
import { DIAL_CENTER, TICK_RADIUS, TOTAL_TICKS } from '../../constants';

// Pre-calculate 60 tick positions for optimal performance
const TICKS = Array.from({ length: TOTAL_TICKS }, (_, i) => {
  const angle = (i / TOTAL_TICKS) * 2 * Math.PI - Math.PI / 2;
  return {
    id: i,
    x: DIAL_CENTER + TICK_RADIUS * Math.cos(angle) - 1.25,
    y: DIAL_CENTER + TICK_RADIUS * Math.sin(angle) - 1.25,
  };
});

const pad2 = (n: number): string => n.toString().padStart(2, '0');

// Formats milliseconds into { whitePart, redPart, fullText }
const formatDisplayTime = (ms: number) => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);

  if (hours > 0) {
    return {
      whitePart: `${pad2(hours)}:${pad2(minutes)}:`,
      redPart: `${pad2(seconds)}.${pad2(centiseconds)}`,
      fullText: `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}.${pad2(centiseconds)}`,
    };
  }

  return {
    whitePart: `${pad2(minutes)}:`,
    redPart: `${pad2(seconds)}.${pad2(centiseconds)}`,
    fullText: `00:${pad2(minutes)}:${pad2(seconds)}`,
  };
};

// Formats lap duration with + sign: e.g. +00:03.43 or +01:00:03.43
const formatLapTime = (ms: number, isSplit = false): string => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);

  const prefix = isSplit ? '+' : '';
  if (hours > 0) {
    return `${prefix}${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}.${pad2(centiseconds)}`;
  }
  return `${prefix}${pad2(minutes)}:${pad2(seconds)}.${pad2(centiseconds)}`;
};

const Stopwatch = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  // Mode: regular stopwatch or timer countdown
  const isTimerMode = !!route.params?.timerMode;
  const initialTimerDuration = (route.params?.initialSeconds || 0) * 1000;

  const [status, setStatus] = useState<TimerStatus>('idle');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [countdownRemaining, setCountdownRemaining] = useState<number>(initialTimerDuration);
  const [laps, setLaps] = useState<LapItem[]>([]);

  // Refs for precise time measurement
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop the timer loop
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    const now = Date.now();
    if (startTimeRef.current > 0) {
      accumulatedTimeRef.current += now - startTimeRef.current;
    }
  }, []);

  // Start the timer loop (handles both stopwatch up and timer countdown)
  const startTimer = useCallback((durationMs?: number) => {
    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const currentElapsed =
        accumulatedTimeRef.current + (now - startTimeRef.current);

      if (isTimerMode && durationMs) {
        const remaining = Math.max(0, durationMs - currentElapsed);
        setCountdownRemaining(remaining);
        if (remaining <= 0) {
          stopTimer();
          setStatus('paused');
        }
      } else {
        setElapsedTime(currentElapsed);
      }
    }, 30);
  }, [isTimerMode, stopTimer]);

  // Handle route params changes when navigating from Timer screen
  useEffect(() => {
    if (isTimerMode && initialTimerDuration > 0) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      accumulatedTimeRef.current = 0;
      setCountdownRemaining(initialTimerDuration);
      setStatus('running');
      startTimer(initialTimerDuration);
    }
  }, [route.params?.initialSeconds, isTimerMode]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Calculate current active lap duration
  const lastLapTotalTime = laps.length > 0 ? laps[0].totalTime : 0;
  const currentLapDuration = Math.max(0, elapsedTime - lastLapTotalTime);

  // Handler: Play / Pause toggle
  const handlePlayPause = () => {
    if (status === 'idle' || status === 'paused') {
      setStatus('running');
      if (isTimerMode) {
        startTimer(initialTimerDuration);
      } else {
        startTimer();
      }
    } else if (status === 'running') {
      setStatus('paused');
      stopTimer();
    }
  };

  // Handler: Reset to initial state 0 (Stopwatch mode)
  const handleReset = () => {
    if (status === 'paused') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      startTimeRef.current = 0;
      accumulatedTimeRef.current = 0;
      setElapsedTime(0);
      setLaps([]);
      setStatus('idle');
    }
  };

  // Handler: Cancel timer and return to Timer screen (Timer mode)
  const handleCancelTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    startTimeRef.current = 0;
    accumulatedTimeRef.current = 0;
    setCountdownRemaining(0);
    setElapsedTime(0);
    setStatus('idle');
    setLaps([]);
    navigation.setParams({ timerMode: false, initialSeconds: 0, timerName: undefined });
    navigation.navigate('Timer');
  };

  // Handler: Record Flag / Lap (Stopwatch mode)
  const handleLap = () => {
    if (status !== 'running' || isTimerMode) return;

    const currentTotal =
      accumulatedTimeRef.current + (Date.now() - startTimeRef.current);
    const prevTotal = laps.length > 0 ? laps[0].totalTime : 0;
    const lapDuration = currentTotal - prevTotal;
    const newLapNumber = laps.length + 1;

    const newLap: LapItem = {
      id: `${newLapNumber}-${Date.now()}`,
      lapNumber: newLapNumber,
      lapTime: lapDuration,
      totalTime: currentTotal,
    };

    // Prepend so latest lap appears at top
    setLaps((prev) => [newLap, ...prev]);
  };

  const activeDisplayTime = isTimerMode ? countdownRemaining : elapsedTime;

  // Elapsed progress time ensuring clockwise dot sweep in both modes
  const progressTime = isTimerMode
    ? Math.max(0, initialTimerDuration - countdownRemaining)
    : elapsedTime;

  // Calculate moving indicator dot coordinates on the perimeter (clockwise)
  const indicatorCoords = useMemo(() => {
    const angle =
      ((progressTime % 60000) / 60000) * 2 * Math.PI - Math.PI / 2;
    return {
      x: DIAL_CENTER + TICK_RADIUS * Math.cos(angle) - 4,
      y: DIAL_CENTER + TICK_RADIUS * Math.sin(angle) - 4,
    };
  }, [progressTime]);

  const { whitePart, redPart } = formatDisplayTime(activeDisplayTime);

  const renderLapItem = ({ item }: { item: LapItem }) => (
    <View style={styles.lapRow}>
      <Text style={styles.lapTextNumber}>{pad2(item.lapNumber)}</Text>
      <Text style={styles.lapTextSplit}>
        {formatLapTime(item.lapTime, true)}
      </Text>
      <Text style={styles.lapTextTotal}>
        {formatLapTime(item.totalTime, false)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Circular Dial Gauge */}
      <View style={styles.dialSection}>
        <View style={styles.dialGlowContainer}>
          <View style={styles.dialInner}>
            {/* 60 Dial Tick Dots */}
            {TICKS.map((tick) => (
              <View
                key={tick.id}
                style={[styles.tickDot, { left: tick.x, top: tick.y }]}
              />
            ))}

            {/* Glowing Red Position Dot */}
            <View
              style={[
                styles.indicatorDot,
                { left: indicatorCoords.x, top: indicatorCoords.y },
              ]}
            />

            {/* Digital Time Inside Dial */}
            <View style={styles.timeDisplayContainer}>
              <View style={styles.mainTimeRow}>
                <Text style={styles.mainTimeWhite}>{whitePart}</Text>
                <Text style={styles.mainTimeRed}>{redPart}</Text>
              </View>

              {/* Sub Lap Timer (visible in stopwatch mode when running / paused or laps recorded) */}
              {!isTimerMode && (status !== 'idle' || laps.length > 0) && (
                <Text style={styles.subLapTimeText}>
                  {formatLapTime(currentLapDuration, false)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Laps Table List (Stopwatch mode only) */}
      {!isTimerMode && laps.length > 0 && (
        <View style={styles.lapSection}>
          <View style={styles.lapTableHeader}>
            <Text style={styles.lapHeaderColLap}>Lap</Text>
            <Text style={styles.lapHeaderColLapTime}>Lap time</Text>
            <Text style={styles.lapHeaderColTotal}>Total</Text>
          </View>
          <FlatList
            data={laps}
            keyExtractor={(item) => item.id}
            renderItem={renderLapItem}
            style={styles.lapList}
            contentContainerStyle={styles.lapListContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Bottom Control Buttons */}
      <View
        style={[
          styles.bottomControls,
          !isTimerMode && status === 'idle' && styles.centerOnlyControls,
        ]}
      >
        {isTimerMode ? (
          <>
            {/* Cancel Button (Left) */}
            <View style={styles.sideButtonSlot}>
              <CustomIconButton
                iconName={IconName.Cancel}
                iconColor="#ffffff"
                buttonColor="#1c1c1e"
                size={60}
                iconSize={22}
                onPress={handleCancelTimer}
              />
            </View>

            {/* Pause / Play Button (Center) */}
            <CustomIconButton
              iconName={status === 'running' ? IconName.Pause : IconName.Play}
              iconColor="#ffffff"
              buttonColor="#e94343"
              size={68}
              iconSize={28}
              onPress={handlePlayPause}
            />

            {/* Empty Right Slot for symmetrical layout */}
            <View style={styles.sideButtonSlot} />
          </>
        ) : (
          <>
            {/* Reset Button (Left) */}
            {status !== 'idle' && (
              <View style={styles.sideButtonSlot}>
                <CustomIconButton
                  iconName={IconName.Reset}
                  iconColor="#ffffff"
                  buttonColor="#1c1c1e"
                  size={60}
                  iconSize={22}
                  disabled={status === 'running'}
                  onPress={handleReset}
                />
              </View>
            )}

            {/* Main Play / Pause Button (Center) */}
            <CustomIconButton
              iconName={status === 'running' ? IconName.Pause : IconName.Play}
              iconColor="#ffffff"
              buttonColor="#e94343"
              size={68}
              iconSize={28}
              onPress={handlePlayPause}
            />

            {/* Flag / Lap Button (Right) */}
            {status !== 'idle' && (
              <View style={styles.sideButtonSlot}>
                <CustomIconButton
                  iconName={IconName.Flag}
                  iconColor="#ffffff"
                  buttonColor="#1c1c1e"
                  size={60}
                  iconSize={22}
                  disabled={status === 'paused'}
                  onPress={handleLap}
                />
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default Stopwatch;
