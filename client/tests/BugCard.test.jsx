import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BugCard } from '../src/components/BugCard';

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
  Button: ({ children, variant, size, onClick, className }) => (
    <button
      data-testid="button"
      className={className}
      onClick={onClick}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

const mockBug = {
  id: '1',
  title: 'Test Bug Title',
  description: 'This is a test bug description',
  severity: 'high',
  status: 'open',
  priority: 'high',
  created_at: '2023-01-01T00:00:00Z',
  assigned_to: 'user@example.com',
};

describe('BugCard', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  test('renders bug card with all information', () => {
    render(<BugCard bug={mockBug} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText('Test Bug Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test bug description')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('open')).toBeInTheDocument();
    expect(screen.getByText('Priority: high')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('Assigned')).toBeInTheDocument();
  });

  test('renders without description', () => {
    const bugWithoutDesc = { ...mockBug, description: null };
    render(<BugCard bug={bugWithoutDesc} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText('Test Bug Title')).toBeInTheDocument();
    expect(screen.queryByText('This is a test bug description')).not.toBeInTheDocument();
  });

  test('renders without assigned user', () => {
    const bugWithoutAssignee = { ...mockBug, assigned_to: null };
    render(<BugCard bug={bugWithoutAssignee} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText('Test Bug Title')).toBeInTheDocument();
    expect(screen.queryByText('Assigned')).not.toBeInTheDocument();
  });

  test('displays correct status icons', () => {
    const { rerender } = render(<BugCard bug={mockBug} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();

    rerender(<BugCard bug={{ ...mockBug, status: 'in-progress' }} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();

    rerender(<BugCard bug={{ ...mockBug, status: 'resolved' }} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();

    rerender(<BugCard bug={{ ...mockBug, status: 'closed' }} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument();
  });

  test('displays correct severity colors', () => {
    const { rerender } = render(<BugCard bug={mockBug} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    const card = screen.getByTestId('card');
    expect(card).toHaveStyle({ borderLeftColor: 'hsl(var(--severity-high))' });

    rerender(<BugCard bug={{ ...mockBug, severity: 'critical' }} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(card).toHaveStyle({ borderLeftColor: 'hsl(var(--severity-critical))' });
  });

  test('calls onEdit when edit button is clicked', () => {
    render(<BugCard bug={mockBug} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith('1');
  });

  test('calls onDelete when delete button is clicked', () => {
    render(<BugCard bug={mockBug} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  test('renders with correct CSS classes', () => {
    render(<BugCard bug={mockBug} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('p-6 hover:shadow-lg transition-all duration-200 border-l-4 animate-fade-in');
  });

  test('renders severity badge with correct styling', () => {
    render(<BugCard bug={mockBug} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const severityBadge = screen.getByText('High');
    expect(severityBadge).toHaveStyle({
      borderColor: 'hsl(var(--severity-high))',
      color: 'hsl(var(--severity-high))'
    });
  });
});