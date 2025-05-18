import { monitorEventLoopDelay } from 'perf_hooks';
import type { LoadShedder, LoadShedderOptions } from './types';

export const getLoadShedder = (options: LoadShedderOptions): LoadShedder => {
    const { debug, maxConcurrentRequests, maxMemoryUsagePercent, maxEventLoopDelayInMs, logger } =
        options;
    const maxMemoryUsage = maxMemoryUsagePercent / 100;
    const h = monitorEventLoopDelay({ resolution: 10 });
    h.enable();
    return {
        shouldShedLoad: (getActiveRequests: () => number): boolean => {
            const memoryUsage = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal;
            const eventLoopLag = h.mean / 1e6; // nanoseconds to ms
            const activeRequests = getActiveRequests();
            if (debug) {
                logger!(`Memory Usage: ${memoryUsage * 100}%`);
                logger!(`Max Memory Usage: ${maxMemoryUsage * 100}%`);
                logger!(`Event Loop Lag: ${eventLoopLag}ms`);
                logger!(`Max Event Loop Delay: ${maxEventLoopDelayInMs}ms`);
                logger!(`Active Requests: ${activeRequests}`);
                logger!(`Max Concurrent Requests: ${maxConcurrentRequests}`);
            }
            return (
                activeRequests >= maxConcurrentRequests ||
                memoryUsage >= maxMemoryUsage ||
                eventLoopLag >= maxEventLoopDelayInMs
            );
        },
    };
};
