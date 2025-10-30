import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/AuthContext';
import { BugCard } from '../src/components/BugCard';
import { FilterBar } from '../src/components/FilterBar';

// Mock performance API
const mockPerformance = {
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock date-fns for consistent timing
jest.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 hours ago',
}));

describe('Component Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('BugCard renders within performance budget', () => {
    const startTime = performance.now();

    const mockBug = {
      id: '1',
      title: 'Performance Test Bug',
      description: 'Testing component performance',
      severity: 'high',
      status: 'open',
      priority: 'medium',
      created_by: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    render(
      <BrowserRouter>
        <AuthProvider>
          <BugCard bug={mockBug} />
        </AuthProvider>
      </BrowserRouter>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Assert that rendering takes less than 100ms
    expect(renderTime).toBeLessThan(100);

    // Verify the component rendered correctly
    expect(screen.getByText('Performance Test Bug')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  test('FilterBar renders within performance budget', () => {
    const startTime = performance.now();

    const mockProps = {
      searchQuery: '',
      onSearchChange: jest.fn(),
      statusFilter: 'all',
      onStatusFilterChange: jest.fn(),
      severityFilter: 'all',
      onSeverityFilterChange: jest.fn(),
      priorityFilter: 'all',
      onPriorityFilterChange: jest.fn(),
    };

    render(<FilterBar {...mockProps} />);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Assert that rendering takes less than 50ms
    expect(renderTime).toBeLessThan(50);

    // Verify the component rendered correctly
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
  });

  test('AuthProvider context initialization performance', async () => {
    const startTime = performance.now();

    render(
      <BrowserRouter>
        <AuthProvider>
          <div>Test Content</div>
        </AuthProvider>
      </BrowserRouter>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Assert that context initialization takes less than 200ms
    expect(renderTime).toBeLessThan(200);

    // Verify the content is rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('measures component re-render performance', () => {
    const mockBug = {
      id: '1',
      title: 'Initial Bug',
      description: 'Initial description',
      severity: 'medium',
      status: 'open',
      priority: 'low',
      created_by: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { rerender } = render(
      <BrowserRouter>
        <AuthProvider>
          <BugCard bug={mockBug} />
        </AuthProvider>
      </BrowserRouter>
    );

    const startTime = performance.now();

    // Update the bug data to trigger re-render
    const updatedBug = {
      ...mockBug,
      title: 'Updated Bug Title',
      status: 'in-progress',
    };

    rerender(
      <BrowserRouter>
        <AuthProvider>
          <BugCard bug={updatedBug} />
        </AuthProvider>
      </BrowserRouter>
    );

    const endTime = performance.now();
    const reRenderTime = endTime - startTime;

    // Assert that re-rendering takes less than 50ms
    expect(reRenderTime).toBeLessThan(50);

    // Verify the update was applied
    expect(screen.getByText('Updated Bug Title')).toBeInTheDocument();
    expect(screen.getByText('in-progress')).toBeInTheDocument();
  });

  test('memory leak prevention - component cleanup', () => {
    const mockBug = {
      id: '1',
      title: 'Memory Test Bug',
      description: 'Testing memory management',
      severity: 'low',
      status: 'open',
      priority: 'low',
      created_by: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { unmount } = render(
      <BrowserRouter>
        <AuthProvider>
          <BugCard bug={mockBug} />
        </AuthProvider>
      </BrowserRouter>
    );

    // Component should unmount without errors
    expect(() => unmount()).not.toThrow();

    // Verify component is no longer in the document
    expect(screen.queryByText('Memory Test Bug')).not.toBeInTheDocument();
  });

  test('large list rendering performance', () => {
    const mockBugs = Array.from({ length: 100 }, (_, index) => ({
      id: `bug-${index}`,
      title: `Bug ${index}`,
      description: `Description for bug ${index}`,
      severity: index % 4 === 0 ? 'critical' : index % 3 === 0 ? 'high' : index % 2 === 0 ? 'medium' : 'low',
      status: index % 5 === 0 ? 'closed' : index % 4 === 0 ? 'resolved' : index % 3 === 0 ? 'in-progress' : 'open',
      priority: index % 3 === 0 ? 'high' : index % 2 === 0 ? 'medium' : 'low',
      created_by: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const startTime = performance.now();

    render(
      <BrowserRouter>
        <AuthProvider>
          <div>
            {mockBugs.map((bug) => (
              <BugCard key={bug.id} bug={bug} />
            ))}
          </div>
        </AuthProvider>
      </BrowserRouter>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Assert that rendering 100 components takes less than 1000ms
    expect(renderTime).toBeLessThan(1000);

    // Verify some components are rendered
    expect(screen.getByText('Bug 0')).toBeInTheDocument();
    expect(screen.getByText('Bug 99')).toBeInTheDocument();
  });
});