// test-lto-identity-builder.js
// ----------------------------
// This file is only for testing the `LTO.IdentityBuilder` class against TestNet
// 
// For this, make sure you have run `npm run build` to create a `dist` folder,
// and then run this file by using `node ./bin/test-lto-identity-builder.js`
// 
// This will send the transactions necessary for testing the builder:
// > One transfer tx from `sender` to `recipient` of 0.35 LTO
// > One anchor tx from `recipient`
// > One association from `sender` with `recipient` as the `party`
// 
// Note: the inital transfer might take a few seconds to process,
// so if your `recipient` wallet is empty, the anchor tx will fail.
// You can either choose a wallet that you know has funds or make the code
// wait before sending the anchor tx.

const path = require("path");
const https = require("https");

const API = require(path.join(__dirname, "..", "dist", "lto-api"));

const execute = async () => {
  const lto = new API.LTO("T");

  // If you want to specify an account/wallet to use, just uncomment the below
  // lines and add your seed to `senderSeed` or `recipientSeed` (or both)
  // 
  // const sender = new API.Account(senderSeed, "T");
  // const recipient = new API.Account(recipientSeed, "T");
  
  const sender = lto.createAccount();
  const recipient = lto.createAccount();

  const identity = new API.IdentityBuilder(sender);

  identity.addVerificationMethod(recipient, 1);

  for (const transaction of identity.transactions) {
    delete transaction.id; // id is not necessary when broadcasting tx

    const res = await httpPost({
      hostname: "testnet.lto.network",
      path: "/transactions/broadcast",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    });

    console.log("==================================");
    console.log("Response: ", res);
  }
};

const httpPost = ({ body, ...options }) => {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: "POST",
        ...options,
      },
      (res) => {
        const chunks = [];
        res.on("data", (data) => chunks.push(data));
        res.on("end", () => {
          let body = Buffer.concat(chunks);

          switch (res.headers["content-type"]) {
            case "application/json":
              body = JSON.parse(body);
              break;
          }

          resolve(body);
        });
      }
    );

    req.on("error", reject);

    if (body) req.write(body);

    req.end();
  });
};

execute();
