import { data } from "@lto-network/lto-transactions";
import { resolve } from "path/posix";
import { postData } from "../api/public-node/transactions.x";

export {PublicNode};
const axios = require('axios').default;

class PublicNode {

    url: string;
    apiKey: string;

    constructor(url: string, apiKey: string = '') {
      this.url = url;
      this.apiKey = apiKey;
    }

    wrapper(api, postData='', host=null, header=null){

      if (header == null)
        header = {};

      if (host == null)
        host = this.url;

      if (this.apiKey != '')
        header = {"X-API-Key": this.apiKey}

      if (postData){
        return axios.post(
          host.concat(api), 
          postData, 
          {
          baseURL: this.url,
          headers:Object.assign({}, header, {'content-type': 'application/json'}),
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          });
      }
    }

    async broadcast(transaction){
      let data = JSON.stringify(transaction.toJson());
      let response = await this.wrapper('/transactions/broadcast', data).then((response)=>{return response.data});
      // return the response from data from lto
    }

    other(input, data){
      console.log(input + 1)
      console.log(data)
    }

}