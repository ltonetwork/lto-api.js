import {IHash, ILTOConfig} from "./interfaces";
import {DEFAULT_BASIC_CONFIG} from "./constants";

const config: ILTOConfig = Object.create(null);

export default {

	getNetworkByte(): number {
		return config.networkByte;
	},

	getMinimumSeedLength(): number {
		return config.minimumSeedLength;
	},

	getLogLevel() {
		return config.logLevel;
	},

	getNodeAddress(): string {
		return config.nodeAddress;
	},

	getRequestParams(): IHash<any> {
		return {
			offset: config.requestOffset,
			limit: config.requestLimit
		};
	},

	getTimeDiff() {
		return config.timeDiff;
	},

	get() {
		return {...config};
	},

	set(newConfig: Partial<ILTOConfig>) {

		// Extend incoming objects only when `config` is empty
		if (Object.keys(config).length === 0) 
			newConfig = {...DEFAULT_BASIC_CONFIG, ...newConfig};
		

		Object.keys(newConfig).forEach((key) => {
			config[key] = newConfig[key];

		});

	},

	clear() {
		Object.keys(config).forEach((key) => {
			delete config[key];
		});
	}

};
