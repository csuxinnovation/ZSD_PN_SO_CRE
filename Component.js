/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("zcus.sd.pn.salesorder.create.Component");
jQuery.sap.require("zcus.sd.pn.salesorder.create.Configuration");
jQuery.sap.require("sap.ca.scfld.md.ComponentBase");
sap.ca.scfld.md.ComponentBase.extend("zcus.sd.pn.salesorder.create.Component", {
	metadata: sap.ca.scfld.md.ComponentBase.createMetaData("MD", {
		"name": "Master Detail Sample",
		"version": "1.6.11",
		"library": "zcus.sd.pn.salesorder.create",
		"includes": ["css/salesorder.css"],
		"dependencies": {
			"libs": ["sap.m", "sap.me"],
			"components": []
		},
		"config": {
			"resourceBundle": "i18n/i18n.properties",
			"titleResource": "DISPLAY_NAME",
			"icon": "sap-icon://Fiori2/F0018"
		},
		viewPath: "zcus.sd.pn.salesorder.create.view",
		masterPageRoutes: {
			"master": {
				"pattern": "",
				"view": "S2"
			}
		},
		detailPageRoutes: {
			"detail": {
				"pattern": "detail/{contextPath}",
				"view": "S3"
			},
			"productdetail": {
				"pattern": "productdetail/{customerID}/{productID}/{salesOrganization}/{distributionChannel}/{division}",
				"view": "S3_Product"
			}
		},
		fullScreenPageRoutes: {
			"quickCheckout": {
				pattern: "quickCheckout",
				view: "SalesOrderCreatePriceAndAvailabilityCheck"
			},
			"soCartDetails": {
				pattern: "soCartDetails",
				view: "SalesOrderCartDetails"
			},
			"soReviewCart": {
				pattern: "soReviewCart",
				view: "SalesOrderReviewCart"
			},
			"soCreateCart": {
				pattern: "soCreateCart",
				view: "SalesOrderCreateCart"
			}
		}
	}),
	createContent: function () {
		var v = {
			component: this
		};
		return sap.ui.view({
			viewName: "zcus.sd.pn.salesorder.create.Main",
			type: sap.ui.core.mvc.ViewType.XML,
			viewData: v
		});
	}
});