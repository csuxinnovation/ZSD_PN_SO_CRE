/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("zcus.sd.pn.salesorder.create.util.ServiceHelper");
zcus.sd.pn.salesorder.create.util.ServiceHelper = {
	getServiceUrl: function (c) {
		var s = c.oConnectionManager.getConfiguration().getServiceList()[0];
		var a = URI(s.serviceUrl);
		var b = jQuery.sap.getUriParameters().get("sap-server");
		var d = jQuery.sap.getUriParameters().get("sap-host");
		var e = jQuery.sap.getUriParameters().get("sap-host-http");
		var f = jQuery.sap.getUriParameters().get("sap-client");
		if (b !== null) {
			a.addSearch("sap-server", b);
		} else if (d !== null) {
			a.addSearch("sap-host", d);
		} else if (e !== null) {
			a.addSearch("sap-host-http", e);
		}
		if (f !== null) {
			a.addSearch("sap-client", f);
		}
		return a.toString();
	},
	readODataService: function (c, a, u) {
		var b = [];
		var s = new sap.ui.model.odata.ODataModel(zcus.sd.pn.salesorder.create.util.ServiceHelper.getServiceUrl(c), true);
		var d = new sap.ui.model.json.JSONModel();
		if (typeof u !== "undefined") {
			b[0] = u;
		}
		s.read(a, null, b, false, function (D) {
			d.setData(D);
		}, null);
		return d;
	},
	getUrlParameters: function (c, p) {
		p = p || "?";
		var s = new sap.ui.model.odata.ODataModel(zcus.sd.pn.salesorder.create.util.ServiceHelper.getServiceUrl(c), true);
		return (s.sUrlParams && s.sUrlParams.trim() !== "") ? p + s.sUrlParams : "";
	},
	getUrlWithoutParameters: function (c) {
		var s = new sap.ui.model.odata.ODataModel(zcus.sd.pn.salesorder.create.util.ServiceHelper.getServiceUrl(c), true);
		return s.sServiceUrl;
	}
};