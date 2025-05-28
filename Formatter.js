/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("zcus.sd.pn.salesorder.create.util.Formatter");
jQuery.sap.require("sap.ui.thirdparty.datajs");
jQuery.sap.require("sap.ca.ui.model.format.DateFormat");
jQuery.sap.require("sap.ca.ui.model.format.NumberFormat");
jQuery.sap.require("sap.ca.ui.model.format.AmountFormat");
jQuery.sap.require("sap.ca.ui.model.format.QuantityFormat");
zcus.sd.pn.salesorder.create.util.Formatter = {
	convertDateToLocaleMedium: function (v) {
		var d = sap.ca.ui.model.format.DateFormat.getDateInstance({
			style: "medium"
		});
		var D = d.parse(v);
		return d.format(D);
	},
	convertFloatToLocaleNoDecimalHandling: function (v) {
		var l = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
		var n = sap.ca.ui.model.format.NumberFormat.getInstance({
			decimals: "0"
		}, l);
		return n.format(v);
	},
	formatItemNumber: function (i) {
		var a = sap.ui.core.format.NumberFormat.getIntegerInstance({
			minIntegerDigits: 6,
			maxIntegerDigits: 6
		});
		return a.format(10 * i);
	},
	formatOrderDate: function (d) {
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("ORDERED", [d]);
	},
	zformatOrderDate: function (d) {
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("ZORDERED", [d]);
	},
	formatRequestDate: function (d) {
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("REQUESTED", [d]);
	},
	zformatRequestDate: function (d) {
		if (d == "Jan 1, 2000" || d == "01.01.2000" || d == "1 de jan de 2000") {
			return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("ZREQUESTED", ["Sem fatura"]);
		}
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("ZREQUESTED", [d]);
	},
	formatSOTo: function (c) {
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("SHIP_TO", [c]);
	},
	formatCurrencyPerUnit: function (c, u) {
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("CURRENCY_PER_UOM_EX", [c, u]);
	},
	zformatCurrencyPerUnit: function (c, u) {
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("ZCURRENCY_PER_UOM_EX", [c, u]);
	},
	formatAddress: function () {
		if (arguments.length === 0) {
			return "";
		}
		if (arguments.length === 1) {
			return arguments[arguments.length - 1];
		}
		var i = 0;
		var a = arguments[i];
		for (i = 1; i < arguments.length; i++) {
			if (arguments[i]) {
				a = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("ADDRESS_ELEMENT", [a, arguments[i]]);
			}
		}
		return a;
	},
	formatProductNoId: function (i) {
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("PRODUCT_NO_EX", [i]);
	},
	formatPrice: function (p, c) {
		return sap.ca.ui.model.format.AmountFormat.getInstance(c).format(p);
	},
	formatProductIDDesc: function (p, a) {
		if (typeof p === "undefined" || typeof a === "undefined") {
			return "";
		}
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("PRODUCT_ID_DESCRIPTION", [p, a]);
	},
	stripLeadingZeros: function (v) {
		if (typeof v === "string") {
			return parseInt(v, 10);
		}
		return v;
	},
	getTextPar: function (k, p) {
		if (!p) {
			p = "";
		}
		return jQuery.sap.formatMessage(k, [p]);
	},
	formatItemNumberProductName: function (i, p) {
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("ITEMNO_PRODUCTNAME", [zcus.sd.pn.salesorder.create.util.Formatter
			.stripLeadingZeros(i), p
		]);
	},
	formatSignQuantity: function (s) {
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("SIGNQUANTITY", [s]);
	},
	formatQuantityStatusA: function () {
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("QUANTITY_STATUS_A");
	},
	formatDeliveryStatusA: function () {
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("DELIVERY_STATUS_A");
	},
	formatDeliveryStatusC: function () {
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("DELIVERY_STATUS_C");
	},
	formatQuantityUnitofMeasure: function (q, u) {
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("QUANTITY_UOM", [sap.ca.ui.model.format.QuantityFormat.FormatQuantityStandard(
			q, u, 0), u]);
	},
	zformatQuantityUnitofMeasure: function (q, u) {
		if (!q) {
			q = "0";
		}
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("QUANTITY_UOM", [sap.ca.ui.model.format.QuantityFormat.FormatQuantityStandard(
			q, u, 0), u]);
	},
	formatSuccessMessage: function (s) {
		return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("SUCCESS", [s]);
	}
};