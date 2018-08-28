import { BooleanPart, NumberPart, StringPart } from 'ts-api-validator';
import * as constants from '../constants';


export default {

  publicKey: {
    type: StringPart,
    required: true
  },

  assetId: {
    type: StringPart,
    required: true
  },

  fee: {
    type: NumberPart,
    required: false,
    defaultValue: constants.MINIMUM_FEE
  },

  issueFee: {
    type: NumberPart,
    required: false,
    defaultValue: constants.MINIMUM_ISSUE_FEE
  },

  matcherFee: {
    type: NumberPart,
    required: false,
    defaultValue: constants.MINIMUM_MATCHER_FEE
  },

  recipient: {
    type: StringPart,
    required: true
  },

  reissuable: {
    type: BooleanPart,
    required: false,
    defaultValue: false
  },

  timestamp: {
    type: NumberPart,
    required: true
  }

}