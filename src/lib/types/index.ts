export interface LoadShedderOptions {
    debug?: boolean;
    maxEventLoopDelayInMs: number;
    maxMemoryUsagePercent: number;
    maxConcurrentRequests: number;
    samplingIntervalInMs: number;
    logger?: (message: string) => void;
}

export const DEFAULT_OPTIONS: Partial<LoadShedderOptions> = {
    /* tslint:disable:no-empty */
    logger: () => {},
};
