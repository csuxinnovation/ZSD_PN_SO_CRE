/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
sap.ui.controller("zcus.sd.pn.salesorder.create.Main", {
	onInit: function () {
		jQuery.sap.require("sap.ca.scfld.md.Startup");
		var m = new sap.ui.model.json.JSONModel();
		var M = jQuery.sap.getModulePath("zcus.sd.pn.salesorder.create");
		m.loadData(M + "/img/img.json");
		sap.ca.scfld.md.Startup.init("zcus.sd.pn.salesorder.create", this);
		var a = sap.ca.scfld.md.app.Application.getImpl();
		var A = a.oConfiguration.oApplicationFacade;
		A.setApplicationModel("img", m);
	}
});