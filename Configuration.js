/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("zcus.sd.pn.salesorder.create.Configuration");
jQuery.sap.require("sap.ca.scfld.md.ConfigurationBase");
jQuery.sap.require("sap.ca.scfld.md.app.Application");
sap.ca.scfld.md.ConfigurationBase.extend("zcus.sd.pn.salesorder.create.Configuration", {
	oServiceParams: {
		serviceList: [{
			name: "ZSRA017_PN_SALESORDER_CREATE_SRV",
			masterCollection: "SalesOrders",
			serviceUrl: "/sap/opu/odata/sap/ZSRA017_PN_SALESORDER_CREATE_SRV/",
			isDefault: true,
			countSupported: false,
			useBatch: true,
			mockedDataSource: "model/metadata.xml"
		}]
	},
	getServiceParams: function () {
		return this.oServiceParams;
	},
	getServiceList: function () {
		return this.oServiceParams.serviceList;
	},
	getMasterKeyAttributes: function () {
		return ["SalesOrderNumber"];
	}
});