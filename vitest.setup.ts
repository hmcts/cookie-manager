import { vi } from 'vitest';

// Ensure global jest object for jest-when compatibility
if (typeof global.jest === 'undefined') {
    global.jest = vi;
}