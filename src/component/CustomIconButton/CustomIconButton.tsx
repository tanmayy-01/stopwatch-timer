import { TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { CustomIconButtonProps } from '../../types';
import Ionicons from '@react-native-vector-icons/ionicons';

const CustomIconButton = ({
  iconName,
  iconColor = '#ffffff',
  buttonColor = '#222222',
  onPress,
  disabled = false,
  size = 60,
  iconSize = 24,
}: CustomIconButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: buttonColor,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: disabled ? 0.35 : 1,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Ionicons
        name={iconName as any}
        size={iconSize}
        color={disabled ? '#777777' : iconColor}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CustomIconButton;
