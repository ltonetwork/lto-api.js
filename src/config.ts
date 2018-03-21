import { IHash, ILTOConfig } from '../interfaces';

const config: ILTOConfig = Object.create(null);

const DEFAULT_BASIC_CONFIG: ILTOConfig = {
  minimumSeedLength: 15,
  logLevel: 'warning'
};

export default {

    getMinimumSeedLength(): number {
        return config.minimumSeedLength;
    },

    getLogLevel() {
        return config.logLevel;
    },

    get() {
        return { ...config };
    },

    set(newConfig: Partial<ILTOConfig>) {

        // Extend incoming objects only when `config` is empty
        if (Object.keys(config).length === 0) {
            newConfig = { ...DEFAULT_BASIC_CONFIG, ...newConfig };
        }

        Object.keys(newConfig).forEach((key) => {
          config[key] = newConfig[key];

        });

    },

    clear() {
        Object.keys(config).forEach((key) => {
            delete config[key];
        });
    }

}
