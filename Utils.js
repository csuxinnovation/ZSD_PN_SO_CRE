/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
(function () {
	"use strict";
	jQuery.sap.declare("zcus.sd.pn.salesorder.create.utils.Utils");
	zcus.sd.pn.salesorder.create.util.Utils = {};
	zcus.sd.pn.salesorder.create.util.Utils.resetFooterContentRightWidth = function (c) {
		var p = c.getView().getContent()[0];
		var r = jQuery.sap.byId(p.getFooter().getId() + "-BarRight");
		var R = r.outerWidth(true);
		if (R > 0) {
			c.iRBWidth = R;
		}
		if (r.width() === 0 && c.iRBWidth) {
			jQuery.sap.log.info("Update footer contentRight Width=" + c.iRBWidth);
			r.width(c.iRBWidth);
		}
	};
	zcus.sd.pn.salesorder.create.util.Utils.dialogErrorMessage = function (r, e, b) {
		var a;
		if (r) {
			var B = r.body;
			if (B) {
				var i = B.indexOf("message");
				var c = B.substring(i).indexOf("}");
				if (c > -1) {
					a = B.substring(i + 8, i + c - 1);
				} else {
					var o = jQuery.parseXML(B);
					a = o.getElementsByTagName("message")[0].childNodes[0].nodeValue;
				}
			} else {
				a = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText("ERROR");
			}
			var C = function () {
				if (b === true) {
					jQuery.sap.history.back();
				}
			};
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: a
			}, C);
		}
	};
}());