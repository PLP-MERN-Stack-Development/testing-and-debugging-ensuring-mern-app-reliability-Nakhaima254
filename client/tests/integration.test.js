import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BugCard } from '../src/components/BugCard';
import { BugForm } from '../src/components/BugForm';
import { FilterBar } from '../src/components/FilterBar';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

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
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 hours ago'),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Bug: () => <div data-testid="bug-icon">Bug</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>,
  CheckCircle2: () => <div data-testid="check-circle-icon">CheckCircle2</div>,
  XCircle: () => <div data-testid="x-circle-icon">XCircle</div>,
  User: () => <div data-testid="user-icon">User</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  Loader2: () => <div data-testid="loader-icon">Loader2</div>,
}));

// Mock UI components
jest.mock('../src/components/ui/card', () => ({
  Card: ({ children, className, style }) => (
    <div data-testid="card" className={className} style={style}>
      {children}
    </div>
  ),
}));

jest.mock('../src/components/ui/badge', () => ({
  Badge: ({ children, variant, className, style }) => (
    <span data-testid="badge" className={className} style={style}>
      {children}
    </span>
  ),
}));

jest.mock('../src/components/ui/button', () => ({
  Button: ({ children, type, disabled, onClick, className, variant }) => (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

jest.mock('../src/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange, className }) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      data-testid="input"
    />
  ),
}));

jest.mock('../src/components/ui/textarea', () => ({
  Textarea: ({ id, placeholder, rows, disabled, ...props }) => (
    <textarea
      id={id}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      data-testid="textarea"
      {...props}
    />
  ),
}));

jest.mock('../src/components/ui/label', () => ({
  Label: ({ children, htmlFor, className }) => (
    <label htmlFor={htmlFor} className={className} data-testid="label">
      {children}
    </label>
  ),
}));

jest.mock('../src/components/ui/select', () => ({
  Select: ({ children, value, onValueChange, disabled }) => (
    <div data-testid="select" data-value={value} data-disabled={disabled}>
      {children}
    </div>
  ),
  SelectContent: ({ children }) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }) => (
    <option value={value} data-testid="select-item">
      {children}
    </option>
  ),
  SelectTrigger: ({ children, id }) => (
    <div data-testid="select-trigger" id={id}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }) => (
    <span data-testid="select-value" data-placeholder={placeholder} />
  ),
}));

jest.mock('../src/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }) => (
    open ? (
      <div data-testid="dialog" data-open={open}>
        {children}
      </div>
    ) : null
  ),
  DialogContent: ({ children, className }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }) => <h2 data-testid="dialog-title">{children}</h2>,
}));

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    register: jest.fn(),
    handleSubmit: jest.fn((fn) => (e) => {
      e.preventDefault();
      fn({
        title: 'Integration Test Bug',
        description: 'Integration test description',
        severity: 'high',
        status: 'open',
        priority: 'medium',
      });
    }),
    formState: { errors: {} },
    setValue: jest.fn(),
    watch: jest.fn((field) => {
      const values = {
        severity: 'medium',
        status: 'open',
        priority: 'medium',
      };
      return values[field];
    }),
    reset: jest.fn(),
  })),
}));

// Mock @hookform/resolvers/zod
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => (data) => ({ values: data, errors: {} })),
}));

// Mock zod properly
jest.mock('zod', () => {
  const mockZ = {
    object: jest.fn(() => mockZ),
    string: jest.fn(() => mockZ),
    min: jest.fn(() => mockZ),
    max: jest.fn(() => mockZ),
    optional: jest.fn(() => mockZ),
    enum: jest.fn(() => mockZ),
  };
  return { z: mockZ };
});

describe('Integration Tests - Full User Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Bug Management Flow', () => {
    test('complete bug creation and display flow', async () => {
      // Mock authenticated user
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        id: 'user-123',
        email: 'test@example.com'
      }));

      const mockOnSubmit = jest.fn().mockResolvedValue();
      const mockOnEdit = jest.fn();
      const mockOnDelete = jest.fn();

      // Render components together
      render(
        <BrowserRouter>
          <AuthProvider>
            <div>
              {/* Bug Form */}
              <BugForm
                isOpen={true}
                onClose={() => {}}
                onSubmit={mockOnSubmit}
                isEditing={false}
              />

              {/* Bug Card (simulating created bug) */}
              <BugCard
                bug={{
                  id: 'bug-123',
                  title: 'Integration Test Bug',
                  description: 'Integration test description',
                  severity: 'high',
                  status: 'open',
                  priority: 'medium',
                  created_at: new Date().toISOString(),
                  assigned_to: null,
                }}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
              />

              {/* Filter Bar */}
              <FilterBar
                status="all"
                severity="all"
                priority="all"
                search=""
                onStatusChange={() => {}}
                onSeverityChange={() => {}}
                onPriorityChange={() => {}}
                onSearchChange={() => {}}
              />
            </div>
          </AuthProvider>
        </BrowserRouter>
      );

      // Wait for auth loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify form is rendered
      expect(screen.getByText('Create New Bug')).toBeInTheDocument();
      expect(screen.getByText('Title *')).toBeInTheDocument();

      // Submit the form
      const submitButton = screen.getAllByText('Create Bug')[0];
      fireEvent.click(submitButton);

      // Verify form submission was called
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Integration Test Bug',
          description: 'Integration test description',
          severity: 'high',
          status: 'open',
          priority: 'medium',
        });
      });

      // Verify bug card is displayed
      expect(screen.getByText('Integration Test Bug')).toBeInTheDocument();
      expect(screen.getAllByText('High')[0]).toBeInTheDocument();
      expect(screen.getByText('open')).toBeInTheDocument();

      // Verify filter bar is rendered
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Severity')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
    });

    test('bug editing flow', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        id: 'user-123',
        email: 'test@example.com'
      }));

      const mockOnSubmit = jest.fn().mockResolvedValue();
      const mockOnEdit = jest.fn();

      const existingBug = {
        id: 'bug-123',
        title: 'Original Bug Title',
        description: 'Original description',
        severity: 'medium',
        status: 'open',
        priority: 'low',
        created_at: new Date().toISOString(),
      };

      render(
        <BrowserRouter>
          <AuthProvider>
            <div>
              <BugForm
                isOpen={true}
                onClose={() => {}}
                onSubmit={mockOnSubmit}
                initialData={existingBug}
                isEditing={true}
              />
              <BugCard
                bug={existingBug}
                onEdit={mockOnEdit}
                onDelete={() => {}}
              />
            </div>
          </AuthProvider>
        </BrowserRouter>
      );

      // Wait for auth loading
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify edit form
      expect(screen.getByText('Edit Bug')).toBeInTheDocument();
      expect(screen.getByText('Update Bug')).toBeInTheDocument();

      // Verify existing bug data is displayed
      expect(screen.getByText('Original Bug Title')).toBeInTheDocument();

      // Submit edit
      const submitButton = screen.getAllByText('Update Bug')[0];
      fireEvent.click(submitButton);

      // Verify edit submission
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    test('filtering and searching integration', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        id: 'user-123',
        email: 'test@example.com'
      }));

      const mockOnSearchChange = jest.fn();
      const mockOnStatusChange = jest.fn();

      render(
        <BrowserRouter>
          <AuthProvider>
            <FilterBar
              status="open"
              severity="all"
              priority="all"
              search="test search"
              onStatusChange={mockOnStatusChange}
              onSeverityChange={() => {}}
              onPriorityChange={() => {}}
              onSearchChange={mockOnSearchChange}
            />
          </AuthProvider>
        </BrowserRouter>
      );

      // Wait for auth loading
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify search input has value
      const searchInput = screen.getByTestId('input');
      expect(searchInput).toHaveValue('test search');

      // Change search
      fireEvent.change(searchInput, { target: { value: 'new search' } });
      expect(mockOnSearchChange).toHaveBeenCalledWith('new search');

      // Verify status filter shows current value
      const statusSelect = screen.getAllByTestId('select')[0];
      expect(statusSelect).toHaveAttribute('data-value', 'open');
    });
  });

  describe('Authentication Flow Integration', () => {
    test('protected content access flow', async () => {
      // Start with no user
      localStorageMock.getItem.mockReturnValue(null);

      const TestProtectedContent = () => {
        const { user, signIn } = useAuth();
        return (
          <div>
            {user ? (
              <div data-testid="protected-content">Welcome {user.email}!</div>
            ) : (
              <button onClick={() => signIn('test@example.com', 'password')} data-testid="signin-btn">
                Sign In
              </button>
            )}
          </div>
        );
      };

      render(
        <BrowserRouter>
          <AuthProvider>
            <TestProtectedContent />
          </AuthProvider>
        </BrowserRouter>
      );

      // Initially no user
      expect(screen.getByTestId('signin-btn')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();

      // Sign in
      const signInButton = screen.getByTestId('signin-btn');
      fireEvent.click(signInButton);

      // Verify user is signed in and content is shown
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      }, { timeout: 2000 });
      expect(screen.getByText('Welcome test@example.com!')).toBeInTheDocument();

      // Verify localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'mockUser',
        JSON.stringify({ id: 'mock-user', email: 'test@example.com' })
      );
    });
  });
});