import {assert, expect} from "chai";
import { Data } from "../../src/transactions";
import { AccountFactoryED25519 } from "../../src/accounts";
import Binary from "../../src/Binary";
import base58 from "../../src/libs/base58";


describe("Data", () => {

	const account = new AccountFactoryED25519("T").createFromSeed("test");
	const dict = {
		"test": 1,
		"second": true,
		"third": new Binary('foo'),
		"fourth": "hello"
	};
	let transaction: Data;

	beforeEach(() => {
		transaction = new Data(dict);
	});

	describe("#construction", () => {
		it("check the construction of a data transaction", () => {
			assert.lengthOf(transaction.data, 4);

			assert.equal(transaction.data[0].key, "test");
			assert.equal(transaction.data[0].type, "integer");
			assert.equal(transaction.data[0].value, 1);

			assert.equal(transaction.data[1].key, "second");
			assert.equal(transaction.data[1].type, "boolean");
			assert.isTrue(transaction.data[1].value);

			assert.equal(transaction.data[2].key, "third");
			assert.equal(transaction.data[2].type, "binary");
			assert.instanceOf(transaction.data[2].value, Binary)
			assert.equal(transaction.data[2].value.toString(), "foo");

			assert.equal(transaction.data[3].key, "fourth");
			assert.equal(transaction.data[3].type, "string");
			assert.equal(transaction.data[3].value, "hello");
		});
	});

	describe("#dict", () => {
		it("should return the data as key/value pairs", () => {
			expect(transaction.dict).to.deep.eq(dict);
		});
	});


	describe("#toBinary", () => {
		it("should return a binary tx V3", () => {
			transaction.signWith(account);
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.version = 3;

			assert.equal(base58.encode(transaction.toBinary()),
				"U5ZyvegfQDhsWtMcp89MwkJPCQBRFxWyqxP1fHb8t78itf8derWQrw9sBApWEScggANEY9D5qf1xrzEwhj32tCBUg5QWUiZ4kcCdhBkLoMQV4ngVpGx3ij8rBks7HnwPEJBABLWJ");
		});
	});

	describe("#ToJson", () => {
		it("should return a transaction to Json", () => {
			const expected = JSON.stringify({
				type: 12,
				version: 3,
				sender: "3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG",
				senderKeyType: "ed25519",
				senderPublicKey: "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
				fee: 100000000,
				timestamp: 1519862400000,
				data: [
					{key: "test", type: "integer", value: 1},
					{key: "second", type: "boolean", value: true},
					{key: "third", type: "binary", value: "base64:Zm9v"},
					{key: "fourth", type: "string", value: "hello"}
				],
				proofs: ["txb5o5WyU9ENVb6xKB4SM4Pz7T9oq2jh6baapP17F87DjMrJZrA2kd5Nh1dvYGMrnPXCVTEznwndwfqRZpqzS1u"]
			});
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.signWith(account);
			assert.equal(JSON.stringify(transaction), expected);
		});
	});

	describe("#from", () => {
		it("should return a transaction from the data", () => {
			const data = {
				type: 12,
				version: 3,
				sender: "3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG",
				senderKeyType: "ed25519",
				senderPublicKey: "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
				fee: 100000000,
				timestamp: 1519862400000,
				data: [
					{key: "test", type: "integer", value: 1},
					{key: "second", type: "boolean", value: true},
					{key: "third", type: "binary", value: "base64:Zm9v"},
					{key: "fourth", type: "string", value: "hello"}
				],
				proofs: ["txb5o5WyU9ENVb6xKB4SM4Pz7T9oq2jh6baapP17F87DjMrJZrA2kd5Nh1dvYGMrnPXCVTEznwndwfqRZpqzS1u"]
			};
			const actual = Data.from(data);
			assert.equal(JSON.stringify(actual), JSON.stringify(data));
		});
	});
});
