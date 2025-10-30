import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BugForm } from '../src/components/BugForm';

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(),
}));

// Mock @hookform/resolvers/zod
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => (data) => ({ values: data, errors: {} })),
}));

// Mock zod
jest.mock('zod', () => ({
  z: {
    object: jest.fn(() => ({
      min: jest.fn(() => ({
        max: jest.fn(() => ({
          optional: jest.fn(() => ({
            enum: jest.fn(() => ({})),
          })),
        })),
      })),
    })),
    enum: jest.fn(() => ({})),
  },
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon">Loader2</div>,
}));

// Mock UI components
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
  Input: ({ id, placeholder, disabled, ...props }) => (
    <input
      id={id}
      placeholder={placeholder}
      disabled={disabled}
      data-testid="input"
      {...props}
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
  Label: ({ children, htmlFor }) => (
    <label htmlFor={htmlFor} data-testid="label">
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
  SelectTrigger: ({ children }) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: () => <span data-testid="select-value" />,
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

describe('BugForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  const mockUseForm = {
    register: jest.fn(),
    handleSubmit: jest.fn((fn) => (e) => {
      e.preventDefault();
      fn({
        title: 'Test Bug',
        description: 'Test description',
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-hook-form').useForm.mockReturnValue(mockUseForm);
  });

  test('renders create form when not editing', () => {
    render(
      <BugForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isEditing={false}
      />
    );

    expect(screen.getByText('Create New Bug')).toBeInTheDocument();
    expect(screen.getByText('Create Bug')).toBeInTheDocument();
  });

  test('renders edit form when editing', () => {
    const initialData = {
      title: 'Existing Bug',
      description: 'Existing description',
      severity: 'high',
      status: 'in-progress',
      priority: 'high',
    };

    render(
      <BugForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        initialData={initialData}
        isEditing={true}
      />
    );

    expect(screen.getByText('Edit Bug')).toBeInTheDocument();
    expect(screen.getByText('Update Bug')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(
      <BugForm
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  test('calls onClose when cancel button is clicked', () => {
    render(
      <BugForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('submits form and calls onSubmit', async () => {
    mockOnSubmit.mockResolvedValue();

    render(
      <BugForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByText('Create Bug');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Bug',
        description: 'Test description',
        severity: 'high',
        status: 'open',
        priority: 'medium',
      });
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('shows loading state during submission', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <BugForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByText('Create Bug');
    fireEvent.click(submitButton);

    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  test('disables form elements when loading', () => {
    // Mock loading state by setting up useForm to return loading: true
    require('react-hook-form').useForm.mockReturnValue({
      ...mockUseForm,
      formState: { ...mockUseForm.formState, isSubmitting: true },
    });

    render(
      <BugForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const inputs = screen.getAllByTestId('input');
    const textareas = screen.getAllByTestId('textarea');
    const selects = screen.getAllByTestId('select');

    inputs.forEach(input => expect(input).toBeDisabled());
    textareas.forEach(textarea => expect(textarea).toBeDisabled());
    selects.forEach(select => expect(select).toHaveAttribute('data-disabled', 'true'));
  });

  test('displays validation errors', () => {
    const errors = {
      title: { message: 'Title is required' },
    };

    require('react-hook-form').useForm.mockReturnValue({
      ...mockUseForm,
      formState: { errors },
    });

    render(
      <BugForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  test('renders all form fields', () => {
    render(
      <BugForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByText('Severity *')).toBeInTheDocument();
    expect(screen.getByText('Status *')).toBeInTheDocument();
    expect(screen.getByText('Priority *')).toBeInTheDocument();
  });

  test('renders select options correctly', () => {
    render(
      <BugForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });
});