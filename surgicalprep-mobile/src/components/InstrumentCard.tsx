import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import { Instrument } from '../types';

interface InstrumentCardProps {
  instrument: Instrument;
  onPress: (instrument: Instrument) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  cutting: { bg: '#FEE2E2', text: '#DC2626' },
  clamping: { bg: '#DBEAFE', text: '#2563EB' },
  grasping: { bg: '#D1FAE5', text: '#059669' },
  retracting: { bg: '#FEF3C7', text: '#D97706' },
  suturing: { bg: '#E9D5FF', text: '#7C3AED' },
  suctioning: { bg: '#CFFAFE', text: '#0891B2' },
  dilating: { bg: '#FCE7F3', text: '#DB2777' },
  probing: { bg: '#F3E8FF', text: '#9333EA' },
  measuring: { bg: '#ECFCCB', text: '#65A30D' },
  specialty: { bg: '#E0E7FF', text: '#4F46E5' },
  default: { bg: '#F3F4F6', text: '#6B7280' },
};

export function InstrumentCard({ instrument, onPress }: InstrumentCardProps) {
  const categoryColor = CATEGORY_COLORS[instrument.category.toLowerCase()] || CATEGORY_COLORS.default;

  const imageSource: ImageSourcePropType = instrument.image_url
    ? { uri: instrument.image_url }
    : require('../../assets/placeholder-instrument.png');

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(instrument)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${instrument.name}, ${instrument.category} instrument`}
    >
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {instrument.name}
        </Text>
        
        {instrument.aliases && instrument.aliases.length > 0 && (
          <Text style={styles.alias} numberOfLines={1}>
            aka {instrument.aliases[0]}
          </Text>
        )}
        
        <View style={[styles.badge, { backgroundColor: categoryColor.bg }]}>
          <Text style={[styles.badgeText, { color: categoryColor.text }]}>
            {instrument.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  alias: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default InstrumentCard;
