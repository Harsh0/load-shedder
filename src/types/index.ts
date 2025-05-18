export interface LoadShedderOptions {
    debug?: boolean;
    maxEventLoopDelayInMs: number;
    maxMemoryUsagePercent: number;
    maxConcurrentRequests: number;
    samplingIntervalInMs: number;
    logger?: (message: string) => void;
}

export type LoadShedder = {
    shouldShedLoad: (getActiveRequests: () => number) => boolean;
};

export const DEFAULT_OPTIONS: Partial<LoadShedderOptions> = {
    /* tslint:disable:no-empty */
    logger: () => {},
};
