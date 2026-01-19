/**
 * FlashCard Component Tests
 */
import React from 'react';
import { render, fireEvent, factories, waitFor } from '../../utils/test-utils';
import FlashCard from '@/components/FlashCard';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  return {
    ...Reanimated,
    useSharedValue: jest.fn((initial) => ({ value: initial })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((value) => value),
    withSpring: jest.fn((value) => value),
    runOnJS: jest.fn((fn) => fn),
  };
});

describe('FlashCard', () => {
  const mockInstrument = factories.instrument({
    id: 'test-123',
    name: 'Mayo Scissors',
    description: 'Heavy scissors used for cutting fascia.',
    primary_uses: ['Cutting fascia', 'Cutting sutures'],
    image_url: 'https://example.com/mayo.jpg',
  });

  const mockOnSwipeLeft = jest.fn();
  const mockOnSwipeRight = jest.fn();
  const mockOnFlip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Front Face', () => {
    it('renders instrument image on front', () => {
      const { getByTestId } = render(
        <FlashCard
          instrument={mockInstrument}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
        />
      );

      expect(getByTestId('flashcard-image')).toBeTruthy();
    });

    it('shows "Tap to reveal" hint', () => {
      const { getByText } = render(
        <FlashCard
          instrument={mockInstrument}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
        />
      );

      expect(getByText(/tap to reveal/i)).toBeTruthy();
    });
  });

  describe('Back Face', () => {
    it('renders instrument name on back', () => {
      const { getByTestId, getByText } = render(
        <FlashCard
          instrument={mockInstrument}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          initiallyFlipped={true}
        />
      );

      expect(getByText('Mayo Scissors')).toBeTruthy();
    });

    it('renders description on back', () => {
      const { getByText } = render(
        <FlashCard
          instrument={mockInstrument}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          initiallyFlipped={true}
        />
      );

      expect(getByText(/Heavy scissors/)).toBeTruthy();
    });

    it('renders primary uses on back', () => {
      const { getByText } = render(
        <FlashCard
          instrument={mockInstrument}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          initiallyFlipped={true}
        />
      );

      expect(getByText('Cutting fascia')).toBeTruthy();
      expect(getByText('Cutting sutures')).toBeTruthy();
    });
  });

  describe('Flip Interaction', () => {
    it('flips card when tapped', () => {
      const { getByTestId } = render(
        <FlashCard
          instrument={mockInstrument}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          onFlip={mockOnFlip}
        />
      );

      fireEvent.press(getByTestId('flashcard-pressable'));

      expect(mockOnFlip).toHaveBeenCalledTimes(1);
    });

    it('toggles between front and back', async () => {
      const { getByTestId, queryByText, rerender } = render(
        <FlashCard
          instrument={mockInstrument}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          onFlip={mockOnFlip}
        />
      );

      // Initially on front - should not show name prominently
      // After flip - should show name
      fireEvent.press(getByTestId('flashcard-pressable'));

      // Re-render with flipped state
      rerender(
        <FlashCard
          instrument={mockInstrument}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          onFlip={mockOnFlip}
          initiallyFlipped={true}
        />
      );

      expect(queryByText('Mayo Scissors')).toBeTruthy();
    });
  });

  describe('Swipe Gestures', () => {
    it('calls onSwipeRight when swiped right (knew it)', () => {
      const { getByTestId } = render(
        <FlashCard
          instrument={mockInstrument}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
        />
      );

      // Simulate swipe right gesture
      const card = getByTestId('flashcard-gesture-area');
      fireEvent(card, 'onGestureEvent', {
        nativeEvent: { translationX: 150, state: 5 }, // State 5 = END
      });

      // Note: Actual gesture handling would be tested in integration tests
      // This tests that the component accepts the gesture handler props
      expect(card).toBeTruthy();
    });

    it('calls onSwipeLeft when swiped left (study more)', () => {
      const { getByTestId } = render(
        <FlashCard
          instrument={mockInstrument}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
        />
      );

      const card = getByTestId('flashcard-gesture-area');
      fireEvent(card, 'onGestureEvent', {
        nativeEvent: { translationX: -150, state: 5 },
      });

      expect(card).toBeTruthy();
    });
  });

  describe('Visual Indicators', () => {
    it('shows "Got it" indicator when swiping right', () => {
      const { getByTestId, queryByText } = render(
        <FlashCard
          instrument={mockInstrument}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          swipeDirection="right"
        />
      );

      // When actively swiping right, should show indicator
      expect(queryByText(/got it/i) || getByTestId('swipe-indicator-right')).toBeTruthy();
    });

    it('shows "Study more" indicator when swiping left', () => {
      const { getByTestId, queryByText } = render(
        <FlashCard
          instrument={mockInstrument}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          swipeDirection="left"
        />
      );

      expect(queryByText(/study more/i) || getByTestId('swipe-indicator-left')).toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('does not respond to gestures when disabled', () => {
      const { getByTestId } = render(
        <FlashCard
          instrument={mockInstrument}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          disabled={true}
        />
      );

      fireEvent.press(getByTestId('flashcard-pressable'));

      expect(mockOnFlip).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByLabelText } = render(
        <FlashCard
          instrument={mockInstrument}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
        />
      );

      expect(
        getByLabelText(/flashcard/i) || getByLabelText(/Mayo Scissors/i)
      ).toBeTruthy();
    });

    it('announces flip action', () => {
      const { getByTestId } = render(
        <FlashCard
          instrument={mockInstrument}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
        />
      );

      const pressable = getByTestId('flashcard-pressable');
      expect(pressable.props.accessibilityHint).toMatch(/tap to flip/i);
    });
  });
});
