import base58 from "../libs/base58";
import base64 from "../libs/base64";


function hexToBytes(hex: any): Uint8Array {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return new Uint8Array(bytes);
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xF).toString(16));
    }
    return hex.join("");
}

export default {
	encode(input: Uint8Array, encoding = "base58"): string {
		switch (encoding) {
		case "base64":
			return base64.encode(input);
		case "hex":
			return bytesToHex(input);
		default:
			return base58.encode(input);
		}
	},

	decode(input: string, encoding = "base58"): Uint8Array {
		switch (encoding) {
		case "base64":
			return base64.decode(input);
		case "hex":
			return hexToBytes(input);
		default:
			return base58.decode(input);
		}
	}
};


