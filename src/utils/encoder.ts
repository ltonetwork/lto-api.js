import base58 from "../libs/base58";
import base64 from "../libs/base64";

export default {
	encode(input: Uint8Array, encoding = "base58"): string {
		switch (encoding) {
		case "base64":
			return base64.encode(input);
		default:
			return base58.encode(input);
		}
	},

	decode(input: string, encoding = "base58"): Uint8Array {
		switch (encoding) {
		case "base64":
			return base64.decode(input);

		default:
			return base58.decode(input);
		}
	}
};