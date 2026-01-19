// src/components/profile/SettingsRow.tsx
// Individual settings row with support for toggle, link, value display, and slider

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../../stores/settingsStore';

type SettingsRowType = 'toggle' | 'link' | 'value' | 'slider' | 'select';

interface BaseProps {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  subtitle?: string;
  isLast?: boolean;
  destructive?: boolean;
}

interface ToggleProps extends BaseProps {
  type: 'toggle';
  value: boolean;
  onValueChange: (value: boolean) => void;
}

interface LinkProps extends BaseProps {
  type: 'link';
  onPress: () => void;
  value?: string;
}

interface ValueProps extends BaseProps {
  type: 'value';
  value: string;
}

interface SliderProps extends BaseProps {
  type: 'slider';
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  onValueChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

interface SelectProps extends BaseProps {
  type: 'select';
  value: string;
  onPress: () => void;
}

type SettingsRowProps =
  | ToggleProps
  | LinkProps
  | ValueProps
  | SliderProps
  | SelectProps;

export const SettingsRow: React.FC<SettingsRowProps> = (props) => {
  const hapticEnabled = useSettingsStore((state) => state.hapticFeedback);
  const { icon, iconColor = '#6366F1', label, subtitle, isLast = false, destructive = false } = props;
  
  const handlePress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (props.type === 'link' || props.type === 'select') {
      props.onPress();
    }
  };
  
  const handleToggle = (value: boolean) => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (props.type === 'toggle') {
      props.onValueChange(value);
    }
  };
  
  const handleSliderChange = (value: number) => {
    if (props.type === 'slider') {
      props.onValueChange(value);
    }
  };
  
  const handleSliderComplete = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const renderContent = () => {
    switch (props.type) {
      case 'toggle':
        return (
          <Switch
            value={props.value}
            onValueChange={handleToggle}
            trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
            thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
            ios_backgroundColor="#E5E7EB"
          />
        );
      
      case 'link':
        return (
          <View style={styles.linkContent}>
            {props.value && (
              <Text style={styles.linkValue}>{props.value}</Text>
            )}
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        );
      
      case 'value':
        return (
          <Text style={styles.valueText}>{props.value}</Text>
        );
      
      case 'slider':
        return null; // Slider renders below the row
      
      case 'select':
        return (
          <View style={styles.linkContent}>
            <Text style={styles.selectValue}>{props.value}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        );
      
      default:
        return null;
    }
  };
  
  const isInteractive = props.type === 'link' || props.type === 'select';
  const Container = isInteractive ? TouchableOpacity : View;
  
  return (
    <View>
      <Container
        style={[
          styles.container,
          !isLast && styles.containerBorder,
        ]}
        onPress={isInteractive ? handlePress : undefined}
        activeOpacity={0.7}
      >
        <View style={styles.leftContent}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
              <Ionicons
                name={icon}
                size={18}
                color={destructive ? '#EF4444' : iconColor}
              />
            </View>
          )}
          <View style={styles.labelContainer}>
            <Text style={[
              styles.label,
              destructive && styles.labelDestructive,
            ]}>
              {label}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.rightContent}>
          {renderContent()}
        </View>
      </Container>
      
      {/* Slider renders below the main row */}
      {props.type === 'slider' && (
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            value={props.value}
            minimumValue={props.minimumValue}
            maximumValue={props.maximumValue}
            step={props.step || 1}
            onValueChange={handleSliderChange}
            onSlidingComplete={handleSliderComplete}
            minimumTrackTintColor="#6366F1"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#6366F1"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderMin}>{props.minimumValue}</Text>
            <Text style={styles.sliderValue}>
              {props.formatValue
                ? props.formatValue(props.value)
                : props.value}
            </Text>
            <Text style={styles.sliderMax}>{props.maximumValue}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  containerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  labelDestructive: {
    color: '#EF4444',
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  valueText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectValue: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  sliderContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -4,
  },
  sliderMin: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sliderMax: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
});

export default SettingsRow;
