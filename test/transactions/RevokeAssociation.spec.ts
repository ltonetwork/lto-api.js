import { assert } from "chai";
import {RevokeAssociation} from "../../src/transactions";
import * as base58 from "../../src/libs/base58";
import { AccountFactoryED25519 } from "../../src/accounts";
import Binary from "../../src/Binary";


describe("RevokeAssociation", () => {

	const account = new AccountFactoryED25519("T").createFromSeed("test");
	const recipient = "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2";
	const associationType = 10;
	const subject = Binary.fromHex("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
	let transaction: RevokeAssociation;

	beforeEach(() => {
		transaction = new RevokeAssociation(associationType, recipient, subject);
	});

	describe("#toBinary", () => {
		it("should return a binary tx V3", () => {
			transaction.version = 3;
			transaction.fee = 100000000; // old default fee
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.signWith(account);

			assert.equal(base58.encode(transaction.toBinary()),
				"MuJNYwF55DHZPH5tYRqWDwmUN4jJf7NPAvZv1Usrg1QG2LeiUZPeJgzvAUbfv8eD9hsXPK7RZ8VBSR75yZkAPuN34jCTRo76gZzFNWWD75q1sePthZSGdwFFoyixZjEsHzqbPnX7p9juESrhDi8bYzJvuWJSYL");
		});

		it("should return a binary tx V1", () => {
			transaction.version = 1;
			transaction.fee = 100000000; // old default fee
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.signWith(account);

			assert.equal(base58.encode(transaction.toBinary()),
				"Mtk66u6Lgfp2fXdDBc6iJdy3kkqXGd2nKwJ9za7Bn89L35oac1cYDo5qEBKEYtppLX7Ejz7wvSCVwGgPZ4pf5dyfwCuURnQPDXseyMeifnbx43WZKqGK79LXrM4yRhWVtuBDCwDS2rTuxKhCTEfspkdDZMyKLj");
		});
	});

	describe("#toJson", () => {
		it("should return a transaction to Json", () => {
			const expected =  JSON.stringify({
				type: 17,
				version: 3,
				sender: "3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG",
				senderKeyType: "ed25519",
				senderPublicKey: "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
				recipient: "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2",
				associationType: 10,
				fee: 100000000,
				timestamp: 1519862400000,
				subject: "GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn",
				proofs: [
					"2GFxEgDoYMf2kDgL6JUpBFjzyeL9RMQarAgjENMo99xAiYacDckDNUXCJFGur8cuvxEZaxmd3rLWsGi6ZfrMAxxL"
				]
			});
			transaction.fee = 100000000; // old default fee
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.signWith(account);
			assert.equal(JSON.stringify(transaction), expected);
		});
	});

	describe("#from", () => {
		it("should return a transaction from the data", () => {
			const data = {
				type: 17,
				version: 3,
				sender: "3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG",
				senderKeyType: "ed25519",
				senderPublicKey: "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
				recipient: "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2",
				associationType: 10,
				fee: 100000000,
				timestamp: 1519862400000,
				subject: "GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn",
				proofs: [
					"2GFxEgDoYMf2kDgL6JUpBFjzyeL9RMQarAgjENMo99xAiYacDckDNUXCJFGur8cuvxEZaxmd3rLWsGi6ZfrMAxxL"
				]
			};
			const actual = RevokeAssociation.from(data);
			assert.equal(JSON.stringify(actual), JSON.stringify(data));
		});
	});
});
