import Transaction from './Transaction';
import Anchor from './Anchor';
import Association from './Association';
import RevokeAssociation from './RevokeAssociation';
import Data from './Data';
import Lease from './Lease';
import CancelLease from './CancelLease';
import MassTransfer from './MassTransfer';
import Register from './Register';
import Sponsorship from './Sponsorship';
import CancelSponsorship from './CancelSponsorship';
import Transfer from './Transfer';
import Burn from './Burn';
import MappedAnchor from './MappedAnchor';
import Statement from './Statement';
import { ITxJSON } from '../types';

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
