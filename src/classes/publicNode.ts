import { data } from "@lto-network/lto-transactions";
import { resolve } from "path/posix";
import { postData } from "../api/public-node/transactions.x";
export {PublicNode};
import { Anchor } from "./transactions/anchor";
import { Transfer } from "./transactions/transfer";
import { Association } from "./transactions/association";
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
              case 4:
                return new Transfer(data['recipient'], data['amount']).fromData(data)
              case 16:
                  return new Association('','', '').fromData(data);
              case 17:
                  return new Association('','').fromData(data);
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
            console.log(error.data);
            return false;
           })
      }
    }

    async broadcast(transaction){
      let data = JSON.stringify(transaction.toJson());
      console.log(data)
      return await this.wrapper('/transactions/broadcast', data);
    }

    nodeStatus(){
      return this.wrapper('/node/status');
    }
}