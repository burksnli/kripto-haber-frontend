import { Alert, Platform } from 'react-native';

/**
 * Platform-aware alert function
 * Uses native Alert on mobile and window.alert/confirm on web
 */
export const showAlert = (
  title: string,
  message?: string,
  buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>
) => {
  if (Platform.OS === 'web') {
    // For web platform
    if (buttons && buttons.length > 1) {
      // Multiple buttons - use confirm
      const confirmed = window.confirm(`${title}\n\n${message || ''}`);
      if (confirmed) {
        const confirmButton = buttons.find(b => b.style !== 'cancel');
        confirmButton?.onPress?.();
      } else {
        const cancelButton = buttons.find(b => b.style === 'cancel');
        cancelButton?.onPress?.();
      }
    } else {
      // Single button - use alert
      window.alert(`${title}\n\n${message || ''}`);
      buttons?.[0]?.onPress?.();
    }
  } else {
    // For native platforms - use native Alert
    Alert.alert(
      title,
      message,
      buttons?.map(b => ({
        text: b.text,
        onPress: b.onPress,
        style: b.style,
      }))
    );
  }
};

