import { data } from "@lto-network/lto-transactions";
import { resolve } from "path/posix";
import { postData } from "../api/public-node/transactions.x";
export {PublicNode};
import { Anchor } from "./transactions/anchor";
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
          .then(function (response) {
            let data = response.data
            switch(data.type) {
              case 15:
                return new Anchor('').fromData(data)
              case 5:
                  break;
              default:
                console.error("Transaction type not recognized")
            }
          })
          .catch(function (error) {
            console.error(error.response);
            return false
          });
      }
      else{
        const config = {headers : Object.assign({}, header, {'content-type': 'application/json'})}; 
        return axios.get(host.concat(api), config)
          .then(function (response){
            return response.data;
          })
          .catch(function (error) {
            console.error(error.response);
            return false;
           })
      }
    }

    async broadcast(transaction){
      let data = JSON.stringify(transaction.toJson());
      return await this.wrapper('/transactions/broadcast', data);
    }

    nodeStatus(){
      return this.wrapper('/node/status');
    }
}