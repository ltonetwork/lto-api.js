import { createFetchWrapper, VERSIONS, processJSON } from '../../utils/request';


const fetch = createFetchWrapper(VERSIONS.V1, processJSON);


export default {

  get(signature: string) {
    return fetch(`/blocks/signature/${signature}`);
  },

  at(height: number) {
    return fetch(`/blocks/at/${height}`);
  },

  first() {
    return fetch('/blocks/first');
  },

  last() {
    return fetch('/blocks/last');
  },

  height() {
    return fetch('/blocks/height');
  }

};