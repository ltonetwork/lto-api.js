import { assert } from "chai";
import { AccountFactoryED25519 } from "../../src/accounts/";
import {Association} from "../../src/transactions/";
import base58 from "../../src/libs/base58";
import Binary from "../../src/Binary";


describe("Association", () => {

	const account = new AccountFactoryED25519("T").createFromSeed("test");
	const recipient = "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2";
	const associationType = 10;
	const hash = Binary.fromHex("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
	let transaction: Association;

	beforeEach(() => {
		transaction = new Association(recipient, associationType, hash);
	});


	describe("#toBinary", () => {
		it("should return a binary tx V3", () => {
			transaction.signWith(account);
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.version = 3;

			assert.equal(base58.encode(transaction.toBinary()),
				"FXPf4kBRFURpiKRzWut1C8JhPsBDdQpoaUd43DvjaWfs5GFaovqSYGm1bNhdFKJXh1Rto6ZUojYvyKiekG5kQe3QbS1HXF9GXS7voTuzf3xt5K49tUf33gWD1TZDFAg4MBNEJpbWsqSrxQkHPaKF5x25KY6R26aqMmAdwQTXi");
		});

		it("should return a binary tx V1", () => {
			transaction.signWith(account);
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.version = 1;

			assert.equal(base58.encode(transaction.toBinary()),
				"LfVAjhtHfNcJXUepVzXgegX6NehpnYva5gtA7RZypw36qSAj2Aqz4ZgUWZLeqsDYZSfJ8LsFJx7uQKvGvcr2q7KZNqdFqdvpHGs7dCigiu7ncYiGHUuD6TDarhLw5bCHAx4gTPSFWftBKB5yVRhwL6Lryj6xYP");
		});
	});

	describe("#toJson", () => {
		it("should return a transaction to Json", () => {
			const expected =  JSON.stringify({
				type: 16,
				version: 3,
				sender: "3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG",
				senderKeyType: "ed25519",
				senderPublicKey: "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
				recipient: "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2",
				associationType: 10,
				fee: 100000000,
				timestamp: 1519862400000,
				hash: "GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn",
				proofs: [
					"5uKFmMSEyL9HhNByguPLpJNQUVWYnWQB1LQZokRhAf3XvXVgYG7yB62j2U8azrkXvmvyG3gXYWoSucnDnqk2jWzJ"
				]
			});
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.signWith(account);
			assert.equal(JSON.stringify(transaction), expected);
		});
	});

	describe("#from", () => {
		it("should return a transaction from the data", () => {
			const data = {
				type: 16,
				version: 3,
				sender: "3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du",
				senderKeyType: "ed25519",
				senderPublicKey: "AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX",
				recipient: "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2",
				associationType: 10,
				fee: 100000000,
				timestamp: 1640341125640,
				hash: "GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn",
				proofs: [
					"4SYAJuygUmqFQtH6D5eN671Y1XT31yg1Es9pRxVz8QRHgtJQrLU8FiicUZYira959YHdLDRwYiZoSfd7FVKrPjwg"
				],
			};
			const actual = Association.from(data);
			assert.equal(JSON.stringify(actual), JSON.stringify(data));
		});
	});
});
