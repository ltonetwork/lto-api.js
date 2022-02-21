import {Encoding, decode, encode} from "./utils/encoder";
import {IBinary} from "../interfaces";
import converters from "./libs/converters";

export default class Binary extends Uint8Array implements IBinary {
    constructor(value?: string|ArrayLike<number>) {
        const bytes = typeof value === "string"
            ? converters.stringToByteArray(value)
            : value;

        super(bytes);
    }

    public get base58() {
        return encode(this, Encoding.base58)
    }

    public get base64() {
        return encode(this, Encoding.base64)
    }

    public get hex() {
        return encode(this, Encoding.hex);
    }

    public asString() {
        return converters.byteArrayToString(this);
    }

    public static fromBase58(value: string): Binary {
        return new Binary(decode(value, Encoding.base58));
    }

    public static fromBase64(value: string): Binary {
        return new Binary(decode(value, Encoding.base64));
    }

    public static fromHex(value: string): Binary {
        return new Binary(decode(value, Encoding.hex));
    }
}
