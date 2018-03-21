import config from '../config';


const LOG_LEVELS = {
    none: 0,
    error: 1,
    warning: 2,
    info: 3
};


export default {

    log(message: string, data?: any) {
        if (LOG_LEVELS[config.getLogLevel()] >= LOG_LEVELS.info) {
            console.log(message, data);
        }
    },

    warn(message: string, data?: any) {
        if (LOG_LEVELS[config.getLogLevel()] >= LOG_LEVELS.warning) {
            console.warn(message, data);
        }
    },

    error(message: string, data?: any) {
        if (LOG_LEVELS[config.getLogLevel()] >= LOG_LEVELS.error) {
            console.error(message, data);
        }
    }

};
