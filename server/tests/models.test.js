import mongoose from 'mongoose';
import { Bug, User } from '../models.js';

// Mock mongoose
jest.mock('mongoose', () => ({
  Schema: jest.fn().mockImplementation((definition) => ({
    pre: jest.fn(),
    methods: {},
    statics: {},
    definition,
  })),
  model: jest.fn(),
  connect: jest.fn().mockResolvedValue(),
  connection: {
    readyState: 1,
  },
}));

describe('Models', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Bug Model', () => {
    test('should create Bug model with correct schema', () => {
      // Import to trigger model creation
      require('../models.js');

      expect(mongoose.Schema).toHaveBeenCalledWith(
        expect.objectContaining({
          title: { type: String, required: true },
          description: String,
          status: {
            type: String,
            enum: ['open', 'in-progress', 'resolved', 'closed'],
            default: 'open'
          },
          priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium'
          },
          severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium'
          },
          created_by: { type: String, required: true },
          assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          created_at: { type: Date, default: Date.now },
          updated_at: { type: Date, default: Date.now }
        })
      );

      expect(mongoose.model).toHaveBeenCalledWith('Bug', expect.any(Object));
    });

    test('should have required fields', () => {
      const schemaCall = mongoose.Schema.mock.calls[0][0];

      expect(schemaCall.title.required).toBe(true);
      expect(schemaCall.created_by.required).toBe(true);
    });

    test('should have correct enum values for status', () => {
      const schemaCall = mongoose.Schema.mock.calls[0][0];

      expect(schemaCall.status.enum).toEqual(['open', 'in-progress', 'resolved', 'closed']);
      expect(schemaCall.status.default).toBe('open');
    });

    test('should have correct enum values for priority', () => {
      const schemaCall = mongoose.Schema.mock.calls[0][0];

      expect(schemaCall.priority.enum).toEqual(['low', 'medium', 'high', 'critical']);
      expect(schemaCall.priority.default).toBe('medium');
    });

    test('should have correct enum values for severity', () => {
      const schemaCall = mongoose.Schema.mock.calls[0][0];

      expect(schemaCall.severity.enum).toEqual(['low', 'medium', 'high', 'critical']);
      expect(schemaCall.severity.default).toBe('medium');
    });

    test('should have reference to User model', () => {
      const schemaCall = mongoose.Schema.mock.calls[0][0];

      expect(schemaCall.assigned_to.type).toBe(mongoose.Schema.Types.ObjectId);
      expect(schemaCall.assigned_to.ref).toBe('User');
    });

    test('should have timestamps', () => {
      const schemaCall = mongoose.Schema.mock.calls[0][0];

      expect(schemaCall.created_at.type).toBe(Date);
      expect(schemaCall.created_at.default).toBe(Date.now);
      expect(schemaCall.updated_at.type).toBe(Date);
      expect(schemaCall.updated_at.default).toBe(Date.now);
    });
  });

  describe('User Model', () => {
    test('should create User model with correct schema', () => {
      // Import to trigger model creation
      require('../models.js');

      // User schema should be the second call to Schema
      const userSchemaCall = mongoose.Schema.mock.calls[1][0];

      expect(userSchemaCall).toEqual(
        expect.objectContaining({
          email: { type: String, required: true, unique: true },
          full_name: String,
          created_at: { type: Date, default: Date.now },
          updated_at: { type: Date, default: Date.now }
        })
      );

      expect(mongoose.model).toHaveBeenCalledWith('User', expect.any(Object));
    });

    test('should have required and unique email field', () => {
      const userSchemaCall = mongoose.Schema.mock.calls[1][0];

      expect(userSchemaCall.email.required).toBe(true);
      expect(userSchemaCall.email.unique).toBe(true);
    });

    test('should have optional full_name field', () => {
      const userSchemaCall = mongoose.Schema.mock.calls[1][0];

      expect(userSchemaCall.full_name).toBe(String);
    });
  });

  describe('MongoDB Connection', () => {
    test('should attempt to connect to MongoDB', () => {
      // Reset modules to trigger connection
      jest.resetModules();

      // Mock console methods
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Import models to trigger connection
      require('../models.js');

      expect(mongoose.connect).toHaveBeenCalledWith(
        expect.stringContaining('mongodb://localhost:27017/bugtracker')
      );

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('should use environment variable for MongoDB URI', () => {
      const originalEnv = process.env.MONGODB_URI;
      process.env.MONGODB_URI = 'mongodb://test:27017/testdb';

      jest.resetModules();
      require('../models.js');

      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://test:27017/testdb');

      process.env.MONGODB_URI = originalEnv;
    });

    test('should handle connection success', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mongoose.connect.mockResolvedValue();

      jest.resetModules();
      await require('../models.js');

      expect(consoleSpy).toHaveBeenCalledWith('Connected to MongoDB');

      consoleSpy.mockRestore();
    });

    test('should handle connection error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const testError = new Error('Connection failed');

      mongoose.connect.mockRejectedValue(testError);

      jest.resetModules();
      try {
        await require('../models.js');
      } catch (e) {
        // Expected to fail
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith('MongoDB connection error:', testError);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Model Exports', () => {
    test('should export Bug and User models', () => {
      const models = require('../models.js');

      expect(models.Bug).toBeDefined();
      expect(models.User).toBeDefined();
      expect(models.mongoose).toBe(mongoose);
    });
  });
});