import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { Bug, User } from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8085;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/bugs', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, severity, priority, search } = req.query;
    const skip = (page - 1) * limit;

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

    const bugs = await Bug.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Bug.countDocuments(query);

    res.json({ bugs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error fetching bugs:', error);
    res.status(500).json({ error: 'Failed to fetch bugs' });
  }
});

app.post('/api/bugs', async (req, res) => {
  try {
    const { title, description, status, severity, priority, created_by } = req.body;

    const bug = new Bug({
      title,
      description,
      status: status || 'open',
      severity: severity || 'medium',
      priority: priority || 'medium',
      created_by
    });

    const savedBug = await bug.save();

    res.status(201).json(savedBug);
  } catch (error) {
    console.error('Error creating bug:', error);
    res.status(500).json({ error: 'Failed to create bug' });
  }
});

app.put('/api/bugs/:id', async (req, res) => {
  try {
    const { title, description, status, severity, priority } = req.body;

    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        status,
        severity,
        priority,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    res.json(bug);
  } catch (error) {
    console.error('Error updating bug:', error);
    res.status(500).json({ error: 'Failed to update bug' });
  }
});

app.delete('/api/bugs/:id', async (req, res) => {
  try {
    const bug = await Bug.findByIdAndDelete(req.params.id);

    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    res.json({ message: 'Bug deleted successfully' });
  } catch (error) {
    console.error('Error deleting bug:', error);
    res.status(500).json({ error: 'Failed to delete bug' });
  }
});

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle client-side routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});