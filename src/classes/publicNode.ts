export { PublicNode };
import { LTO } from "../LTO";
import config from "../config";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require("axios").default;

class PublicNode {

	url: string;
	apiKey: string;

	constructor(url: string, apiKey = "") {
		this.url = url;
		this.apiKey = apiKey;
	}

	wrapper(api, postData = "", host = null, header = null) {
		if (header == null)
			header = {};

		if (host == null)
			host = this.url;

		if (this.apiKey != "")
			header = { "X-API-Key": this.apiKey };

		if (postData) {
			return axios.post(
				host.concat(api),
				postData,
				{
					baseURL: this.url,
					headers: Object.assign({}, header, { "content-type": "application/json" }),
				})
				.then(function (response) {
					return response.data;
				})
				.catch(function (error) {
					console.error(error.response);
					return false;
				});
		} else {
			const config = { headers: Object.assign({}, header, { "content-type": "application/json" }) };
			return axios.get(host.concat(api), config)
				.then(function (response) {
					return response.data;
				})
				.catch(function (error) {
					console.log(error.data);
					return false;
				});
		}
	}

	async broadcast(transaction) {
		const data = JSON.stringify(transaction.toJson());
		const response = await this.wrapper("/transactions/broadcast", data);
		return await new LTO(String.fromCharCode(config.getNetworkByte())).fromData(response);
	}

	async nodeStatus() {
		return await this.wrapper("/node/status");;
	}

	async nodeVersion() {
		return await this.wrapper("/node/version");;
	}

	async getBalance(address: string) {
		return await this.wrapper(`/addresses/balance/${address}`);
	}
}