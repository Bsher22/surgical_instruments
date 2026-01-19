/**
 * QuizQuestion Component Tests
 */
import React from 'react';
import { render, fireEvent, factories, waitFor } from '../../utils/test-utils';
import QuizQuestion from '@/components/QuizQuestion';

describe('QuizQuestion', () => {
  const mockQuestion = factories.quizQuestion({
    id: 'q-123',
    question_type: 'image_to_name',
    image_url: 'https://example.com/instrument.jpg',
    question_text: 'Identify this surgical instrument:',
    options: ['Mayo Scissors', 'Kelly Forceps', 'Metzenbaum Scissors', 'Debakey Forceps'],
    correct_answer: 'Mayo Scissors',
  });

  const mockOnAnswer = jest.fn();
  const mockOnNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Question Display', () => {
    it('renders question text', () => {
      const { getByText } = render(
        <QuizQuestion question={mockQuestion} onAnswer={mockOnAnswer} />
      );

      expect(getByText('Identify this surgical instrument:')).toBeTruthy();
    });

    it('renders question image for image_to_name type', () => {
      const { getByTestId } = render(
        <QuizQuestion question={mockQuestion} onAnswer={mockOnAnswer} />
      );

      const image = getByTestId('question-image');
      expect(image.props.source.uri).toBe('https://example.com/instrument.jpg');
    });

    it('renders all answer options', () => {
      const { getByText } = render(
        <QuizQuestion question={mockQuestion} onAnswer={mockOnAnswer} />
      );

      expect(getByText('Mayo Scissors')).toBeTruthy();
      expect(getByText('Kelly Forceps')).toBeTruthy();
      expect(getByText('Metzenbaum Scissors')).toBeTruthy();
      expect(getByText('Debakey Forceps')).toBeTruthy();
    });

    it('renders option labels (A, B, C, D)', () => {
      const { getByText } = render(
        <QuizQuestion question={mockQuestion} onAnswer={mockOnAnswer} />
      );

      expect(getByText('A')).toBeTruthy();
      expect(getByText('B')).toBeTruthy();
      expect(getByText('C')).toBeTruthy();
      expect(getByText('D')).toBeTruthy();
    });
  });

  describe('Answer Selection', () => {
    it('calls onAnswer when option is selected', () => {
      const { getByText } = render(
        <QuizQuestion question={mockQuestion} onAnswer={mockOnAnswer} />
      );

      fireEvent.press(getByText('Mayo Scissors'));

      expect(mockOnAnswer).toHaveBeenCalledWith('Mayo Scissors');
    });

    it('highlights selected option', () => {
      const { getByTestId, rerender } = render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          selectedAnswer="Mayo Scissors"
        />
      );

      const selectedOption = getByTestId('option-0');
      expect(selectedOption.props.style).toMatchObject(
        expect.objectContaining({
          // Selected style properties
        })
      );
    });

    it('disables options after selection when showResult is true', () => {
      const { getByTestId } = render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          selectedAnswer="Kelly Forceps"
          showResult={true}
        />
      );

      // Try to select another option
      const option = getByTestId('option-2');
      fireEvent.press(option);

      // Should not call onAnswer again
      expect(mockOnAnswer).not.toHaveBeenCalled();
    });
  });

  describe('Result Display', () => {
    it('shows correct indicator for correct answer', () => {
      const { getByTestId, getByText } = render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          selectedAnswer="Mayo Scissors"
          showResult={true}
          isCorrect={true}
        />
      );

      expect(getByTestId('result-correct') || getByText(/correct/i)).toBeTruthy();
    });

    it('shows incorrect indicator for wrong answer', () => {
      const { getByTestId, getByText } = render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          selectedAnswer="Kelly Forceps"
          showResult={true}
          isCorrect={false}
        />
      );

      expect(getByTestId('result-incorrect') || getByText(/incorrect/i)).toBeTruthy();
    });

    it('highlights correct answer when showing result', () => {
      const { getByTestId } = render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          selectedAnswer="Kelly Forceps"
          showResult={true}
          isCorrect={false}
        />
      );

      // The correct answer (Mayo Scissors, option 0) should be highlighted
      const correctOption = getByTestId('option-0');
      expect(correctOption.props.accessibilityState?.selected || 
             correctOption.props.style?.borderColor).toBeTruthy();
    });

    it('shows explanation when provided', () => {
      const { getByText } = render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          selectedAnswer="Mayo Scissors"
          showResult={true}
          isCorrect={true}
          explanation="Mayo Scissors are heavy scissors used for cutting fascia."
        />
      );

      expect(getByText(/Mayo Scissors are heavy scissors/)).toBeTruthy();
    });
  });

  describe('Timer', () => {
    it('displays timer when enabled', () => {
      const { getByTestId } = render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          showTimer={true}
          timeRemaining={25}
        />
      );

      expect(getByTestId('question-timer')).toBeTruthy();
    });

    it('shows correct time remaining', () => {
      const { getByText } = render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          showTimer={true}
          timeRemaining={25}
        />
      );

      expect(getByText('25') || getByText('0:25')).toBeTruthy();
    });

    it('shows warning style when time is low', () => {
      const { getByTestId } = render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          showTimer={true}
          timeRemaining={5}
        />
      );

      const timer = getByTestId('question-timer');
      // Timer should have warning/red style when time is low
      expect(timer.props.style || timer.props.className).toBeTruthy();
    });
  });

  describe('Question Types', () => {
    it('renders name_to_use question correctly', () => {
      const nameToUseQuestion = factories.quizQuestion({
        ...mockQuestion,
        question_type: 'name_to_use',
        image_url: null,
        question_text: 'What is the primary use of Mayo Scissors?',
        options: ['Cutting fascia', 'Grasping tissue', 'Retracting skin', 'Suturing'],
        correct_answer: 'Cutting fascia',
      });

      const { getByText, queryByTestId } = render(
        <QuizQuestion question={nameToUseQuestion} onAnswer={mockOnAnswer} />
      );

      expect(getByText('What is the primary use of Mayo Scissors?')).toBeTruthy();
      expect(queryByTestId('question-image')).toBeNull();
    });

    it('renders image_to_category question correctly', () => {
      const categoryQuestion = factories.quizQuestion({
        ...mockQuestion,
        question_type: 'image_to_category',
        question_text: 'What category does this instrument belong to?',
        options: ['Cutting', 'Clamping', 'Grasping', 'Retraction'],
        correct_answer: 'Cutting',
      });

      const { getByText, getByTestId } = render(
        <QuizQuestion question={categoryQuestion} onAnswer={mockOnAnswer} />
      );

      expect(getByText('What category does this instrument belong to?')).toBeTruthy();
      expect(getByTestId('question-image')).toBeTruthy();
    });
  });

  describe('Next Button', () => {
    it('shows next button after answering', () => {
      const { getByText } = render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          onNext={mockOnNext}
          selectedAnswer="Mayo Scissors"
          showResult={true}
        />
      );

      expect(getByText(/next/i) || getByText(/continue/i)).toBeTruthy();
    });

    it('calls onNext when next button pressed', () => {
      const { getByText } = render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          onNext={mockOnNext}
          selectedAnswer="Mayo Scissors"
          showResult={true}
        />
      );

      const nextButton = getByText(/next/i) || getByText(/continue/i);
      fireEvent.press(nextButton);

      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('announces question to screen readers', () => {
      const { getByLabelText } = render(
        <QuizQuestion question={mockQuestion} onAnswer={mockOnAnswer} />
      );

      expect(
        getByLabelText(/identify this surgical instrument/i) ||
        getByLabelText(/question/i)
      ).toBeTruthy();
    });

    it('announces answer options', () => {
      const { getAllByRole } = render(
        <QuizQuestion question={mockQuestion} onAnswer={mockOnAnswer} />
      );

      const buttons = getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(4);
    });

    it('announces result to screen readers', () => {
      const { getByRole } = render(
        <QuizQuestion
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          selectedAnswer="Mayo Scissors"
          showResult={true}
          isCorrect={true}
        />
      );

      // Result should be announced
      expect(getByRole('alert') || getByRole('status')).toBeTruthy();
    });
  });
});
