import Transaction from "./Transaction";
import Anchor from "./Anchor";
import Association from "./Association";
import RevokeAssociation from "./RevokeAssociation";
import Data from "./Data";
import Lease from "./Lease";
import CancelLease from "./CancelLease";
import MassTransfer from "./MassTransfer";
import Register from "./Register";
import Sponsorship from "./Sponsorship";
import CancelSponsorship from "./CancelSponsorship";
import Transfer from "./Transfer";
import {ITxJSON} from "../../interfaces";

export {
    Anchor,
    Association,
    RevokeAssociation,
    Data,
    Lease,
    CancelLease,
    MassTransfer,
    Register,
    Sponsorship,
    CancelSponsorship,
    Transfer,
};

export function fromData(data: ITxJSON): Transaction {
    switch (data.type) {
        case 4:
            return Transfer.fromData(data);
        case 8:
            return Lease.fromData(data);
        case 9:
            return CancelLease.fromData(data);
        case 11:
            return MassTransfer.fromData(data);
        case 12:
            return Data.fromData(data);
        case 15:
            return Anchor.fromData(data);
        case 16:
            return Association.fromData(data);
        case 17:
            return Association.fromData(data);
        case 18:
            return Sponsorship.fromData(data);
        case 19:
            return CancelSponsorship.fromData(data);
        case 20:
            return Register.fromData(data);
        default:
            throw Error("Transaction type not recognized");
    }
}
