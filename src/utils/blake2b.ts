import * as blake from "../libs/blake2b";

export function blake2b(input: Array<number> | Uint8Array | string) {
    return blake.blake2b(input, null, 32);
}
