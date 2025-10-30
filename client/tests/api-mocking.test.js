import { rest } from 'msw';
import { server } from '../src/mocks/server';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/AuthContext';

// Mock component that makes API calls
const ApiTestComponent = () => {
  const handleApiCall = async () => {
    try {
      const response = await fetch('https://your-project.supabase.co/rest/v1/bugs');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      return null;
    }
  };

  return (
    <div>
      <button onClick={handleApiCall} data-testid="api-button">
        Make API Call
      </button>
      <div data-testid="api-result">No data</div>
    </div>
  );
};

describe('API Mocking with MSW', () => {
  test('mocks successful API response', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ApiTestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    // The API call should be mocked and return our mock data
    const response = await fetch('https://your-project.supabase.co/rest/v1/bugs');
    const data = await response.json();

    expect(data).toEqual([
      {
        id: '1',
        title: 'Mock Bug 1',
        description: 'This is a mock bug',
        severity: 'high',
        status: 'open',
        priority: 'medium',
        created_by: 'mock-user-id',
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }
    ]);
  });

  test('handles API error responses', async () => {
    // Override the handler for this specific test
    server.use(
      rest.get('https://your-project.supabase.co/rest/v1/bugs', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Internal server error' }));
      })
    );

    const response = await fetch('https://your-project.supabase.co/rest/v1/bugs');
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });

  test('mocks POST request for creating bugs', async () => {
    const newBug = {
      title: 'New Test Bug',
      description: 'Created in test',
      severity: 'medium',
      status: 'open',
      priority: 'low'
    };

    const response = await fetch('https://your-project.supabase.co/rest/v1/bugs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newBug)
    });

    const data = await response.json();

    expect(data).toEqual({
      id: '2',
      title: 'New Mock Bug',
      description: 'Created via API',
      severity: 'medium',
      status: 'open',
      priority: 'low',
      created_by: 'mock-user-id',
      created_at: expect.any(String),
      updated_at: expect.any(String)
    });
  });

  test('mocks PATCH request for updating bugs', async () => {
    const updateData = {
      status: 'resolved',
      priority: 'high'
    };

    const response = await fetch('https://your-project.supabase.co/rest/v1/bugs/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    expect(data).toEqual({
      id: '1',
      title: 'Updated Mock Bug',
      description: 'Updated via API',
      severity: 'critical',
      status: 'in-progress',
      priority: 'high',
      created_by: 'mock-user-id',
      created_at: expect.any(String),
      updated_at: expect.any(String)
    });
  });

  test('mocks DELETE request for deleting bugs', async () => {
    const response = await fetch('https://your-project.supabase.co/rest/v1/bugs/1', {
      method: 'DELETE'
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({});
  });

  test('handles network errors gracefully', async () => {
    // Mock a network error
    server.use(
      rest.get('https://your-project.supabase.co/rest/v1/bugs', (req, res, ctx) => {
        return res.networkError('Failed to connect');
      })
    );

    try {
      await fetch('https://your-project.supabase.co/rest/v1/bugs');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).toContain('Failed to connect');
    }
  });

  test('mocks auth endpoints', async () => {
    const signupData = {
      email: 'newuser@example.com',
      password: 'password123',
      full_name: 'New User'
    };

    const response = await fetch('https://your-project.supabase.co/auth/v1/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData)
    });

    const data = await response.json();

    expect(data).toEqual({
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      },
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: expect.any(Number)
      }
    });
  });
});