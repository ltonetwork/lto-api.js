import { assert } from "chai";
import { CancelSponsorship } from "../../src/transactions";
import base58 from "../../src/libs/base58";
import { AccountFactoryED25519 } from "../../src/accounts";


describe("CancelSponsorship", () => {

	const account = new AccountFactoryED25519("T").createFromSeed("test");
	const recipient = "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2";
	let transaction: CancelSponsorship;

	beforeEach(() => {
		transaction = new CancelSponsorship(recipient);
	});

	describe("#toBinary", () => {
		it("should return a binary tx V3", () => {
			transaction.signWith(account);
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.version = 3;

			assert.equal(base58.encode(transaction.toBinary()),
				"cmzbobeuXo4xbfJUDrXR3YH8EfLASfZGnLD7Bz76P9SyRnA4MFEBwFGX5etX6LLzBpYigYQqQ1ab2Dr2rgTB7G2fU1s9BgBUkZ9JZtJKnk");
		});

		it("should return a binary tx V1", () => {
			transaction.signWith(account);
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.version = 1;

			assert.equal(base58.encode(transaction.toBinary()),
				"96vWEMJuHdYSKokXrexSArYK6efimtRLTxvuPh4s8Qny3HMmEkLuNDtCu4u7i7mSGgGKJyvZooyXPSyenvrgjbh98AioBHxyHmTMtSAjZ");
		});
	});

	describe("#ToJson", () => {
		it("should return a transaction to Json", () => {
			const expected = JSON.stringify({
				type: 19,
				version: 3,
				sender: "3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG",
				senderKeyType: "ed25519",
				senderPublicKey: "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
				recipient: "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2",
				timestamp: 1519862400000,
				fee: 500000000,
				proofs: ["5MzFb3nQbK4oCkt1iUJJ6i2vB81g2x7rNnK22w6mnSvpn1De14FvxWqGE9UuHovQQ93ssrgKWkqexfShMwjbSatJ"]
			});
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.signWith(account);
			assert.equal(JSON.stringify(transaction), expected);
		});
	});

	describe("#from", () => {
		it("should return a transaction from the data", () => {
			const data = {
				type: 19,
				version: 3,
				sender: "3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG",
				senderKeyType: "ed25519",
				senderPublicKey: "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
				recipient: "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2",
				timestamp: 1519862400000,
				fee: 500000000,
				proofs: ["5MzFb3nQbK4oCkt1iUJJ6i2vB81g2x7rNnK22w6mnSvpn1De14FvxWqGE9UuHovQQ93ssrgKWkqexfShMwjbSatJ"]
			};
			const actual = CancelSponsorship.from(data);
			assert.equal(JSON.stringify(actual), JSON.stringify(data));
		});
	});
});
