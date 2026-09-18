export enum IconName {
  Play = 'play',
  Pause = 'pause',
  Reset = 'reload',
  Flag = 'flag',
  Cancel = 'close',
}

export interface CustomIconButtonProps {
  iconName: IconName | string;
  iconColor?: string;
  buttonColor?: string;
  disabled?: boolean;
  size?: number;
  iconSize?: number;
  onPress: () => void;
}

export interface LapItem {
  id: string;
  lapNumber: number;
  lapTime: number;
  totalTime: number;
}

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface SavedTimer {
  id: string;
  name: string;
  hours: number;
  minutes: number;
  seconds: number;
}
