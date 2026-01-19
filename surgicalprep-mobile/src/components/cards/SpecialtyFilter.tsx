import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Specialty, SPECIALTY_OPTIONS } from '../../types/cards';

interface SpecialtyFilterProps {
  visible: boolean;
  onClose: () => void;
  selectedSpecialty: Specialty | null;
  onSelectSpecialty: (specialty: Specialty | null) => void;
}

export function SpecialtyFilter({
  visible,
  onClose,
  selectedSpecialty,
  onSelectSpecialty,
}: SpecialtyFilterProps) {
  const handleSelect = (specialty: Specialty | null) => {
    onSelectSpecialty(specialty);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter by Specialty</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* All specialties option */}
            <TouchableOpacity
              style={[
                styles.optionItem,
                selectedSpecialty === null && styles.optionItemSelected,
              ]}
              onPress={() => handleSelect(null)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedSpecialty === null && styles.optionTextSelected,
                ]}
              >
                All Specialties
              </Text>
              {selectedSpecialty === null && (
                <Ionicons name="checkmark" size={22} color="#4a90d9" />
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Individual specialties */}
            {SPECIALTY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  selectedSpecialty === option.value && styles.optionItemSelected,
                ]}
                onPress={() => handleSelect(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedSpecialty === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedSpecialty === option.value && (
                  <Ionicons name="checkmark" size={22} color="#4a90d9" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedSpecialty !== null && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => handleSelect(null)}
              >
                <Text style={styles.clearButtonText}>Clear Filter</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 34, // Safe area
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  optionItemSelected: {
    backgroundColor: '#f8fbff',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderBottomColor: '#e8f4fd',
  },
  optionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  optionTextSelected: {
    color: '#4a90d9',
    fontWeight: '600',
  },
  divider: {
    height: 8,
    backgroundColor: '#f5f5f5',
    marginHorizontal: -20,
    marginVertical: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

export default SpecialtyFilter;
