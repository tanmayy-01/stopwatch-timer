import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './Timer.styles';
import CustomIconButton from '../../component/CustomIconButton';
import { IconName, SavedTimer } from '../../types';

const ITEM_HEIGHT = 52;
const HOURS_DATA = Array.from({ length: 24 }, (_, i) => i);
const MINUTES_DATA = Array.from({ length: 60 }, (_, i) => i);
const SECONDS_DATA = Array.from({ length: 60 }, (_, i) => i);

const pad2 = (n: number): string => n.toString().padStart(2, '0');

const formatTimerDuration = (h: number, m: number, s: number): string => {
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
};

const Timer = () => {
  const navigation = useNavigation<any>();

  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  // Saved timers list (initially empty)
  const [savedTimers, setSavedTimers] = useState<SavedTimer[]>([]);
  const [selectedTimerId, setSelectedTimerId] = useState<string | null>(null);

  // Modal state for adding a new timer
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [newTimerName, setNewTimerName] = useState<string>('');
  const [modalHours, setModalHours] = useState<string>('0');
  const [modalMinutes, setModalMinutes] = useState<string>('0');
  const [modalSeconds, setModalSeconds] = useState<string>('0');

  // FlatList refs for programmatic scrolling
  const hoursListRef = useRef<FlatList>(null);
  const minutesListRef = useRef<FlatList>(null);
  const secondsListRef = useRef<FlatList>(null);

  // Scroll to initial values on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      hoursListRef.current?.scrollToOffset({
        offset: hours * ITEM_HEIGHT,
        animated: false,
      });
      minutesListRef.current?.scrollToOffset({
        offset: minutes * ITEM_HEIGHT,
        animated: false,
      });
      secondsListRef.current?.scrollToOffset({
        offset: seconds * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToTime = (h: number, m: number, s: number) => {
    setHours(h);
    setMinutes(m);
    setSeconds(s);
    hoursListRef.current?.scrollToOffset({
      offset: h * ITEM_HEIGHT,
      animated: true,
    });
    minutesListRef.current?.scrollToOffset({
      offset: m * ITEM_HEIGHT,
      animated: true,
    });
    secondsListRef.current?.scrollToOffset({
      offset: s * ITEM_HEIGHT,
      animated: true,
    });
  };

  // Scroll handlers for snap calculation
  const handleScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
    type: 'hours' | 'minutes' | 'seconds'
  ) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.max(0, Math.round(offsetY / ITEM_HEIGHT));
    let newH = hours;
    let newM = minutes;
    let newS = seconds;

    if (type === 'hours') {
      newH = Math.min(index, 23);
      setHours(newH);
    } else if (type === 'minutes') {
      newM = Math.min(index, 59);
      setMinutes(newM);
    } else {
      newS = Math.min(index, 59);
      setSeconds(newS);
    }

    // Check if new time matches any saved timer to highlight it
    const matchingTimer = savedTimers.find(
      (t) => t.hours === newH && t.minutes === newM && t.seconds === newS
    );
    setSelectedTimerId(matchingTimer ? matchingTimer.id : null);
  };

  // Handle selecting a saved timer
  const handleSelectTimer = (timer: SavedTimer) => {
    setSelectedTimerId(timer.id);
    scrollToTime(timer.hours, timer.minutes, timer.seconds);
  };

  // Open add modal with current time prefilled
  const handleOpenAddModal = () => {
    setNewTimerName(`Timer ${savedTimers.length + 1}`);
    setModalHours(hours.toString());
    setModalMinutes(minutes.toString());
    setModalSeconds(seconds.toString());
    setIsAddModalVisible(true);
  };

  // Save new custom timer
  const handleSaveTimer = () => {
    const parsedH = Math.min(23, Math.max(0, parseInt(modalHours, 10) || 0));
    const parsedM = Math.min(59, Math.max(0, parseInt(modalMinutes, 10) || 0));
    const parsedS = Math.min(59, Math.max(0, parseInt(modalSeconds, 10) || 0));

    const newTimer: SavedTimer = {
      id: Date.now().toString(),
      name: newTimerName.trim() || `Timer ${savedTimers.length + 1}`,
      hours: parsedH,
      minutes: parsedM,
      seconds: parsedS,
    };

    setSavedTimers((prev) => [...prev, newTimer]);
    setSelectedTimerId(newTimer.id);
    scrollToTime(parsedH, parsedM, parsedS);
    setIsAddModalVisible(false);
  };

  // Start timer and redirect to Stopwatch screen
  const handleStartTimer = () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const duration = totalSeconds > 0 ? totalSeconds : 15 * 60; // fallback to 15 mins if 0

    navigation.navigate('Stopwatch', {
      timerMode: true,
      initialSeconds: duration,
      timerName:
        savedTimers.find((t) => t.id === selectedTimerId)?.name || 'Timer',
    });
  };

  // Render wheel column item
  const renderPickerItem = (item: number, selectedValue: number) => {
    const isSelected = item === selectedValue;
    return (
      <View style={styles.pickerItem}>
        <Text
          style={[styles.pickerText, isSelected && styles.pickerTextSelected]}
        >
          {pad2(item)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Scrollable Time Selector */}
        <View style={styles.pickerSection}>
          <View style={styles.pickerRow}>
            {/* Hours Column */}
            <FlatList
              ref={hoursListRef}
              data={HOURS_DATA}
              keyExtractor={(item) => `h-${item}`}
              renderItem={({ item }) => renderPickerItem(item, hours)}
              style={styles.pickerColumn}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingTop: ITEM_HEIGHT,
                paddingBottom: ITEM_HEIGHT,
              }}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              onMomentumScrollEnd={(e) => handleScrollEnd(e, 'hours')}
            />

            <Text style={styles.pickerColon}>:</Text>

            {/* Minutes Column */}
            <FlatList
              ref={minutesListRef}
              data={MINUTES_DATA}
              keyExtractor={(item) => `m-${item}`}
              renderItem={({ item }) => renderPickerItem(item, minutes)}
              style={styles.pickerColumn}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingTop: ITEM_HEIGHT,
                paddingBottom: ITEM_HEIGHT,
              }}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              onMomentumScrollEnd={(e) => handleScrollEnd(e, 'minutes')}
            />

            <Text style={styles.pickerColon}>:</Text>

            {/* Seconds Column */}
            <FlatList
              ref={secondsListRef}
              data={SECONDS_DATA}
              keyExtractor={(item) => `s-${item}`}
              renderItem={({ item }) => renderPickerItem(item, seconds)}
              style={styles.pickerColumn}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingTop: ITEM_HEIGHT,
                paddingBottom: ITEM_HEIGHT,
              }}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              onMomentumScrollEnd={(e) => handleScrollEnd(e, 'seconds')}
            />
          </View>
        </View>

        {/* Frequently Used Timers Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Frequently used timers</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={handleOpenAddModal}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Frequently Used Timers List */}
        <FlatList
          data={savedTimers}
          keyExtractor={(item) => item.id}
          style={styles.timersList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedTimerId;
            return (
              <TouchableOpacity
                style={[
                  styles.timerCard,
                  isSelected && styles.timerCardSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectTimer(item)}
              >
                <Text
                  style={[
                    styles.timerCardName,
                    isSelected && styles.timerCardNameSelected,
                  ]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.timerCardDuration,
                    isSelected && styles.timerCardDurationSelected,
                  ]}
                >
                  {formatTimerDuration(item.hours, item.minutes, item.seconds)}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Bottom Play Button */}
        <View style={styles.bottomControls}>
          <CustomIconButton
            iconName={IconName.Play}
            iconColor="#ffffff"
            buttonColor="#e94343"
            size={68}
            iconSize={28}
            onPress={handleStartTimer}
          />
        </View>
      </View>

      {/* Add Timer Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Timer</Text>

            <Text style={styles.inputLabel}>Timer Name</Text>
            <TextInput
              style={styles.textInput}
              value={newTimerName}
              onChangeText={setNewTimerName}
              placeholder="e.g. Workout, Tea, Study"
              placeholderTextColor="#666666"
            />

            <Text style={styles.inputLabel}>Duration</Text>
            <View style={styles.durationInputsRow}>
              <View style={styles.durationInputGroup}>
                <TextInput
                  style={styles.durationInput}
                  value={modalHours}
                  onChangeText={setModalHours}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.durationUnitLabel}>Hours</Text>
              </View>
              <View style={styles.durationInputGroup}>
                <TextInput
                  style={styles.durationInput}
                  value={modalMinutes}
                  onChangeText={setModalMinutes}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.durationUnitLabel}>Mins</Text>
              </View>
              <View style={styles.durationInputGroup}>
                <TextInput
                  style={styles.durationInput}
                  value={modalSeconds}
                  onChangeText={setModalSeconds}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.durationUnitLabel}>Secs</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                activeOpacity={0.7}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                activeOpacity={0.7}
                onPress={handleSaveTimer}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Timer;