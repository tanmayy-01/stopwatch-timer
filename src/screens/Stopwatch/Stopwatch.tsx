import { View, Text } from 'react-native';
import React from 'react';
import { styles } from './Stopwatch.styles';
import CustomIconButton from '../../component/CustomIconButton';
import { IconName } from '../../types';

const Stopwatch = () => {
  return (
    <View style={styles.container}>
      <Text style={{ color: '#fff' }}>Stopwatch</Text>
      <View style={styles.button_container}>
        <CustomIconButton
          iconName={IconName.Reset}
          iconColor="#ffffff"
          onPress={() => {}}
          buttonColor="#222222"
        />
        <CustomIconButton
          iconName={IconName.Play}
          iconColor="#ffffff"
          onPress={() => {}}
          buttonColor="red"
        />
        <CustomIconButton
          iconName={IconName.Flag}
          iconColor="#ffffff"
          onPress={() => {}}
          buttonColor="#222222"
        />
      </View>
    </View>
  );
};

export default Stopwatch;
