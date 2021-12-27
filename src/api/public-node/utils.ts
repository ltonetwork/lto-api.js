import { createFetchWrapper, VERSIONS, processJSON } from "../../utils/request";


const fetch = createFetchWrapper(VERSIONS.V1, processJSON);


export default {

	time() {
		return fetch("/utils/time").then((t) => t.system);
	},

	script: {

		compile(code: string): Promise<string> {
			return fetch("/utils/script/compile", {
				method: "POST",
				body: code
			}).then((response) => {
				return response.script;
			});
		}

	}

};