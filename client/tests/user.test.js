import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  mockNavigate.mockClear();
});

// Test component to access context
const TestComponent = () => {
  const { user, signIn, signOut, loading } = useAuth();

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {user ? (
            <div>
              <span data-testid="user-email">{user.email}</span>
              <button onClick={signOut}>Sign Out</button>
            </div>
          ) : (
            <div>
              <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  test('completes loading and shows sign in button', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for loading to complete (useEffect runs and sets loading to false)
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  test('loads user from localStorage on mount', async () => {
    const mockUser = { id: 'mock-user', email: 'test@example.com' };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  test('signs in user successfully', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const signInButton = screen.getByText('Sign In');
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    }, { timeout: 2000 });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'mockUser',
      JSON.stringify({ id: 'mock-user', email: 'test@example.com' })
    );
  });

  test('signs out user successfully', async () => {
    const mockUser = { id: 'mock-user', email: 'test@example.com' };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('mockUser');
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });
});