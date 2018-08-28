import { createFetchWrapper, PRODUCTS, VERSIONS, processJSON, POST_TEMPLATE } from '../../utils/request';
import LTOError from '../../errors/LTOError';
import * as constants from '../../constants';
import config from '../../config';


const fetch = createFetchWrapper(PRODUCTS.NODE, VERSIONS.V1, processJSON);


export default {

  get(id: string) {
    return fetch(`/transactions/info/${id}`);
  },

  getList(address: string, limit: number = config.getRequestParams().limit) {
    // In the end of the line a strange response artifact is handled
    return fetch(`/transactions/address/${address}/limit/${limit}`).then((array) => array[0]);
  },

  utxSize() {
    return fetch('/transactions/unconfirmed/size');
  },

  utxGet(id: string) {
    return fetch(`/transactions/unconfirmed/info/${id}`);
  },

  utxGetList() {
    return fetch('/transactions/unconfirmed');
  }

};