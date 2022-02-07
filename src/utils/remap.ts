import { IHash } from "../interfaces";
import base58 from "../libs/base58";
import converters from "../libs/converters";

function castFromBytesToBase58(bytes, sliceIndex) {
	bytes = Uint8Array.from(Array.prototype.slice.call(bytes, sliceIndex));
	return base58.encode(bytes);
}

function castFromStringToBase58(str: string) {
	return base58.encode(converters.stringToByteArray(str));
}

export function createRemapper(rules) {

	return function (data: IHash<any>): IHash<any> {

		return Object.keys({ ...data, ...rules }).reduce((result, key) => {

			const rule = rules[key];

			if (typeof rule === "function") {
				// Process with a function
				result[key] = rule(data[key]);
			} else if (typeof rule === "string") {
				// Rename a field with the rule name
				result[rule] = data[key];
			} else if (rule && typeof rule === "object") {

				// Transform according to the rule
				if (rule.from === "bytes" && rule.to === "base58") 
					result[key] = castFromBytesToBase58(data[key], rule.slice || 0);
				 else if (rule.from === "string" && rule.to === "base58") 
					result[key] = castFromStringToBase58(data[key]);
				


			} else if (rule !== null) {
				// Leave the data as is (or add some default value from the rule)
				result[key] = data[key] != null ? data[key] : rule;
			}

			return result;

		}, Object.create(null));
	};
}
