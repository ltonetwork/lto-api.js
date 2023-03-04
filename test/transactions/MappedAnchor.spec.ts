import { assert } from "chai";
import { MappedAnchor } from "../../src/transactions";
import * as base58 from "../../src/libs/base58";
import { AccountFactoryED25519 } from "../../src/accounts";
import Binary from "../../src/Binary";


describe("MappedAnchor", () => {
	const account = new AccountFactoryED25519("T").createFromSeed("test");
	const sponsor = new AccountFactoryED25519("T").createFromSeed("test sponsor");
	const pair = {
		key: Binary.fromHex("2c70e12b7a0646f92279f427c7b38e7334d8e5389cff167a1dc30e73f826b683"),
		value: Binary.fromHex("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
	};
	let transaction: MappedAnchor;

	beforeEach(() => {
		transaction = new MappedAnchor(pair);
	});

	describe("#toBinary", () => {
		it("should return a binary tx V3", () => {
			transaction.signWith(account);
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.version = 3;

			assert.equal(base58.encode(transaction.toBinary()),
				"22Sf8U2yGD2y8Hz8zMHY5Eu1CGGzAkFdVBys6G4epL4P5m9hfNf4yC1eVq5TGu3SeW1zbfX67wLnrchum4fCDsvBSxENGn8kpBq2mgZpVvPUaHcEZD8eFn9mYrZtzbWopKiHjGWenbG21XdCBNCyr8PLVHzMsanoZHZrjfi");
		});
	});

	describe("#toJson", () => {
		it("should return a transaction to Json", () => {
			const expected =  JSON.stringify({
				type: 22,
				version: 3,
				sender: "3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG",
				senderKeyType: "ed25519",
				senderPublicKey: "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
				fee: 35000000,
				timestamp: 1519862400000,
				anchors: {
					"3zUmfASF9W3EeyiTwgXsCgb3kQzQTV9JHWY2hCykJVir": "GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn"
				},
				proofs: [
					"38MZW6aF5kBjXsJ75XizEg3odQX8nCCngKGXU4CpFq8V9m2r17nKrWw4Ni9YuFye48JrJbwRjkX58UxF6usUQRez"
				]
			});
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.signWith(account);
			assert.equal(JSON.stringify(transaction), expected);
		});
	});

	describe("#signWith", () => {
		it("have a valid signature", () => {
			assert.isFalse(transaction.isSigned());

			transaction.signWith(account);
			assert.isTrue(transaction.isSigned());
			assert.equal(transaction.sender, account.address);
			assert.equal(transaction.senderPublicKey, account.publicKey);
			assert.equal(transaction.senderKeyType, account.keyType);

			assert.equal(transaction.proofs.length, 1);
			assert.isTrue(account.verify(transaction.toBinary(), Binary.fromBase58(transaction.proofs[0])));

			assert.isUndefined(transaction.sponsor);
		});

		it("will automatically sponsor the tx if signed with a child account", () => {
			const child = new AccountFactoryED25519("T").createFromSeed("identifier");
			child.parent = account;

			transaction.signWith(child);
			assert.equal(transaction.sender, child.address);
			assert.equal(transaction.sponsor, account.address);

			assert.equal(2, transaction.proofs.length);
			assert.isTrue(child.verify(transaction.toBinary(), Binary.fromBase58(transaction.proofs[0])));
			assert.isTrue(account.verify(transaction.toBinary(), Binary.fromBase58(transaction.proofs[1])));
		});
	});

	describe("#from", () => {
		it("should return a transaction from the data", () => {
			const data = {
				type: 22,
				version: 3,
				sender: "3MtHYnCkd3oFZr21yb2vEdngcSGXvuNNCq2",
				senderKeyType: "ed25519",
				senderPublicKey: "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
				fee: 35000000,
				timestamp: 1519862400000,
				anchors: {
					"3zUmfASF9W3EeyiTwgXsCgb3kQzQTV9JHWY2hCykJVir": "GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn"
				},
				proofs: [
					"38MZW6aF5kBjXsJ75XizEg3odQX8nCCngKGXU4CpFq8V9m2r17nKrWw4Ni9YuFye48JrJbwRjkX58UxF6usUQRez"
				]
			};
			const actual = MappedAnchor.from(data);
			assert.equal(JSON.stringify(actual), JSON.stringify(data));
		});
	});
});
