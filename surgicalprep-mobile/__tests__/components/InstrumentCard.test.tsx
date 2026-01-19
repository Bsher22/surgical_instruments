/**
 * InstrumentCard Component Tests
 */
import React from 'react';
import { render, fireEvent, factories } from '../../utils/test-utils';
import InstrumentCard from '@/components/InstrumentCard';

describe('InstrumentCard', () => {
  const mockInstrument = factories.instrument({
    id: 'test-123',
    name: 'Mayo Scissors',
    category: 'cutting',
    image_url: 'https://example.com/mayo.jpg',
  });

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders instrument name correctly', () => {
      const { getByText } = render(
        <InstrumentCard instrument={mockInstrument} onPress={mockOnPress} />
      );

      expect(getByText('Mayo Scissors')).toBeTruthy();
    });

    it('renders category badge', () => {
      const { getByText } = render(
        <InstrumentCard instrument={mockInstrument} onPress={mockOnPress} />
      );

      expect(getByText('cutting')).toBeTruthy();
    });

    it('renders image with correct source', () => {
      const { getByTestId } = render(
        <InstrumentCard instrument={mockInstrument} onPress={mockOnPress} />
      );

      const image = getByTestId('instrument-image');
      expect(image.props.source.uri).toBe('https://example.com/mayo.jpg');
    });

    it('renders placeholder when no image provided', () => {
      const instrumentWithoutImage = factories.instrument({
        ...mockInstrument,
        image_url: null,
      });

      const { getByTestId } = render(
        <InstrumentCard instrument={instrumentWithoutImage} onPress={mockOnPress} />
      );

      expect(getByTestId('image-placeholder')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when card is pressed', () => {
      const { getByTestId } = render(
        <InstrumentCard instrument={mockInstrument} onPress={mockOnPress} />
      );

      fireEvent.press(getByTestId('instrument-card'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
      expect(mockOnPress).toHaveBeenCalledWith(mockInstrument);
    });

    it('does not crash when onPress is not provided', () => {
      const { getByTestId } = render(
        <InstrumentCard instrument={mockInstrument} />
      );

      expect(() => fireEvent.press(getByTestId('instrument-card'))).not.toThrow();
    });
  });

  describe('Premium Lock', () => {
    it('shows premium lock overlay for premium instruments when user is free', () => {
      const premiumInstrument = factories.instrument({
        ...mockInstrument,
        is_premium: true,
      });

      const { getByTestId } = render(
        <InstrumentCard
          instrument={premiumInstrument}
          onPress={mockOnPress}
          isPremiumUser={false}
        />
      );

      expect(getByTestId('premium-lock-overlay')).toBeTruthy();
    });

    it('does not show premium lock for free instruments', () => {
      const { queryByTestId } = render(
        <InstrumentCard
          instrument={mockInstrument}
          onPress={mockOnPress}
          isPremiumUser={false}
        />
      );

      expect(queryByTestId('premium-lock-overlay')).toBeNull();
    });

    it('does not show premium lock for premium users', () => {
      const premiumInstrument = factories.instrument({
        ...mockInstrument,
        is_premium: true,
      });

      const { queryByTestId } = render(
        <InstrumentCard
          instrument={premiumInstrument}
          onPress={mockOnPress}
          isPremiumUser={true}
        />
      );

      expect(queryByTestId('premium-lock-overlay')).toBeNull();
    });
  });

  describe('Bookmark State', () => {
    it('shows bookmark icon when instrument is bookmarked', () => {
      const { getByTestId } = render(
        <InstrumentCard
          instrument={mockInstrument}
          onPress={mockOnPress}
          isBookmarked={true}
        />
      );

      expect(getByTestId('bookmark-icon-filled')).toBeTruthy();
    });

    it('shows empty bookmark icon when not bookmarked', () => {
      const { getByTestId } = render(
        <InstrumentCard
          instrument={mockInstrument}
          onPress={mockOnPress}
          isBookmarked={false}
        />
      );

      expect(getByTestId('bookmark-icon-outline')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('renders skeleton when loading', () => {
      const { getByTestId } = render(
        <InstrumentCard.Skeleton />
      );

      expect(getByTestId('instrument-card-skeleton')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has accessible label', () => {
      const { getByLabelText } = render(
        <InstrumentCard instrument={mockInstrument} onPress={mockOnPress} />
      );

      expect(getByLabelText('Mayo Scissors, cutting instrument')).toBeTruthy();
    });

    it('is marked as a button', () => {
      const { getByRole } = render(
        <InstrumentCard instrument={mockInstrument} onPress={mockOnPress} />
      );

      expect(getByRole('button')).toBeTruthy();
    });
  });
});
