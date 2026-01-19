// src/components/cards/SpecialtyPicker.tsx
// Specialty dropdown component for preference cards

import React, { memo, useMemo } from 'react';
import { FormPicker, PickerOption } from '../ui/FormPicker';
import { SURGICAL_SPECIALTIES } from '../../utils/specialties';

interface SpecialtyPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  containerStyle?: object;
}

export const SpecialtyPicker: React.FC<SpecialtyPickerProps> = memo(
  ({ value, onValueChange, error, required = false, disabled = false, containerStyle }) => {
    // Memoize options to prevent unnecessary re-renders
    const options: PickerOption[] = useMemo(
      () =>
        SURGICAL_SPECIALTIES.map((specialty) => ({
          value: specialty.id,
          label: specialty.label,
        })),
      []
    );

    return (
      <FormPicker
        label="Specialty"
        value={value}
        options={options}
        onValueChange={onValueChange}
        placeholder="Select a surgical specialty"
        error={error}
        required={required}
        disabled={disabled}
        containerStyle={containerStyle}
        helpText="Choose the surgical specialty for this preference card"
        allowClear
      />
    );
  }
);

SpecialtyPicker.displayName = 'SpecialtyPicker';

export default SpecialtyPicker;
