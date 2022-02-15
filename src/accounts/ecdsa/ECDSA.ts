import {Cypher} from "../Cypher"
import converters from "../../libs/converters";
import {sha256} from "js-sha256";
import {encode, recode} from "../../utils/encoder";
import {crypto as jsrsa} from 'jsrsasign';
import {Encoding, IKeyPairBytes} from "../../interfaces";

export class ECDSA extends Cypher {
    private readonly ec;
    private readonly sign: IKeyPairBytes;

    constructor(curve: string, sign: IKeyPairBytes) {
        super(curve);

        this.sign = sign;
        this.ec = new jsrsa.ECDSA({'curve': curve});
    }

    public createSignature(input: string | Uint8Array, encoding = Encoding.base58): string {
        if (!this.sign.privateKey)
            throw new Error("Unable to sign: no private key");

        const dataBytes = typeof input === "string" ? Uint8Array.from(converters.stringToByteArray(input)) : input;
        const mex = sha256(dataBytes);
        const signature = this.ec.signHex(mex, encode(this.sign.privateKey, Encoding.hex));

        return recode(jsrsa.ECDSA.asn1SigToConcatSig(signature), Encoding.hex, encoding);
    }

    public verifySignature(
        input: string | Uint8Array,
        signature: string | Uint8Array,
        encoding = Encoding.base58
    ): boolean {
        const dataBytes = typeof input === "string" ? Uint8Array.from(converters.stringToByteArray(input)) : input;
        const mex = sha256(dataBytes);

        return this.ec.verifyHex(
            mex,
            jsrsa.ECDSA.concatSigToASN1Sig(recode(signature, encoding, Encoding.hex)),
            encode(this.sign.publicKey, Encoding.hex)
        );
    }

    public encryptMessage(
        message: string | Uint8Array,
        theirPublicKey: string,
        nonce: Uint8Array
    ): Uint8Array {
        throw new Error("Encryption not implemented for ECDSA");
    }

    public decryptMessage(cypher: Uint8Array): string {
        throw new Error("Encryption not implemented for ECDSA");
    }
}
