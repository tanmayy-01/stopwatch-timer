export enum IconName {
  Play = 'play',
  Pause = 'pause',
  Reset = 'reload',
  Flag = 'flag'
}

export interface CustomIconButtonProps {
  iconName: IconName;
  iconColor?: string;
  buttonColor?: string;
  disabled?:boolean;
  onPress: () => void;
}
