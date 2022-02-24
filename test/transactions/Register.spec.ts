import { assert } from "chai";
import { Register } from "../../src/transactions";
import { AccountFactoryED25519 } from "../../src/accounts";
import base58 from "../../src/libs/base58";


describe("Register", () => {

	const account = new AccountFactoryED25519("T").createFromSeed("test");
	const accountA = new AccountFactoryED25519("T").createFromSeed("A");
	const accountB = new AccountFactoryED25519("T").createFromSeed("B");
	let transaction: Register;

	beforeEach(() => {
		transaction = new Register(accountA, accountB);
	});

	describe("#construction", () => {
		it("check the construction of a register transaction", () => {
			assert.equal(transaction.fee, 45000000);
		});
	});

	describe("#toBinary", () => {
		it("should return a binary tx V3", () => {
			transaction.version = 3;
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.signWith(account);

			assert.equal(base58.encode(transaction.toBinary()),
				"w3RJqSX35Zd9xDMw6Z6HxXpnk6zEb2PHZ3eheqb1QLP79ZMoP56YJJnHyJLPK9SV1QLXESPWi3fqBWfjPpU1ix268tdvGFrfb5JrJcao8VYQfe34hoqoW1uyxyEwFpte5eDHMTov682KxdN8i2DjbdmUj6KSmENBF7zBMq");
		});
	});

	describe("#ToJson", () => {
		it("should return a transaction to Json", () => {
			const expected = JSON.stringify({
				type: 20,
				version: 3,
				sender: "3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG",
				senderKeyType: "ed25519",
				senderPublicKey: "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
				fee: 45000000,
				timestamp: 1519862400000,
				accounts: [
					{keyType: "ed25519", publicKey: "G5cfhKBn1NfxgrL35FtbgQqRq6eRNTPRJRZDr5NGG15D"},
					{keyType: "ed25519", publicKey: "5BgX9qHU3uMm32y6PStn4Z8iGy4qCowQ8rduhb5td5fm"}
				],
				proofs: ["43hhu7H5Yw7wC69BkSa42y2RpB1XqopaQFffzMh6WVKkmXe3oHWbv1qZxUBTj7Du7tMiiRyXUBFWTyqQ9Z7EVdgx"]
			});

			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.signWith(account);
			assert.equal(JSON.stringify(transaction), expected);
		});
	});

	describe("#from", () => {
		it("should return a transaction from the data", () => {
			const data =  {
				type: 20,
				version: 3,
				sender: "3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG",
				senderKeyType: "ed25519",
				senderPublicKey: "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
				fee: 45000000,
				timestamp: 1519862400000,
				accounts: [
					{keyType: "ed25519", publicKey: "G5cfhKBn1NfxgrL35FtbgQqRq6eRNTPRJRZDr5NGG15D"},
					{keyType: "ed25519", publicKey: "5BgX9qHU3uMm32y6PStn4Z8iGy4qCowQ8rduhb5td5fm"}
				],
				proofs: ["43hhu7H5Yw7wC69BkSa42y2RpB1XqopaQFffzMh6WVKkmXe3oHWbv1qZxUBTj7Du7tMiiRyXUBFWTyqQ9Z7EVdgx"]
			};
			const actual = Register.from(data);
			assert.equal(JSON.stringify(actual), JSON.stringify(data));
		});
	});

});
