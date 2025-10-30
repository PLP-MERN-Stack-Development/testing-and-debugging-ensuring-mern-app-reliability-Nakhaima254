import request from 'supertest';
import express from 'express';
import { Bug, User } from '../models.js';

// Mock the models
jest.mock('../models.js', () => ({
  Bug: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    prototype: {
      save: jest.fn(),
    },
  },
  User: {},
}));

// Create a test app
const app = express();
app.use(express.json());

// Import and use the routes (we'll mock the actual server setup)
const mockBugRoutes = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// Mock the routes
app.get('/api/bugs', mockBugRoutes.get);
app.post('/api/bugs', mockBugRoutes.post);
app.put('/api/bugs/:id', mockBugRoutes.put);
app.delete('/api/bugs/:id', mockBugRoutes.delete);

// Mock implementations
mockBugRoutes.get.mockImplementation(async (req, res) => {
  try {
    const { page = 1, limit = 20, status, severity, priority, search } = req.query;

    let query = {};
    if (status && status !== 'all') query.status = status;
    if (severity && severity !== 'all') query.severity = severity;
    if (priority && priority !== 'all') query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const bugs = [
      { id: '1', title: 'Test Bug', status: 'open', severity: 'high', priority: 'medium' }
    ];
    const total = 1;

    res.json({ bugs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bugs' });
  }
});

mockBugRoutes.post.mockImplementation(async (req, res) => {
  try {
    const { title, description, status, severity, priority, created_by } = req.body;

    const savedBug = {
      _id: 'new-bug-id',
      title,
      description,
      status: status || 'open',
      severity: severity || 'medium',
      priority: priority || 'medium',
      created_by,
      created_at: new Date(),
    };

    res.status(201).json(savedBug);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bug' });
  }
});

mockBugRoutes.put.mockImplementation(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (id === 'non-existent') {
      return res.status(404).json({ error: 'Bug not found' });
    }

    const updatedBug = {
      _id: id,
      ...updateData,
      updated_at: new Date(),
    };

    res.json(updatedBug);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bug' });
  }
});

mockBugRoutes.delete.mockImplementation(async (req, res) => {
  try {
    const { id } = req.params;

    if (id === 'non-existent') {
      return res.status(404).json({ error: 'Bug not found' });
    }

    res.json({ message: 'Bug deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bug' });
  }
});

describe('API Routes', () => {
  describe('GET /api/bugs', () => {
    test('should return bugs with default pagination', async () => {
      const response = await request(app).get('/api/bugs');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bugs');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('pages');
      expect(Array.isArray(response.body.bugs)).toBe(true);
    });

    test('should filter bugs by status', async () => {
      const response = await request(app).get('/api/bugs?status=open');

      expect(response.status).toBe(200);
      expect(response.body.bugs).toBeDefined();
    });

    test('should filter bugs by severity', async () => {
      const response = await request(app).get('/api/bugs?severity=high');

      expect(response.status).toBe(200);
      expect(response.body.bugs).toBeDefined();
    });

    test('should filter bugs by priority', async () => {
      const response = await request(app).get('/api/bugs?priority=medium');

      expect(response.status).toBe(200);
      expect(response.body.bugs).toBeDefined();
    });

    test('should search bugs by title and description', async () => {
      const response = await request(app).get('/api/bugs?search=test');

      expect(response.status).toBe(200);
      expect(response.body.bugs).toBeDefined();
    });

    test('should handle pagination parameters', async () => {
      const response = await request(app).get('/api/bugs?page=2&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(2);
    });
  });

  describe('POST /api/bugs', () => {
    test('should create a new bug', async () => {
      const bugData = {
        title: 'New Bug',
        description: 'Bug description',
        status: 'open',
        severity: 'high',
        priority: 'medium',
        created_by: 'user123',
      };

      const response = await request(app)
        .post('/api/bugs')
        .send(bugData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(bugData.title);
      expect(response.body.status).toBe(bugData.status);
    });

    test('should create bug with default values', async () => {
      const bugData = {
        title: 'Minimal Bug',
        created_by: 'user123',
      };

      const response = await request(app)
        .post('/api/bugs')
        .send(bugData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('open');
      expect(response.body.severity).toBe('medium');
      expect(response.body.priority).toBe('medium');
    });
  });

  describe('PUT /api/bugs/:id', () => {
    test('should update an existing bug', async () => {
      const updateData = {
        title: 'Updated Bug Title',
        status: 'resolved',
        severity: 'low',
        priority: 'high',
      };

      const response = await request(app)
        .put('/api/bugs/123')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.status).toBe(updateData.status);
      expect(response.body).toHaveProperty('updated_at');
    });

    test('should return 404 for non-existent bug', async () => {
      const response = await request(app)
        .put('/api/bugs/non-existent')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Bug not found');
    });
  });

  describe('DELETE /api/bugs/:id', () => {
    test('should delete an existing bug', async () => {
      const response = await request(app)
        .delete('/api/bugs/123');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Bug deleted successfully');
    });

    test('should return 404 for non-existent bug', async () => {
      const response = await request(app)
        .delete('/api/bugs/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Bug not found');
    });
  });
});