import { createFetchWrapper, VERSIONS, processJSON, POST_TEMPLATE } from "../../utils/request";
import LTOError from "../../errors/LTOError";
import * as constants from "../../constants";
import config from "../../config";
import * as requests from "./transactions.x";

const fetch = createFetchWrapper(VERSIONS.V1, processJSON);

export default {

	get(id: string) {
		return fetch(`/transactions/info/${id}`);
	},

	getList(address: string, limit: number = config.getRequestParams().limit) {
		// In the end of the line a strange response artifact is handled
		return fetch(`/transactions/address/${address}/limit/${limit}`).then((array) => array[0]);
	},

	utxSize() {
		return fetch("/transactions/unconfirmed/size");
	},

	utxGet(id: string) {
		return fetch(`/transactions/unconfirmed/info/${id}`);
	},

	utxGetList() {
		return fetch("/transactions/unconfirmed");
	},

	broadcast(type: string, data, keys) {
		switch (type) {
		case constants.TRANSACTION_TYPE.TRANSFER:
			return requests.sendTransferTx(data, keys);
		case constants.TRANSACTION_TYPE.LEASE:
			return requests.sendLeaseTx(data, keys);
		case constants.TRANSACTION_TYPE.CANCEL_LEASING:
			return requests.sendCancelLeasingTxV2(data, keys);
		case constants.TRANSACTION_TYPE.MASS_TRANSFER:
			return requests.sendMassTransferTx(data, keys);
		case constants.TRANSACTION_TYPE.DATA:
			return requests.sendDataTx(data, keys);
		case constants.TRANSACTION_TYPE.ANCHOR:
			return requests.sendAnchorTx(data, keys);
		case constants.TRANSACTION_TYPE.SET_SCRIPT:
			return requests.sendSetScriptTx(data, keys);
		case constants.TRANSACTION_TYPE.INVOKE_ASSOCIATION:
			return requests.sendInvokeAssocTx(data, keys);
		case constants.TRANSACTION_TYPE.REVOKE_ASSOCIATION:
			return requests.sendRevokeAssocTx(data, keys);
		case constants.TRANSACTION_TYPE.SPONSOR:
			return requests.sendSponsorTx(data, keys);
		case constants.TRANSACTION_TYPE.CANCEL_SPONSOR:
			return requests.sendCancelSponsorTx(data, keys);
		default:
			throw new LTOError(`Wrong transaction type: ${type}`, data);
		}
	}

};
