import { NumberPart, StringPart } from "ts-api-validator";
import * as constants from "../constants";
import config from "../config";

function getTimestamp(timestamp?) {
	return (timestamp || Date.now()) + config.getTimeDiff();
}

export default {

	publicKey: {
		type: StringPart,
		required: true
	},

	fee: {
		type: NumberPart,
		required: false,
		defaultValue: constants.MINIMUM_FEE
	},

	recipient: {
		type: StringPart,
		required: true
	},

	timestamp: {
		type: NumberPart,
		required: true,
		parseValue: getTimestamp
	}
};
