import { assert } from "chai";
import { Register } from "../../src/transactions";
import { AccountFactoryED25519 } from "../../src/accounts";


describe("Register", () => {

	const phrase = "df3dd6d884714288a39af0bd973a1771c9f00f168cf040d6abb6a50dd5e055d8";
	const account = new AccountFactoryED25519("T").createFromSeed(phrase);
	const account2 = new AccountFactoryED25519("T").createFromSeed("tree ship container raccoon cup water mother");
	const account3 = new AccountFactoryED25519("T").createFromSeed("milk animal bottle raccoon yellow green");

	const transaction = new Register(account2, account3);

	describe("#testConstruct", () => {
		it("check the construction of a register transaction", () => {
			assert.equal(transaction.fee, 45000000);
		});
	});

	describe("#ToJson", () => {
		it("should return a transaction to Json", () => {
			const expected =  JSON.stringify({
				id: "",
				type: 20,
				version: 3,
				sender: "3MtHYnCkd3oFZr21yb2vEdngcSGXvuNNCq2",
				senderKeyType: "ed25519",
				senderPublicKey: "4EcSxUkMxqxBEBUBL2oKz3ARVsbyRJTivWpNrYQGdguz",
				fee: 45000000,
				timestamp: 1326499200000,
				accounts: [{"keyType": "ed25519", "publicKey": "8VNd1qLRyRSNdqfkjDffpFkdeUrPCGEL3btzkcr98ykX"},
					{"keyType": "ed25519", "publicKey": "7YVCTAzyAjrtRw5RsxjfonCn3tUrfgtYcy5xd2niqWDa"}],
				proofs: [
					"5zndzMGsoTkiGGDAqkCK8VHJ7vephZHubYRifSfDopUUGuHwSBhhSeoCB6FvLAH6NZmGncwABuPePFzBAM9riWzJ"
				],
				height: ""
			});
			transaction.timestamp = 1326499200000;
			transaction.signWith(account);
			assert.equal(JSON.stringify(transaction), expected);
		});
	});

	describe("#from", () => {
		it("should return a transaction from the data", () => {
			const expected =  {
				txFee: 45000000,
				timestamp: 1326499200000,
				proofs: [
					"2omugkAQdrm9P7YPx6WZbXMBTifRS6ptaTT8rPRRvKFr1EPFafHSosq6HzkuuLv78gR6vaXLA9WtMsTSBgi3H1qe"
				],
				sender: "3Jq8mnhRquuXCiFUwTLZFVSzmQt3Fu6F7HQ",
				senderPublicKey: "AJVNfYjTvDD2GWKPejHbKPLxdvwXjAnhJzo6KCv17nne",
				chainId: "",
				sponsor: "",
				sponsorPublicKey: "",
				senderKeyType: "ed25519",
				sponsorKeyType: "ed25519",
				accounts: [{"keyType": "ed25519", "publicKey": "8VNd1qLRyRSNdqfkjDffpFkdeUrPCGEL3btzkcr98ykX"},
					{"keyType": "ed25519", "publicKey": "7YVCTAzyAjrtRw5RsxjfonCn3tUrfgtYcy5xd2niqWDa"}],
				type: 20,
				version: 3,
				id: "8M6dgn85eh3bsHrVhWng8FNaHBcHEJD4MPZ5ZzCciyon",
				height: 1069662
			};
			const actual = Register.from(expected);
			assert.equal(JSON.stringify(expected), JSON.stringify(actual));
		});
	});

});
