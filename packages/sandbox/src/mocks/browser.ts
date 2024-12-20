// src/mocks/browser.js
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers.js'
 
export const worker = setupWorker(...handlers)
