import { Schema, NumberPart, ObjectPart, StringPart, ArrayPart, BasePart } from 'ts-api-validator';
import { TX_TYPE_MAP } from '../../signatureFactory/SignatureFactory';

import schemaFields from '../schemaFields';
import { createFetchWrapper, processJSON, VERSIONS, wrapTxRequest, TTransactionRequest } from '../../utils/request';
import { createRemapper} from '../../utils/remap';
import * as constants from '../../constants';
import config from '../../config';

const fetch = createFetchWrapper(VERSIONS.V1, processJSON);

class AnyPart extends BasePart<any> {
  protected getValue<T>(data: T): T {
    return data;
  }
}

/* TRANSFER */

export const transferSchema = new Schema({
  type: ObjectPart,
  required: true,
  content: {
    senderPublicKey: schemaFields.publicKey,
    recipient: schemaFields.recipient,
    amount: {
      type: NumberPart,
      required: true
    },
    fee: schemaFields.fee,
    attachment: {
      type: StringPart,
      required: false,
      defaultValue: ''
    },
    timestamp: schemaFields.timestamp
  }
});

export const preTransfer = (data) => transferSchema.parse(data);
export const postTransfer = createRemapper({
  transactionType: null,
  attachment: {
    from: 'string',
    to: 'base58'
  },
  type: constants.TRANSACTION_TYPE_NUMBER.TRANSFER,
  version: constants.TRANSACTION_TYPE_VERSION.TRANSFER
});

export const sendTransferTx = wrapTxRequest(TX_TYPE_MAP.transfer, preTransfer, postTransfer,(postParams) => {
  return fetch(constants.BROADCAST_PATH, postParams);
}, true) as TTransactionRequest;

/* LEASE */

export const leaseSchema = new Schema({
  type: ObjectPart,
  required: true,
  content: {
    senderPublicKey: schemaFields.publicKey,
    recipient: schemaFields.recipient,
    amount: {
      type: NumberPart,
      required: true
    },
    fee: schemaFields.fee,
    timestamp: schemaFields.timestamp
  }
});

export const preLease = (data) => leaseSchema.parse(data);
export const postLease = createRemapper({
  type: constants.TRANSACTION_TYPE_NUMBER.LEASE,
  version: constants.TRANSACTION_TYPE_VERSION.LEASE
});

export const sendLeaseTx = wrapTxRequest(TX_TYPE_MAP.lease, preLease, postLease, (postParams) => {
  return fetch(constants.BROADCAST_PATH, postParams);
}, true) as TTransactionRequest;


/* CANCEL LEASING */

export const cancelLeasingSchema = new Schema({
  type: ObjectPart,
  required: true,
  content: {
    senderPublicKey: schemaFields.publicKey,
    transactionId: {
      type: StringPart,
      required: true
    },
    fee: schemaFields.fee,
    timestamp: schemaFields.timestamp,
    chainId: {
      type: NumberPart,
      required: true,
      parseValue: () => config.getNetworkByte()
    }
  }
});

export const preCancelLeasing = (data) => cancelLeasingSchema.parse(data);
export const postCancelLeasing = createRemapper({
  transactionId: 'txId',
  type: constants.TRANSACTION_TYPE_NUMBER.CANCEL_LEASING,
  version: constants.TRANSACTION_TYPE_VERSION.CANCEL_LEASING,
});

export const sendCancelLeasingTx = wrapTxRequest(TX_TYPE_MAP.cancelLeasing, preCancelLeasing, postCancelLeasing, (postParams) => {
  return fetch(constants.BROADCAST_PATH, postParams);
}, true) as TTransactionRequest;

/* CANCEL LEASING V2 */

export const cancelLeasingSchemaV2 = new Schema({
  type: ObjectPart,
  required: true,
  content: {
    senderPublicKey: schemaFields.publicKey,
    transactionId: {
      type: StringPart,
      required: true
    },
    fee: schemaFields.fee,
    timestamp: schemaFields.timestamp,
    chainId: {
      type: NumberPart,
      required: true,
      parseValue: () => config.getNetworkByte()
    }
  }
});

export const preCancelLeasingV2 = (data) => cancelLeasingSchemaV2.parse(data);
export const postCancelLeasingV2 = createRemapper({
  transactionId: 'leaseId',
  type: constants.TRANSACTION_TYPE_NUMBER.CANCEL_LEASING,
  version: constants.TRANSACTION_TYPE_VERSION.CANCEL_LEASING
});

export const sendCancelLeasingTxV2 = wrapTxRequest(TX_TYPE_MAP.cancelLeasing, preCancelLeasingV2, postCancelLeasingV2, (postParams) => {
  return fetch(constants.BROADCAST_PATH, postParams);
}, true) as TTransactionRequest;

/* MASS TRANSFER */

export const massTransferSchema = new Schema({
  type: ObjectPart,
  required: true,
  content: {
    senderPublicKey: schemaFields.publicKey,
    transfers: {
      type: ArrayPart,
      content: {
        type: ObjectPart,
        required: true,
        content: {
          recipient: schemaFields.recipient,
          amount: {
            type: NumberPart,
            required: true
          }
        }
      },
      defaultValue: []
    },
    timestamp: schemaFields.timestamp,
    fee: schemaFields.fee,
    attachment: {
      // TODO : make it possible to pass a byte array
      type: StringPart,
      required: false,
      defaultValue: ''
    }
  }
});

export const preMassTransfer = (data) => massTransferSchema.parse(data);
export const postMassTransfer = createRemapper({
  transactionType: null,
  attachment: {
    from: 'string',
    to: 'base58'
  },
  type: constants.TRANSACTION_TYPE_NUMBER.MASS_TRANSFER,
  version: constants.TRANSACTION_TYPE_VERSION.MASS_TRANSFER
});

export const sendMassTransferTx = wrapTxRequest(TX_TYPE_MAP.massTransfer, preMassTransfer, postMassTransfer, (postParams) => {
  return fetch(constants.BROADCAST_PATH, postParams);
}, true) as TTransactionRequest;


/* DATA */

export const dataSchema = new Schema({
  type: ObjectPart,
  required: true,
  content: {
    senderPublicKey: schemaFields.publicKey,
    data: {
      type: ArrayPart,
      content: {
        type: ObjectPart,
        required: true,
        content: {
          type: {
            type: StringPart,
            required: true
          },
          key: {
            type: StringPart,
            required: true
          },
          value: {
            type: AnyPart,
            required: true
          }
        }
      },
      defaultValue: []
    },
    timestamp: schemaFields.timestamp,
    fee: schemaFields.fee // TODO : validate against the transaction size in bytes
  }
});

export const preData = (data) => dataSchema.parse(data);
export const postData = createRemapper({
  transactionType: null,
  type: constants.TRANSACTION_TYPE_NUMBER.DATA,
  version: constants.TRANSACTION_TYPE_VERSION.DATA
});

export const sendDataTx = wrapTxRequest(TX_TYPE_MAP.data, preData, postData,(postParams) => {
  return fetch(constants.BROADCAST_PATH, postParams);
}, true);

/* Anchor */

export const anchorSchema = new Schema({
  type: ObjectPart,
  required: true,
  content: {
    senderPublicKey: schemaFields.publicKey,
    anchors: {
      type: ArrayPart,
      content: {
        type: StringPart,
        required: true
      },
      defaultValue: []
    },
    timestamp: schemaFields.timestamp,
    fee: schemaFields.fee
  }
});

export const preAnchor = (data) => anchorSchema.parse(data);
export const postAnchor = createRemapper({
  transactionType: null,
  type: constants.TRANSACTION_TYPE_NUMBER.ANCHOR,
  version: constants.TRANSACTION_TYPE_VERSION.ANCHOR
});

export const sendAnchorTx = wrapTxRequest(TX_TYPE_MAP.anchor, preAnchor, postAnchor,(postParams) => {
  return fetch(constants.BROADCAST_PATH, postParams);
}, true);

/* SET SCRIPT */

export const setScriptSchema = new Schema({
  type: ObjectPart,
  required: true,
  content: {
    senderPublicKey: schemaFields.publicKey,
    script: {
      type: StringPart,
      required: false
    },
    chainId: {
      type: NumberPart,
      required: true,
      parseValue: () => config.getNetworkByte()
    },
    timestamp: schemaFields.timestamp,
    fee: schemaFields.fee // TODO : validate against the transaction size in bytes
  }
});

export const preSetScript = (data) => setScriptSchema.parse(data);
export const postSetScript = createRemapper({
  type: constants.TRANSACTION_TYPE_NUMBER.SET_SCRIPT,
  version: constants.TRANSACTION_TYPE_VERSION.SET_SCRIPT
});

export const sendSetScriptTx = wrapTxRequest(TX_TYPE_MAP.setScript, preSetScript, postSetScript, (postParams) => {
  return fetch(constants.BROADCAST_PATH, postParams);
}, true) as TTransactionRequest;

/* Invoke and Revoke Assoc */

export const assocSchema = new Schema({
  type: ObjectPart,
  required: true,
  content: {
    senderPublicKey: schemaFields.publicKey,
    hash: {
      type: StringPart,
      required: false,
      defaultValue: ''
    },
    party: {
      type: StringPart,
      required: true
    },
    associationType: {
      type: NumberPart,
      required: false,
      defaultValue: 0
    },
    chainId: {
      type: NumberPart,
      required: true,
      parseValue: () => config.getNetworkByte()
    },
    timestamp: schemaFields.timestamp,
    fee: schemaFields.fee
  }
});

export const preAssoc = (data) => assocSchema.parse(data);
export const postInvokeAssoc = createRemapper({
  transactionType: null,
  type: constants.TRANSACTION_TYPE_NUMBER.INVOKE_ASSOCIATION,
  version: constants.TRANSACTION_TYPE_VERSION.INVOKE_ASSOCIATION,
});

export const sendInvokeAssocTx = wrapTxRequest(TX_TYPE_MAP.invokeAssociation, preAssoc, postInvokeAssoc,(postParams) => {
  return fetch(constants.BROADCAST_PATH, postParams);
}, true);


export const postRevokeAssoc = createRemapper({
  transactionType: null,
  type: constants.TRANSACTION_TYPE_NUMBER.REVOKE_ASSOCIATION,
  version: constants.TRANSACTION_TYPE_VERSION.REVOKE_ASSOCIATION,
});

export const sendRevokeAssocTx = wrapTxRequest(TX_TYPE_MAP.revokeAssociation, preAssoc, postRevokeAssoc,(postParams) => {
  return fetch(constants.BROADCAST_PATH, postParams);
}, true);

/* SPONSOR */

export const sponsorSchema = new Schema({
  type: ObjectPart,
  required: true,
  content: {
    chainId: {
      type: NumberPart,
      required: true,
      parseValue: () => config.getNetworkByte()
    },
    senderPublicKey: schemaFields.publicKey,
    recipient: schemaFields.recipient,
    fee: schemaFields.fee,
    timestamp: schemaFields.timestamp
  }
});

export const preSponsor = (data) => sponsorSchema.parse(data);
export const postSponsor = createRemapper({
  transactionType: null,
  type: constants.TRANSACTION_TYPE_NUMBER.SPONSOR,
  version: constants.TRANSACTION_TYPE_VERSION.SPONSOR
});

export const sendSponsorTx = wrapTxRequest(TX_TYPE_MAP.sponsor, preSponsor, postSponsor,(postParams) => {
  return fetch(constants.BROADCAST_PATH, postParams);
}, true) as TTransactionRequest;

/* CANCEL SPONSOR */

export const cancelSponsorSchema = new Schema({
  type: ObjectPart,
  required: true,
  content: {
    chainId: {
      type: NumberPart,
      required: true,
      parseValue: () => config.getNetworkByte()
    },
    senderPublicKey: schemaFields.publicKey,
    recipient: schemaFields.recipient,
    fee: schemaFields.fee,
    timestamp: schemaFields.timestamp
  }
});

export const preCancelSponsor = (data) => cancelSponsorSchema.parse(data);
export const postCancelSponsor = createRemapper({
  transactionType: null,
  type: constants.TRANSACTION_TYPE_NUMBER.CANCEL_SPONSOR,
  version: constants.TRANSACTION_TYPE_VERSION.CANCEL_SPONSOR
});

export const sendCancelSponsorTx = wrapTxRequest(TX_TYPE_MAP.cancelSponsor, preCancelSponsor, postCancelSponsor,(postParams) => {
  return fetch(constants.BROADCAST_PATH, postParams);
}, true) as TTransactionRequest;
