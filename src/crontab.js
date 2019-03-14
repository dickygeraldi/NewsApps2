require('dotenv').config();
let z=1;
const 
	mysql = require("mysql2"),
	schedule = require("node-schedule"),
	moment = require("moment"),
	conn = require("../bin/conn"),
	{ sendSms, shortLink } = require("./api"),
	noSms = ["085362960003", "0895351025599"];

const checkDataFail = async (start, end) => {
	const result = await conn.promise().query(`SELECT count(*) as jmlh FROM invoice_production i LEFT JOIN transaksi_production t ON t.invoice_id = i.id LEFT JOIN merchant_product p ON p.product_code = i.merchant_product_code  WHERE (SELECT status FROM log_trems lt inner join invoice_production_additional_value lpav on lt.system_reference = lpav.value_content WHERE log_trems_type = 'RESPONSE_FLAGGING' AND lpav.invoice_id = i.id) NOT IN ('PAID') AND t.waktu_transaksi >= '${start}' AND t.waktu_transaksi <= '${end}' ORDER BY t.waktu_transaksi`)
		.then( ([rows,fields]) => {
    	return rows[0].jmlh;
    })
    .catch(console.log);

  return result;
}

const j = schedule.scheduleJob("*/5 * * * * *", () => {
	const
		x = moment().format("YYYY-MM-DD H:mm:ss"),
		y = moment().subtract(30, 'minutes').format("YYYY-MM-DD H:mm:ss"),
		url = process.env.APP_URL,
		link = `http://${url}?start=${x}&end=${y}`;

	(async () => {

		const data = await checkDataFail();
		if (data > 0) {
			let resultSms = "";
			const slink = await shortLink(link);
			if(slink) {
				const text = `Halo, ada terdapat ${data} data yang transaksinya masih perlu diproses. Silahkan cek pada link ${slink} ini untuk melihat detailnya.`;
				noSms.map(async no => {
					resultSms = await sendSms(no, text) ? "SMS SENT" : "SMS FAIL";
				})
			}
			console.log(`${z++}. [${x}] - SUKSES (${link}) - ${resultSms}`);
		} else {
			console.log(`${z++}. [${x}] - GAGAL`);
		}

	})()
});


['SIGINT', 'SIGTERM']
  .forEach(signal => process.on(signal, () => {
    console.log('Closing connection.');
	  conn.end(() => {
	    console.log("Connection closed.");
	    process.exit(1);
	  });
  }));