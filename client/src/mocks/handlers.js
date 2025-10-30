import { rest } from 'msw';

// Mock API handlers
export const handlers = [
  // Mock Supabase auth endpoints
  rest.post('https://your-project.supabase.co/auth/v1/signup', (req, res, ctx) => {
    return res(
      ctx.json({
        user: {
          id: 'mock-user-id',
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User' }
        },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600000
        }
      })
    );
  }),

  rest.post('https://your-project.supabase.co/auth/v1/signin', (req, res, ctx) => {
    return res(
      ctx.json({
        user: {
          id: 'mock-user-id',
          email: 'test@example.com'
        },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600000
        }
      })
    );
  }),

  rest.post('https://your-project.supabase.co/auth/v1/signout', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  // Mock bug API endpoints
  rest.get('https://your-project.supabase.co/rest/v1/bugs', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          title: 'Mock Bug 1',
          description: 'This is a mock bug',
          severity: 'high',
          status: 'open',
          priority: 'medium',
          created_by: 'mock-user-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
    );
  }),

  rest.post('https://your-project.supabase.co/rest/v1/bugs', (req, res, ctx) => {
    return res(
      ctx.json({
        id: '2',
        title: 'New Mock Bug',
        description: 'Created via API',
        severity: 'medium',
        status: 'open',
        priority: 'low',
        created_by: 'mock-user-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    );
  }),

  rest.patch('https://your-project.supabase.co/rest/v1/bugs/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.json({
        id,
        title: 'Updated Mock Bug',
        description: 'Updated via API',
        severity: 'critical',
        status: 'in-progress',
        priority: 'high',
        created_by: 'mock-user-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    );
  }),

  rest.delete('https://your-project.supabase.co/rest/v1/bugs/:id', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  // Mock user profile endpoints
  rest.get('https://your-project.supabase.co/rest/v1/profiles', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 'mock-user-id',
          email: 'test@example.com',
          full_name: 'Test User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
    );
  }),

  rest.patch('https://your-project.supabase.co/rest/v1/profiles', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 'mock-user-id',
        email: 'test@example.com',
        full_name: 'Updated Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    );
  })
];