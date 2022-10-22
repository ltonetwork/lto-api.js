import {sha256 as sha256hasher} from "js-sha256";

export function sha256(input: Array<number> | Uint8Array | string): Uint8Array {
	return Uint8Array.from(sha256hasher.array(input));
}
