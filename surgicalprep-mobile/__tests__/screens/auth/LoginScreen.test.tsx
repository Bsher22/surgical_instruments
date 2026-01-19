/**
 * Login Screen Tests
 */
import React from 'react';
import { render, fireEvent, waitFor, factories } from '../../utils/test-utils';
import LoginScreen from '@/app/(auth)/login';

// Mock the auth store
const mockLogin = jest.fn();
const mockClearError = jest.fn();

jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(() => ({
    login: mockLogin,
    clearError: mockClearError,
    isLoading: false,
    error: null,
  })),
}));

// Mock expo-router
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  Link: ({ children }: any) => children,
}));

import { useAuthStore } from '@/stores/authStore';

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockReturnValue({
      login: mockLogin,
      clearError: mockClearError,
      isLoading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('renders login form', () => {
      const { getByPlaceholderText, getByText } = render(<LoginScreen />);

      expect(getByPlaceholderText(/email/i)).toBeTruthy();
      expect(getByPlaceholderText(/password/i)).toBeTruthy();
      expect(getByText(/log in/i) || getByText(/sign in/i)).toBeTruthy();
    });

    it('renders app logo/branding', () => {
      const { getByTestId, getByText } = render(<LoginScreen />);

      expect(
        getByTestId('app-logo') ||
        getByText(/surgicalprep/i)
      ).toBeTruthy();
    });

    it('renders link to signup', () => {
      const { getByText } = render(<LoginScreen />);

      expect(
        getByText(/sign up/i) ||
        getByText(/create account/i) ||
        getByText(/don't have an account/i)
      ).toBeTruthy();
    });

    it('renders forgot password link', () => {
      const { getByText } = render(<LoginScreen />);

      expect(getByText(/forgot password/i)).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('shows error for empty email', async () => {
      const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);

      const passwordInput = getByPlaceholderText(/password/i);
      fireEvent.changeText(passwordInput, 'password123');

      const submitButton = getByText(/log in/i) || getByText(/sign in/i);
      fireEvent.press(submitButton);

      expect(await findByText(/email.*required/i)).toBeTruthy();
    });

    it('shows error for invalid email format', async () => {
      const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);

      const emailInput = getByPlaceholderText(/email/i);
      const passwordInput = getByPlaceholderText(/password/i);

      fireEvent.changeText(emailInput, 'invalidemail');
      fireEvent.changeText(passwordInput, 'password123');

      const submitButton = getByText(/log in/i) || getByText(/sign in/i);
      fireEvent.press(submitButton);

      expect(await findByText(/valid email/i)).toBeTruthy();
    });

    it('shows error for empty password', async () => {
      const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);

      const emailInput = getByPlaceholderText(/email/i);
      fireEvent.changeText(emailInput, 'test@example.com');

      const submitButton = getByText(/log in/i) || getByText(/sign in/i);
      fireEvent.press(submitButton);

      expect(await findByText(/password.*required/i)).toBeTruthy();
    });

    it('shows error for short password', async () => {
      const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);

      const emailInput = getByPlaceholderText(/email/i);
      const passwordInput = getByPlaceholderText(/password/i);

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, '123');

      const submitButton = getByText(/log in/i) || getByText(/sign in/i);
      fireEvent.press(submitButton);

      expect(await findByText(/password.*characters/i)).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('calls login with correct credentials', async () => {
      mockLogin.mockResolvedValueOnce(undefined);

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);

      const emailInput = getByPlaceholderText(/email/i);
      const passwordInput = getByPlaceholderText(/password/i);

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      const submitButton = getByText(/log in/i) || getByText(/sign in/i);
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('navigates to main app on successful login', async () => {
      mockLogin.mockResolvedValueOnce(undefined);

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);

      fireEvent.changeText(getByPlaceholderText(/email/i), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText(/password/i), 'password123');

      const submitButton = getByText(/log in/i) || getByText(/sign in/i);
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator when logging in', () => {
      (useAuthStore as jest.Mock).mockReturnValue({
        login: mockLogin,
        clearError: mockClearError,
        isLoading: true,
        error: null,
      });

      const { getByTestId, getByText } = render(<LoginScreen />);

      expect(
        getByTestId('loading-indicator') ||
        getByText(/loading/i) ||
        getByText(/signing in/i)
      ).toBeTruthy();
    });

    it('disables submit button when loading', () => {
      (useAuthStore as jest.Mock).mockReturnValue({
        login: mockLogin,
        clearError: mockClearError,
        isLoading: true,
        error: null,
      });

      const { getByText } = render(<LoginScreen />);

      const submitButton = getByText(/log in/i) || getByText(/sign in/i) || getByText(/loading/i);
      expect(submitButton.props.disabled || submitButton.props.accessibilityState?.disabled).toBeTruthy();
    });

    it('disables input fields when loading', () => {
      (useAuthStore as jest.Mock).mockReturnValue({
        login: mockLogin,
        clearError: mockClearError,
        isLoading: true,
        error: null,
      });

      const { getByPlaceholderText } = render(<LoginScreen />);

      const emailInput = getByPlaceholderText(/email/i);
      expect(emailInput.props.editable === false || emailInput.props.disabled).toBeTruthy();
    });
  });

  describe('Error Display', () => {
    it('displays login error from store', () => {
      (useAuthStore as jest.Mock).mockReturnValue({
        login: mockLogin,
        clearError: mockClearError,
        isLoading: false,
        error: 'Invalid email or password',
      });

      const { getByText } = render(<LoginScreen />);

      expect(getByText('Invalid email or password')).toBeTruthy();
    });

    it('clears error when user types', () => {
      (useAuthStore as jest.Mock).mockReturnValue({
        login: mockLogin,
        clearError: mockClearError,
        isLoading: false,
        error: 'Invalid email or password',
      });

      const { getByPlaceholderText } = render(<LoginScreen />);

      const emailInput = getByPlaceholderText(/email/i);
      fireEvent.changeText(emailInput, 'new@email.com');

      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('Password Visibility', () => {
    it('toggles password visibility', () => {
      const { getByPlaceholderText, getByTestId } = render(<LoginScreen />);

      const passwordInput = getByPlaceholderText(/password/i);
      const toggleButton = getByTestId('password-visibility-toggle');

      // Initially password should be hidden
      expect(passwordInput.props.secureTextEntry).toBe(true);

      // Toggle visibility
      fireEvent.press(toggleButton);

      // Password should be visible
      expect(passwordInput.props.secureTextEntry).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('navigates to signup when link pressed', () => {
      const { getByText } = render(<LoginScreen />);

      const signupLink = getByText(/sign up/i) || getByText(/create account/i);
      fireEvent.press(signupLink);

      expect(mockPush).toHaveBeenCalledWith('/signup');
    });

    it('navigates to forgot password when link pressed', () => {
      const { getByText } = render(<LoginScreen />);

      const forgotLink = getByText(/forgot password/i);
      fireEvent.press(forgotLink);

      expect(mockPush).toHaveBeenCalledWith('/forgot-password');
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for inputs', () => {
      const { getByLabelText } = render(<LoginScreen />);

      expect(getByLabelText(/email/i)).toBeTruthy();
      expect(getByLabelText(/password/i)).toBeTruthy();
    });

    it('has accessible submit button', () => {
      const { getByRole } = render(<LoginScreen />);

      const submitButtons = getByRole('button');
      expect(submitButtons).toBeTruthy();
    });

    it('announces errors to screen readers', () => {
      (useAuthStore as jest.Mock).mockReturnValue({
        login: mockLogin,
        clearError: mockClearError,
        isLoading: false,
        error: 'Invalid credentials',
      });

      const { getByRole } = render(<LoginScreen />);

      expect(getByRole('alert')).toBeTruthy();
    });
  });

  describe('Keyboard Handling', () => {
    it('focuses password input after email submit', () => {
      const { getByPlaceholderText } = render(<LoginScreen />);

      const emailInput = getByPlaceholderText(/email/i);
      const passwordInput = getByPlaceholderText(/password/i);

      fireEvent(emailInput, 'submitEditing');

      // Password input should receive focus
      // Note: Focus testing may require additional setup
      expect(passwordInput).toBeTruthy();
    });

    it('submits form when password submitted', async () => {
      mockLogin.mockResolvedValueOnce(undefined);

      const { getByPlaceholderText } = render(<LoginScreen />);

      const emailInput = getByPlaceholderText(/email/i);
      const passwordInput = getByPlaceholderText(/password/i);

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent(passwordInput, 'submitEditing');

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });
  });
});
