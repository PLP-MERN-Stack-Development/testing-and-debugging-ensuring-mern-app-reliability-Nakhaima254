import { setupWorker } from 'msw';
import { handlers } from './handlers';

// Setup MSW worker for browser environment (development)
export const worker = setupWorker(...handlers);