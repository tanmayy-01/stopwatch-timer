import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { CustomIconButtonProps } from '../../types';
import Ionicons from '@react-native-vector-icons/ionicons';

const CustomIconButton = ({
  iconName,
  iconColor = '#ffffff',
  buttonColor = '#222222',
  onPress,
  disabled
}: CustomIconButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: buttonColor }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons name={iconName} size={24} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    width: 60,
    borderRadius: 30
  },
});

export default CustomIconButton;
