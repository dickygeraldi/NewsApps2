const
	express = require("express"),
	moment = require("moment"),
	router = express.Router(),
	conn = require("../bin/conn.js");

router.get("/", function(req, res, next) {
	
	if (req.query.start && req.query.end && (new Date(req.query.start)).getTime() > 0 && (new Date(req.query.end)).getTime() > 0) {
		const date = {
			x: req.query.start,
			y: req.query.end
		}
		console.log(date);
		conn.promise().query(`SELECT i.invoice_number as invoiceNumber, (SELECT value_content FROM invoice_production_additional_value WHERE invoice_id = i.id AND value_label = 'indihomeNumber') as indihomeNumber, (SELECT value_content FROM invoice_production_order_value WHERE invoice_id = i.id AND value_label = 'productName') as namaProduct, i.merchant_product_code as kodePembayaran, p.product_name as productName, t.waktu_transaksi as waktuTransaksi, i.status_invoice as statusInvoice, CASE WHEN (i.status_invoice = 'PAID' AND (SELECT value_content FROM invoice_production_additional_value WHERE invoice_id = i.id AND value_label = 'systemReference') IS NULL) THEN 'PAID - FLAGGING NOT FOUND (System Reff is null)' WHEN (SELECT status FROM log_trems WHERE  system_reference = (SELECT value_content FROM invoice_production_additional_value WHERE invoice_id = i.id AND value_label = 'systemReference') AND log_trems_type = 'RESPONSE_FLAGGING' ) IS NULL THEN "PAID - STATUS FLAGGING NULL" WHEN (SELECT status FROM log_trems WHERE  system_reference = (SELECT value_content FROM invoice_production_additional_value WHERE invoice_id = i.id AND value_label = 'systemReference') AND log_trems_type = 'RESPONSE_FLAGGING' ) = "102" THEN "PAID - 102: Gagal Flagging" WHEN (SELECT status FROM log_trems WHERE  system_reference = (SELECT value_content FROM invoice_production_additional_value WHERE invoice_id = i.id AND value_label = 'systemReference') AND log_trems_type = 'RESPONSE_FLAGGING' ) = "SUSPECT" THEN "SUSPECT" END AS codeTransaction FROM invoice_production i LEFT JOIN transaksi_production t ON t.invoice_id = i.id LEFT JOIN merchant_product p ON p.product_code = i.merchant_product_code  WHERE (SELECT status FROM log_trems lt inner join invoice_production_additional_value lpav on lt.system_reference = lpav.value_content  WHERE log_trems_type = 'RESPONSE_FLAGGING' AND lpav.invoice_id = i.id) NOT IN ('PAID') AND t.waktu_transaksi >= '${date.x}' AND t.waktu_transaksi <= '${date.y}' ORDER BY t.waktu_transaksi'`)
			.then( ([rows,fields]) => {
			 	res.render("report", {rows: rows, date: date});
			})
			.catch(console.log)
	} else {
		conn.promise().query(`SELECT i.invoice_number as invoiceNumber, (SELECT value_content FROM invoice_production_additional_value WHERE invoice_id = i.id AND value_label = 'indihomeNumber') as indihomeNumber, (SELECT value_content FROM invoice_production_order_value WHERE invoice_id = i.id AND value_label = 'productName') as namaProduct, i.merchant_product_code as kodePembayaran, p.product_name as productName, t.waktu_transaksi as waktuTransaksi, i.status_invoice as statusInvoice, CASE WHEN (i.status_invoice = 'PAID' AND (SELECT value_content FROM invoice_production_additional_value WHERE invoice_id = i.id AND value_label = 'systemReference') IS NULL) THEN 'PAID - FLAGGING NOT FOUND (System Reff is null)' WHEN (SELECT status FROM log_trems WHERE  system_reference = (SELECT value_content FROM invoice_production_additional_value WHERE invoice_id = i.id AND value_label = 'systemReference') AND log_trems_type = 'RESPONSE_FLAGGING' ) IS NULL THEN "PAID - STATUS FLAGGING NULL" WHEN (SELECT status FROM log_trems WHERE  system_reference = (SELECT value_content FROM invoice_production_additional_value WHERE invoice_id = i.id AND value_label = 'systemReference') AND log_trems_type = 'RESPONSE_FLAGGING' ) = "102" THEN "PAID - 102: Gagal Flagging" WHEN (SELECT status FROM log_trems WHERE  system_reference = (SELECT value_content FROM invoice_production_additional_value WHERE invoice_id = i.id AND value_label = 'systemReference') AND log_trems_type = 'RESPONSE_FLAGGING' ) = "SUSPECT" THEN "SUSPECT" END AS codeTransaction FROM invoice_production i LEFT JOIN transaksi_production t ON t.invoice_id = i.id LEFT JOIN merchant_product p ON p.product_code = i.merchant_product_code  WHERE (SELECT status FROM log_trems lt inner join invoice_production_additional_value lpav on lt.system_reference = lpav.value_content WHERE log_trems_type = 'RESPONSE_FLAGGING' AND lpav.invoice_id = i.id) NOT IN ('PAID') ORDER BY t.waktu_transaksi`)
		.then( ([rows,fields]) => {
		 	res.render("index", {rows: rows});
		})
		.catch(console.log)
	}
});

module.exports = router;
