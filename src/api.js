const axios = require("axios");

module.exports = {
	sendSms: async (no, text) => {
		return await axios.post("https://api.mainapi.net/smspostpaid/1.0.0/messages", {
			"msisdn": no,
			"content": text
		}, {
			headers: {
				"Authorization": "Bearer 07a7b0cde72e41a9f1d7aeaf5ce43dde",
				"Content-Type": "application/json",
				"X-MainAPI-Username": "tmoney",
				"X-MainAPI-Password": "tmoney2017",
				"X-MainAPI-Senderid": "t-money"
			}
		})
			.then( response => {
		    return response.data.code;
		  })
		  .catch( error => {
		    console.log(error);
		  });
	},

	shortLink: async url => {
		return await axios.post("https://api-ssl.bitly.com/v4/bitlinks", {
			"long_url": url
		}, {
			headers: {
				"Authorization": "Bearer 8330f29978b49bc281502e1a2d576a526ceb1f51",
				"Content-Type": "application/json"
			}
		})
			.then( response => {
		    return response.data.link;
		  })
		  .catch( error => {
		    console.log(error);
		  });
	}
}