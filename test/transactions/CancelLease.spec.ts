import { assert } from "chai";
import { CancelLease } from "../../src/transactions/";
import base58 from "../../src/libs/base58";
import { AccountFactoryED25519 } from "../../src/accounts";

const phrase = "cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy";

describe("CancelLease", () => {

	const account = new AccountFactoryED25519("T").createFromSeed(phrase);
	const leaseId = "ELtXhrFTCRJSEweYAAaVTuv9wGjNzwHYUDnH6UT1JxmB";
	const transaction = new CancelLease(leaseId);


	describe("#toBinaryV3", () => {
		transaction.version = 3;
		it("should return a binary tx V3", () => {
			assert.equal(base58.encode(transaction.toBinary()),
				"VRf7LqgZrWysrzQ5gmhKBPYcMc7K4ceG5bNi17YQWtcjzxWJKQcEuFRAtFTD3T9kbDbYy");
		});
	});

	describe("#toBinaryV2", () => {
		transaction.version = 2;
		it("should return a binary tx V2", () => {
			assert.equal(base58.encode(transaction.toBinary()),
				"7SXPHH1ou8GpttaRyetN19LxjyHqjkwst7VoeuhDANgHQRmtbvZAu4FxsSsjgHtwD7o3");
		});
	});

	describe("#ToJson", () => {
		it("should return a transaction to Json", () => {
			const expected =  JSON.stringify({
				id: "",
				type: 9,
				version: 3,
				sender: "3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du",
				senderKeyType: "ed25519",
				senderPublicKey: "AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX",
				fee: 100000000,
				timestamp: 1640352716317,
				proofs: [
					"211f1TELEVWfncLcw3KZ1HD5LMiMBV8uNXUtmrtfBwNCdjPpLMmdJaBD9RC9mdwLN4iMThj5UZ1J9BGWXjeezQqQ"
				],
				leaseId: "ELtXhrFTCRJSEweYAAaVTuv9wGjNzwHYUDnH6UT1JxmB",
				height: ""
			});
			transaction.timestamp = 1640352716317;
			transaction.signWith(account);
			assert.equal(JSON.stringify(transaction), expected);
		});
	});

	describe("#from", () => {
		it("should return a transaction from the data", () => {
			const expected = {
				txFee: 500000000,
				timestamp: 1640352716317,
				proofs: [
					"41u9WYiSfeMkzDLEqFufPt5hhXvnmPVr4qqsmGuicHZxTrphtsrbcG3h4zigbaFAkgKLKA9v4ZQR9dAjvQdkmJiE"
				],
				sender: "3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du",
				senderPublicKey: "AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX",
				chainId: "",
				sponsor: "",
				sponsorPublicKey: "",
				senderKeyType: "ed25519",
				sponsorKeyType: "ed25519",
				leaseId: "ELtXhrFTCRJSEweYAAaVTuv9wGjNzwHYUDnH6UT1JxmB",
				type: 9,
				version: 3,
				id: "Ba6eaVVLyDr4K3fJzM1BTsy3zC87UYjsNVpTBHRLVskp",
				height: ""
			};
			const actual = CancelLease.from(expected);
			assert.equal(JSON.stringify(expected), JSON.stringify(actual));
		});
	});
});
