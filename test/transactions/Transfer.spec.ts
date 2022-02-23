import { assert } from "chai";
import { Transfer } from "../../src/transactions";
import base58 from "../../src/libs/base58";
import { AccountFactoryED25519 } from "../../src/accounts";


describe("Transfer", () => {

	const account = new AccountFactoryED25519("T").createFromSeed("test");
	const recipient = "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2";
	const amount = 100000000;
	const attachment = "hello";
	let transaction: Transfer;

	beforeEach(() => {
		transaction = new Transfer(recipient, amount, attachment);
	});

	describe("#toBinary", () => {
		it("should return a binary tx V3", () => {
			transaction.version = 3;
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.signWith(account);
			assert.equal(base58.encode(transaction.toBinary()),
				"w5iNQ3SBaqD2bQyGfEd997ZhxsLG9WukRtCvnXxJEFJtWnDUXJwk4xy8WGwXehKqScok56yArNFgSFVeWdyAXncmEX8PxLGpJQyN1B6A7gS9Wh81G8nNa6tQKJ7Qte");
		});

		it("should return a binary tx V2", () => {
			transaction.version = 2;
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.signWith(account);
			assert.equal(base58.encode(transaction.toBinary()),
				"3mpAPSojckMbTLycyr8EVtnHprFrM9wT5rzdQGt6tZy498ZFMZ3G4HEKbuNrFHzGG2ta8Nb9gqKyeoYUExFUue9H3NxT3Xj73GS3wXT2h2cAueFj4P4vfJf4U5x2");
		});
	});

	describe("#ToJson", () => {
		it("should return a transaction to Json", () => {
			const expected = JSON.stringify({
				type: 4,
				version: 3,
				sender: "3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG",
				senderKeyType: "ed25519",
				senderPublicKey: "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
				fee: 100000000,
				timestamp: 1519862400000,
				amount: 100000000,
				recipient: "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2",
				attachment: "Cn8eVZg",
				proofs: ["63cqGoj9FizZEj6LfSTMddLP71gZqhzQnsscrJFdFnGzEMiijJRi8pawxaRfSW4bD4w2oXZpur9cq1mXciVrELZ"]
			});
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.signWith(account);
			assert.equal(JSON.stringify(transaction), expected);
		});
	});

	describe("#from", () => {
		it("should return a transaction from the data", () => {
			const expected = {
				type: 4,
				version: 3,
				sender: "3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG",
				senderKeyType: "ed25519",
				senderPublicKey: "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
				fee: 100000000,
				timestamp: 1519862400000,
				amount: 100000000,
				recipient: "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2",
				attachment: "Cn8eVZg",
				proofs: ["63cqGoj9FizZEj6LfSTMddLP71gZqhzQnsscrJFdFnGzEMiijJRi8pawxaRfSW4bD4w2oXZpur9cq1mXciVrELZ"]
			};
			const actual = Transfer.from(expected);
			assert.equal(JSON.stringify(expected), JSON.stringify(actual));
		});
	});
});
