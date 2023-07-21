import Transaction from './Transaction.js';
import Anchor from './Anchor.js';
import Association from './Association.js';
import RevokeAssociation from './RevokeAssociation.js';
import Data from './Data.js';
import Lease from './Lease.js';
import CancelLease from './CancelLease.js';
import MassTransfer from './MassTransfer.js';
import Register from './Register.js';
import Sponsorship from './Sponsorship.js';
import CancelSponsorship from './CancelSponsorship.js';
import Transfer from './Transfer.js';
import Burn from './Burn.js';
import MappedAnchor from './MappedAnchor.js';
import Statement from './Statement.js';
import { ITxJSON } from '../../interfaces';

export {
  Transaction,
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
  Burn,
  MappedAnchor,
  Statement,
};

export function txFromData(data: ITxJSON): Transaction {
  switch (data.type) {
    case 4:
      return Transfer.from(data);
    case 8:
      return Lease.from(data);
    case 9:
      return CancelLease.from(data);
    case 11:
      return MassTransfer.from(data);
    case 12:
      return Data.from(data);
    case 15:
      return Anchor.from(data);
    case 16:
      return Association.from(data);
    case 17:
      return RevokeAssociation.from(data);
    case 18:
      return Sponsorship.from(data);
    case 19:
      return CancelSponsorship.from(data);
    case 20:
      return Register.from(data);
    case 21:
      return Burn.from(data);
    case 22:
      return MappedAnchor.from(data);
    case 23:
      return Statement.from(data);
    default:
      throw Error('Transaction type not recognized');
  }
}
