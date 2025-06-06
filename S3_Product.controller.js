/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.ca.scfld.md.controller.BaseDetailController");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.ModelUtils");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.Utils");
jQuery.sap.require("sap.ca.ui.message.message");
jQuery.sap.require("jquery.sap.history");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.ServiceHelper");
sap.ca.scfld.md.controller.BaseDetailController.extend("zcus.sd.pn.salesorder.create.view.S3_Product", {
	onInit: function () {
		sap.ca.scfld.md.controller.BaseDetailController.prototype.onInit.call(this);
		var v = this.getView();
		v.setModel(this.oApplicationFacade.getApplicationModel("soc_cart"), "soc_cart");
		v.setModel(this.oApplicationFacade.getApplicationModel("img"), "img");
		this.oRouter.attachRouteMatched(function (e) {
			if (e.getParameter("name") === "productdetail") {
				var d = e.getParameter("arguments");
				this.updateModel(d);
				this.updateCartIcon();
			}
		}, this);
	},
	updateCartIcon: function () {
		var c = this.getView().getModel("soc_cart");
		this.getView().setModel(this.oApplicationFacade.getApplicationModel("soc_cart"), "soc_cart");
		if (c) {
			c.updateBindings();
		}
	},
	updateModel: function (d) {
		if (typeof d.productID === "undefined") {
			this.byId("header").setVisible(false);
			this.byId("oInformationListLeft").setVisible(false);
			this.byId("add").setVisible(false);
			return;
		}
		this.byId("oInformationListLeft").setVisible(true);
		this.getView().invalidate();
		this.productID = d.productID;
		this.salesOrganization = d.salesOrganization;
		this.distributionChannel = d.distributionChannel;
		this.division = d.division;
		this.customer = d.customerID;
		this.Zpeso = d.Zpeso;
		this.ZpesoB = d.ZpesoB;
		this.ZpesoUn = d.ZpesoUn;
		this.oProductModel = new sap.ui.model.json.JSONModel();
		var p = "(ProductID='" + this.productID + "',SalesOrganization='" + this.salesOrganization + "',Division='" + this.division +
			"',CustomerNo='" + this.customer + "',DistributionChannel='" + this.distributionChannel + "')";
		sap.ca.ui.utils.busydialog.requireBusyDialog();
		var t = this;
		var s = function (r) {
			var v = t.getView();
			var P = {
				productID: decodeURIComponent(t.productID),
				productEan: r.Zean,
				productDesc: r.ProductDesc,
				productListPrice: r.NetPrice,
				currency: r.Currency,
				uom: r.UOM,
				UnitofMeasureTxt: r.UOMDesc,
				salesOrganization: t.salesOrganization,
				distributionChannel: t.distributionChannel,
				productAttributes: r.ProductAttributes.results,
				imageFlag: r.ImageFlag,
				Zpeso: r.Zpeso,
				ZpesoB: r.ZpesoB,
				ZpesoUn: r.ZpesoUn,
				Zpallet: r.Zpallet,
				Zqtdeemb: r.Zqtdeemb
			};
			t.oProductModel.setData(P);
			v.setModel(t.oProductModel, "product");
			t.byId("header").setVisible(true);
			t.byId("oInformationListLeft").setVisible(true);
			t.byId("add").setVisible(true);
			if (r.ImageFlag) {
				var u = zcus.sd.pn.salesorder.create.util.ServiceHelper.getUrlParameters(t);
				var a = zcus.sd.pn.salesorder.create.util.ServiceHelper.getUrlWithoutParameters(t);
				this.metadataUrl = a + "/ProductImages('" + t.productID + "')/$value" + u;
				t.byId("header").setIcon(this.metadataUrl);
			} else {
				t.byId("header").setIcon(jQuery.sap.getModulePath("zcus.sd.pn.salesorder.create") + "/img/home/icon_product.png");
			}
			sap.ca.ui.utils.busydialog.releaseBusyDialog();
		};
		var e = function (E) {
			zcus.sd.pn.salesorder.create.util.Utils.dialogErrorMessage(E.response);
			sap.ca.ui.utils.busydialog.releaseBusyDialog();
		};
		this.oApplicationFacade.getODataModel().read("/Products" + p, null, ["$expand=ProductAttributes"], true, s, e);
	},
	_goToCart: function () {
		this.oRouter.navTo("soCreateCart", {});
	},
	_addProductToCart: function () {
		var p = this.getView().getModel("product").getData();
		var c = this.oApplicationFacade.getApplicationModel("soc_cart");
		var I;
		if (p.imageFlag) {
			var u = zcus.sd.pn.salesorder.create.util.ServiceHelper.getUrlParameters(this);
			var a = zcus.sd.pn.salesorder.create.util.ServiceHelper.getUrlWithoutParameters(this);
			I = a + "/ProductImages('" + p.productID + "')/$value" + u;
		} else {
			I = jQuery.sap.getModulePath("zcus.sd.pn.salesorder.create") + "/img/home/icon_product.png";
		}
		var n = parseInt(c.getData().singleRdd.slice(4, 6), 10) - 1;
		var d = new Date(c.getData().singleRdd.slice(0, 4), n, c.getData().singleRdd.slice(6, 8));
		var b = {
			ProductID: p.productID,
			ProductEan: p.productEan,
			ProductDesc: p.productDesc,
			qty: null, /*1.0, rodarfer, RT133302, TASK54827320*/
			UOM: p.uom,
			UnitofMeasureTxt: p.UnitofMeasureTxt,
			RDD: c.getData().singleRdd,
			NetPrice: p.productListPrice,
			currency: p.currency,
			Zpeso: p.Zpeso,
			ZpesoB: p.ZpesoB,
			ZpesoUn: p.ZpesoUn,
			Zpallet: p.Zpallet,
			Zqtdeemb: p.Zqtdeemb,
			ImgUrl: I,
			isVisible: true,
			formatRDD: d
		};
		var i = c.getData().oShoppingCartItems;
		i.push(b);
		c.getData().itemCount = zcus.sd.pn.salesorder.create.util.ModelUtils.getCartCount();
		c.updateBindings();
		zcus.sd.pn.salesorder.create.util.ModelUtils.updateCartIcon();
		var m = this.oApplicationFacade.getResourceBundle().getText("ADDED_ITEM");
		sap.ca.ui.message.showMessageToast(m);
	},
	getLength: function (r) {
		var l = r ? r.length : 0;
		return this.oApplicationFacade.getResourceBundle().getText("DETAILS_INFORMATION", [l]);
	},
	_onNavigateBack: function () {
		this.oRouter.navTo("master", {});
	}
});