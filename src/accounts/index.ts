import {Account} from "./Account";
import {AccountFactory} from "./AccountFactory";
import {AccountFactoryECDSA} from "./ecdsa/AccountFactoryECDSA";
import {AccountFactoryED25519} from "./ed25519/AccountFactoryED25519";

export {
    Account,
    AccountFactory,
    AccountFactoryECDSA,
    AccountFactoryED25519,
};

export function guardAccount(account: Account, address?: string, publicKey?: string, privateKey?: string): Account {
    if (privateKey && account.getPrivateSignKey() !== privateKey) throw Error("Private key mismatch");
    if (publicKey && account.getPublicSignKey() !== publicKey) throw Error("Public key mismatch");
    if (address && account.address !== address) throw Error("Address mismatch");

    return account;
}
