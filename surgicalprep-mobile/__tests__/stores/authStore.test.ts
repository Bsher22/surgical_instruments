/**
 * Auth Store Tests
 */
import { renderHook, act, waitFor } from '@testing-library/react-hooks';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/stores/authStore';

// Mock expo-secure-store
jest.mock('expo-secure-store');

// Mock the API client
jest.mock('@/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
  setAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
}));

import { apiClient, setAuthToken, clearAuthToken } from '@/api/client';

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  describe('Initial State', () => {
    it('starts with null user', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('starts with no error', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.error).toBeNull();
    });

    it('starts with loading false', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Login', () => {
    it('logs in successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'surgical_tech',
      };

      const mockTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
      };

      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce({ data: mockTokens })
        .mockResolvedValueOnce({ data: mockUser });

      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockUser });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe('test-access-token');
      expect(setAuthToken).toHaveBeenCalledWith('test-access-token');
    });

    it('stores tokens securely after login', async () => {
      const mockTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockTokens });
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: { id: '123', email: 'test@example.com' },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'access_token',
        'test-access-token'
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'refresh_token',
        'test-refresh-token'
      );
    });

    it('sets error on login failure', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce({
        response: { data: { detail: 'Invalid credentials' } },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrongpassword');
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('sets loading state during login', async () => {
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      (apiClient.post as jest.Mock).mockReturnValueOnce(loginPromise);

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login('test@example.com', 'password123');
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveLogin!({ data: { access_token: 'token', refresh_token: 'refresh' } });
      });
    });
  });

  describe('Logout', () => {
    it('clears user and tokens on logout', async () => {
      // Set up authenticated state
      useAuthStore.setState({
        user: { id: '123', email: 'test@example.com' } as any,
        token: 'test-token',
        refreshToken: 'test-refresh',
        isAuthenticated: true,
      });

      (apiClient.post as jest.Mock).mockResolvedValueOnce({});

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('removes tokens from secure storage', async () => {
      useAuthStore.setState({
        user: { id: '123' } as any,
        token: 'test-token',
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.logout();
      });

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refresh_token');
      expect(clearAuthToken).toHaveBeenCalled();
    });
  });

  describe('Register', () => {
    it('registers new user successfully', async () => {
      const mockUser = {
        id: 'new-user-123',
        email: 'new@example.com',
        full_name: 'New User',
        role: 'student',
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockUser });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register({
          email: 'new@example.com',
          password: 'password123',
          full_name: 'New User',
          role: 'student',
        });
      });

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
        email: 'new@example.com',
        password: 'password123',
        full_name: 'New User',
        role: 'student',
      });
    });

    it('handles registration error', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce({
        response: { data: { detail: 'Email already registered' } },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.register({
            email: 'existing@example.com',
            password: 'password123',
            full_name: 'Test',
            role: 'student',
          });
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).toBe('Email already registered');
    });
  });

  describe('Auto Login', () => {
    it('restores session from stored tokens', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('stored-access-token')
        .mockResolvedValueOnce('stored-refresh-token');

      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockUser });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('stays logged out when no stored tokens', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('Token Refresh', () => {
    it('refreshes token when expired', async () => {
      useAuthStore.setState({
        refreshToken: 'old-refresh-token',
        isAuthenticated: true,
      });

      const newTokens = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: newTokens });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.refreshAccessToken();
      });

      expect(result.current.token).toBe('new-access-token');
      expect(setAuthToken).toHaveBeenCalledWith('new-access-token');
    });

    it('logs out when refresh fails', async () => {
      useAuthStore.setState({
        user: { id: '123' } as any,
        refreshToken: 'invalid-refresh-token',
        isAuthenticated: true,
      });

      (apiClient.post as jest.Mock).mockRejectedValueOnce({
        response: { status: 401 },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.refreshAccessToken();
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('Clear Error', () => {
    it('clears error state', () => {
      useAuthStore.setState({ error: 'Some error' });

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Update User', () => {
    it('updates user data', () => {
      const initialUser = {
        id: '123',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'student',
      };

      useAuthStore.setState({ user: initialUser as any });

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.updateUser({ full_name: 'Updated Name' });
      });

      expect(result.current.user?.full_name).toBe('Updated Name');
      expect(result.current.user?.email).toBe('test@example.com');
    });
  });
});
