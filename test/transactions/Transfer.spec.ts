import { assert } from "chai";
import { Transfer } from "../../src/transactions";
import base58 from "../../src/libs/base58";
import { AccountFactoryED25519 } from "../../src/accounts";


const phrase = "cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy";

describe("Transfer", () => {

	const account = new AccountFactoryED25519("T").createFromSeed(phrase);
	const recipient = "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2";
	const amount = 100000000;
	const attachment = "What a nice Transfer";
	const transaction = new Transfer(recipient, amount, attachment);


	describe("#toBinaryV3", () => {
		transaction.version = 3;
		it("should return a binary tx V3", () => {
			assert.equal(base58.encode(transaction.toBinary()),
				"66KPdiT5s3EUaULsJCZMcc6BYuVJT5G1z1YzLrGg6TgJdqT2p4yEvuA3L6jL1AedyAVDE8MaXgMhUXbyUBAKpp9yibmkjgQiF2LMhB");
		});
	});

	describe("#toBinaryV2", () => {
		transaction.version = 2;
		it("should return a binary tx V2", () => {
			assert.equal(base58.encode(transaction.toBinary()),
				"29uekfPgAXQu1nbcDYdj9r71dnZzMRFZ7EyaiZaoXjTqStSataMzD698gyn9qFpgJXr3fVFF4RDrqBgsrJ4ZbR8Ukte88fGXG4vvM");
		});
	});

	describe("#ToJson", () => {
		it("should return a transaction to Json", () => {
			const expected =  JSON.stringify({
				id:"",
				type: 4,
				version: 3,
				sender: "3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du",
				senderKeyType: "ed25519",
				senderPublicKey: "AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX",
				fee: 100000000,
				timestamp: 164024067773,
				amount: 100000000,
				recipient: "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2",
				attachment: "2DdU3NvpXxaG7ZgtjjM3nREs9ZgV",
				proofs: [
					"5j78dTpnSrrJm2LDgt9yMeNUR66HAsmYDoV4s3NjMgYvAJDoecmVcWYYyr8Fs1p2DcpKo8krZmfpqK9o7vcJpeQR"
				],
				height: ""
			});
			transaction.timestamp = 164024067773;
			transaction.signWith(account);
			assert.equal(JSON.stringify(transaction), expected);
		});
	});

	describe("#from", () => {
		it("should return a transaction from the data", () => {
			const expected = {
				txFee: 100000000,
				timestamp: 1640338882999,
				proofs: [
					"5mR25hKkydocTbVk6Fq7dbN8fvRt7fHNhZKPPoREcxtMMiR3xZWAaSGDGSWFGWXN3PSRxjzAwg5rz1LUDD5r1o5Q"
				],
				sender: "3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du",
				senderPublicKey: "AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX",
				chainId: "",
				sponsor: "",
				sponsorPublicKey: "",
				senderKeyType: "ed25519",
				sponsorKeyType: "ed25519",
				recipient: "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2",
				amount: 100000000,
				attachment: "2DdU3NvpXxaG7ZgtjjM3nREs9ZgV",
				type: 4,
				version: 3,
				id: "Fp5qtxgTbG5bvsJWHYqF78VQTjF5qXezBSnvCg84it3b",
				height: ""
			};
			const actual = Transfer.from(expected);
			assert.equal(JSON.stringify(expected), JSON.stringify(actual));
		});
	});
});
