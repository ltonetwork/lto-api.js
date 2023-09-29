![LTO github readme](https://user-images.githubusercontent.com/100821/196711741-96cd4ba5-932a-4e95-b420-42d4d61c21fd.png)

# LTO API [![npm version](https://badge.fury.io/js/@ltonetwork%2Flto.svg)](https://badge.fury.io/js/@ltonetwork%2Flto)

Client for LTO Network. Integration for both public blockchain and private event-chain.

## Installation

```shell
npm install @ltonetwork/lto
```

or

```shell
yarn add @ltonetwork/lto
```

Alternatively you can [download the library as bundle](#download-bundle).

## Usage

The chain id is 'L' for the mainnet and 'T' testnet.

```js
import LTO, {Binary} from '@ltonetwork/lto';

const lto = new LTO('T');

const account = lto.account();

const seed = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
const accountFromSeed = lto.account({ seed });

lto.transfer(account, recipient, 100_00000000);
lto.massTransfer(account, [{recipient: recipient1, amount: 100_00000000}, {recipient: recipient2, amount: 50_00000000}]);
lto.anchor(account, new Binary('some value').hash(), new Binary('other value').hash());
lto.associate(account, 0x3400, recipient);
lto.revokeAssociation(account, 0x3400, recipient);
lto.lease(account, recipient, 10000_00000000);
lto.cancelLease(account, leaseId);
lto.sponsor(account, otherAccount);
lto.cancelSponsorship(account, otherAccount);

lto.getBalance(account);
lto.setData(account, {foo: 'bar'});
lto.getData(account);
```

_Amounts are in `LTO * 10^8`. Eg: 12.46 LTO is `12_46000000`._

## Documentation

For more advanced use cases, please [read the documentation](https://docs.ltonetwork.com/libraries/javascript).

## Download bundle

The library is also available as a bundle. This bundle includes the library and all its dependencies. This bundle is
useful if you want to use the library in a browser environment.

You can download the bundle from the [GitHub releases page](https://github.com/ltonetwork/lto-api.js/releases).

The library is bundles as a UMD module. This means you can use it in the browser as global variable `LTO`, or you can
import it as a module in your JavaScript code.

### Browser

```html
<script src="lto.js"></script>
<script>
    const lto = LTO.connect('T');
    const account = lto.account();
    console.log(account.address);
    
    lto.anchor(account, new LTO.Binary('test').hash())
      .then(tx => console.log(tx.id));
</script>
```

### Troubleshooting

Global variable `LTO` is an object with all exported classes and functions. If you try to do `new LTO()` you will get
the error:

    TypeError: LTO is not a constructor

Use `LTO.connect()` instead.
