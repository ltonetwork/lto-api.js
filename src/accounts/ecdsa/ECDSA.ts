import { Cypher } from "../Cypher"
import converters from "../../libs/converters";
import base58 from "../../libs/base58";
import { sha256 } from "js-sha256";
import * as constants from "../../constants";
import encoder from "../../utils/encoder";
import { crypto as jsrsa } from 'jsrsasign';
import { IKeyPairBytes } from "../../interfaces";

export class ECDSA extends Cypher {
    private readonly ec;
    private readonly sign: IKeyPairBytes;

    constructor(curve: string, sign: IKeyPairBytes) {
        super(curve);

        this.sign = sign;
        this.ec = new jsrsa.ECDSA({'curve': curve});
    }

    createSignature(input: string | Uint8Array, encoding = "base58"): string {
        if (!this.sign.privateKey)
            throw new Error("Unable to sign: no private key");

        const dataBytes =typeof input === "string" ? Uint8Array.from(converters.stringToByteArray(input)) : input;
 

        let mex = sha256(dataBytes);
        let signature = this.ec.signHex(mex, encoder.encode(this.sign.privateKey, "hex"));
        return encoder.recode(jsrsa.ECDSA.asn1SigToConcatSig(signature), "hex", encoding);
    }

    verifySignature(
        input: string | Uint8Array,
        signature: string | Uint8Array,
        encoding = "base58"
    ): boolean {
        const dataBytes = typeof input === "string" ? Uint8Array.from(converters.stringToByteArray(input)) : input;

        const publicKeyBytes = base58.decode(this.sign.publicKey);
        const mex = sha256(dataBytes);

        return this.ec.verifyHex(
            mex,
            jsrsa.ECDSA.concatSigToASN1Sig(encoder.recode(signature, encoding, "hex")),
            encoder.encode(publicKeyBytes, "hex")
        );
    }

    encryptMessage(
        message: string | Uint8Array,
        theirPublicKey: string,
        nonce: Uint8Array
    ): Uint8Array {
        throw new Error("Encryption not implemented for ECDSA");
    }

    decryptMessage(cypher: Uint8Array): string {
        throw new Error("Encryption not implemented for ECDSA");
    }
}
