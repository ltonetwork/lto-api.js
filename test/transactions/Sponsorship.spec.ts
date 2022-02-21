import { assert } from "chai";
import { Sponsorship } from "../../src/transactions";
import base58 from "../../src/libs/base58";
import { AccountFactoryED25519 } from "../../src/accounts";



const phrase = "cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy";

describe("Sponsorship", () => {

	const account = new AccountFactoryED25519("T").createFromSeed(phrase);
	const recipient = "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2";
	const transaction = new Sponsorship(recipient);


	describe("#toBinaryV3", () => {
		transaction.version = 3;
		it("should return a binary tx V3", () => {
			assert.equal(base58.encode(transaction.toBinary()),
				"SrD66ijtYgHYL5jQpfdU1ttpWELgjRU3MMs6Ga15souqHkKKtCA8gPhpJp39W");
		});
	});

	describe("#toBinaryV1", () => {
		transaction.version = 1;
		it("should return a binary tx V1", () => {
			assert.equal(base58.encode(transaction.toBinary()),
				"6rfZMKRUqVxSXmaBTE2DbY8hR8j1tyQEjeWWrH3fwetKupFm9qwhBuPNXEib");
		});
	});

	describe("#ToJson", () => {
		it("should return a transaction to Json", () => {
			const expected =  JSON.stringify({
				id: "",
				type: 18,
				version: 3,
				sender: "3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du",
				senderKeyType: "ed25519",
				senderPublicKey: "AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX",
				recipient: "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2",
				timestamp: 1640353616132,
				fee: 500000000,
				proofs: [
					"2T6rwVae5Mt9TVMDtvSrSyoCapiywXnp3HpFH3aDy4TNZ6fo8ML8YZvM7RCisS5pZjhSt3WHb722Uw8JfFS4Sigv"
				],
				height: ""
			});
			transaction.timestamp = 1640353616132;
			transaction.signWith(account);
			assert.equal(JSON.stringify(transaction), expected);
		});
	});

	describe("#from", () => {
		it("should return a transaction from the data", () => {
			const expected = {
				txFee: 500000000,
				timestamp: 1640353616132,
				proofs: [
					"2T6rwVae5Mt9TVMDtvSrSyoCapiywXnp3HpFH3aDy4TNZ6fo8ML8YZvM7RCisS5pZjhSt3WHb722Uw8JfFS4Sigv"
				],
				sender: "3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du",
				senderPublicKey: "AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX",
				chainId: "",
				sponsor: "",
				sponsorPublicKey: "",
				senderKeyType: "ed25519",
				sponsorKeyType: "ed25519",
				recipient: "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2",
				type: 18,
				version: 3,
				id: "4Mg7ijigU8gcGnYsyJyHLkcJYqdCP9vDkbG2wU6nu8Aj",
				height: ""
			};
			const actual = Sponsorship.from(expected);
			assert.equal(JSON.stringify(expected), JSON.stringify(actual));
		});
	});
});
