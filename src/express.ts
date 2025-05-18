import type { Request, RequestHandler } from 'express';
import { getLoadShedder } from './common';
import type { LoadShedderOptions } from './types';
import { DEFAULT_OPTIONS } from './types';

export interface ExpressLoadShedderOptions extends LoadShedderOptions {
    exempt?: (req: Request) => boolean;
    onLoadShed: RequestHandler;
}

let activeRequests = 0;

export const expressLoadShedder = (options: ExpressLoadShedderOptions): RequestHandler => {
    const { debug, logger, exempt, onLoadShed } = { ...DEFAULT_OPTIONS, ...options };
    const loadShedder = getLoadShedder(options);
    return (req, res, next) => {
        if (exempt && exempt(req)) {
            return next();
        }
        if (debug) {
            logger!('Load shedding middleware triggered');
        }
        if (loadShedder.shouldShedLoad(() => activeRequests)) {
            return onLoadShed(req, res, next);
        }
        activeRequests++;
        res.on('finish', () => activeRequests--);
        next();
    };
};
