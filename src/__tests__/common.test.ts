import { monitorEventLoopDelay } from 'perf_hooks';
import { getLoadShedder } from '../lib/common';
import type { LoadShedderOptions } from '../lib/types';

jest.mock('perf_hooks', () => ({
    monitorEventLoopDelay: jest.fn(() => ({
        enable: jest.fn(),
        mean: 0,
    })),
}));

describe('getLoadShedder', () => {
    let originalMemoryUsage: any;

    beforeEach(() => {
        originalMemoryUsage = process.memoryUsage;
        process.memoryUsage = jest.fn(() => ({
            heapUsed: 500,
            heapTotal: 1000,
            rss: 1500,
        })) as unknown as typeof process.memoryUsage;
    });

    afterEach(() => {
        process.memoryUsage = originalMemoryUsage;
        jest.clearAllMocks();
    });

    const defaultOptions = {
        debug: false,
        maxConcurrentRequests: 10,
        maxMemoryUsagePercent: 80,
        maxEventLoopDelayInMs: 100,
        samplingIntervalInMs: 1000,
        logger: jest.fn(),
    } as LoadShedderOptions;

    test('should return false when all metrics are below thresholds', () => {
        const loadShedder = getLoadShedder(defaultOptions);
        const result = loadShedder.shouldShedLoad(() => 5);
        expect(result).toBe(false);
    });

    test('should return true when active requests exceed max', () => {
        const loadShedder = getLoadShedder(defaultOptions);
        const result = loadShedder.shouldShedLoad(() => 11);
        expect(result).toBe(true);
    });

    test('should return true when heapUsed is less than heapTotal', () => {
        process.memoryUsage = jest.fn(() => ({
            heapUsed: 900,
            heapTotal: 1000,
            rss: 2000,
        })) as unknown as typeof process.memoryUsage;
        const loadShedder = getLoadShedder(defaultOptions);
        const result = loadShedder.shouldShedLoad(() => 5);
        expect(result).toBe(true);
    });

    test('should return true when event loop lag exceeds max', () => {
        const mockMonitor = {
            enable: jest.fn(),
            mean: 150 * 1e6, // 150ms in nanoseconds
        };
        (monitorEventLoopDelay as jest.Mock).mockReturnValue(mockMonitor);

        const loadShedder = getLoadShedder(defaultOptions);
        const result = loadShedder.shouldShedLoad(() => 5);
        expect(result).toBe(true);
    });

    test('should log debug info when debug is true', () => {
        const logger = jest.fn();
        const loadShedder = getLoadShedder({
            ...defaultOptions,
            debug: true,
            logger,
        });

        loadShedder.shouldShedLoad(() => 5);

        expect(logger).toHaveBeenCalledTimes(6);
        expect(logger).toHaveBeenCalledWith('Memory Usage: 50%');
        expect(logger).toHaveBeenCalledWith('Max Memory Usage: 80%');
    });
});
