import { data } from "@lto-network/lto-transactions";
import { resolve } from "path/posix";
import { postData } from "../api/public-node/transactions.x";
export { PublicNode };
import { Anchor } from "./transactions/anchor";
import { Transfer } from "./transactions/transfer";
import { Association } from "./transactions/association";
import { Lease } from "./transactions/lease";
import { CancelLease } from "./transactions/cancelLease";
import { Sponsorship } from "./transactions/sponsorship";
import { CancelSponsorship } from "./transactions/CancelSponsorship";
import { MassTransfer } from "./transactions/massTransfer";
const axios = require('axios').default;

class PublicNode {

  url: string;
  apiKey: string;

  constructor(url: string, apiKey: string = '') {
    this.url = url;
    this.apiKey = apiKey;
  }

  wrapper(api, postData = '', host = null, header = null) {
    if (header == null)
      header = {};

    if (host == null)
      host = this.url;

    if (this.apiKey != '')
      header = { "X-API-Key": this.apiKey }

    if (postData) {
      return axios.post(
        host.concat(api),
        postData,
        {
          baseURL: this.url,
          headers: Object.assign({}, header, { 'content-type': 'application/json' }),
        })
        .then(function (response) {
          let data = response.data
          switch (data.type) {
            case 15:
              return new Anchor(data['anchor']).fromData(data)
            case 4:
              return new Transfer(data['recipient'], data['amount']).fromData(data)
            case 16:
              return new Association('', '', '').fromData(data);
            case 17:
              return new Association('', '').fromData(data);
            case 8:
              return new Lease('', 1).fromData(data);
            case 9:
              return new CancelLease('').fromData(data);
            case 18:
              return new Sponsorship(data['recipient']).fromData(data);
            case 19:
              return new CancelSponsorship(data['recipient']).fromData(data);
            case 11:
              return new MassTransfer('').fromData(data)
            default:
              console.error("Transaction type not recognized")
          }
        })
        .catch(function (error) {
          console.error(error.response);
          return false
        });
    } else {
      const config = { headers: Object.assign({}, header, { 'content-type': 'application/json' }) };
      return axios.get(host.concat(api), config)
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          console.log(error.data);
          return false;
        })
    }
  }

  async broadcast(transaction) {
    let data = JSON.stringify(transaction.toJson());
    return await this.wrapper('/transactions/broadcast', data);
  }

  nodeStatus() {
    return this.wrapper('/node/status');
  }
}