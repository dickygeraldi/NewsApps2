const { assert } = require('chai');
const { sendSms, shortLink } = require("../src/api");

describe("SMS", () => {
	it("mengirim sms", () => {
		(async () => {
			assert.equal(await sendSms("085362960003", "test @rsmnarts"), 1);
		})();
	});
});