/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.ca.scfld.md.controller.BaseDetailController");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.ModelUtils");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.Utils");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.ServiceHelper");
jQuery.sap.require("sap.ca.ui.model.type.Date");
jQuery.sap.require("sap.ca.ui.message.message");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.ServiceHelper");
sap.ca.scfld.md.controller.BaseDetailController.extend("zcus.sd.pn.salesorder.create.view.S3", {
	_oBusyDialog: null,
	onInit: function () {
		sap.ca.scfld.md.controller.BaseDetailController.prototype.onInit.call(this);
		this.getView().setModel(this.oApplicationFacade.getODataModel(), "so_mainmodel");
		this._oBusyDialog = new sap.m.BusyDialog();
		var s = this.oApplicationFacade.getApplicationModel("soc_cart");
		if (s === null) {
			zcus.sd.pn.salesorder.create.util.ModelUtils._setCartModel();
			s = this.oApplicationFacade.getApplicationModel("soc_cart");
		}
		this.getView().setModel(s, "soc_cart");
		var i = this.oApplicationFacade.getApplicationModel("img");
		if (!i.oData.cartIcon) {
			i.oData.cartIcon = "sap-icon://cart";
		}
		this.getView().setModel(i, "img");
		var v = this.getView();
		this.getView().getModel().attachRequestFailed(jQuery.proxy(this.onRequestFailed, this));
		this.oRouter.attachRouteMatched(function (e) {
			if (e.getParameter("name") === "detail") {
				var c = new sap.ui.model.Context(v.getModel(), "/" + e.getParameter("arguments").contextPath);
				v.setBindingContext(c);
				this.refresh(c);
				this.updateCartIcon();
			}
		}, this);
	},
	onRequestFailed: function () {
		this.oRouter.navTo("noData", {
			viewTitle: "SALES_ORDER_DETAIL",
			languageKey: "NO_ITEMS_AVAILABLE"
		});
		this.getView().getModel().detachRequestFailed(jQuery.proxy(this.onRequestFailed, this));
	},
	updateCartIcon: function () {
		this.getView().setModel(this.oApplicationFacade.getApplicationModel("soc_cart"), "soc_cart");
		var c = this.getView().getModel("soc_cart");
		if (c) {
			c.updateBindings();
		}
	},
	_quickCheckout: function () {
		this._oBusyDialog.open();
		var b = this.getView().getBindingContext();
		var p = b.sPath;
		p = p.substr(1);
		var m = new sap.ui.model.json.JSONModel();
		m.setData(b.getModel().oData[p]);
		this.oApplicationFacade.setApplicationModel("soc_mainmodel", m);
		this.oRouter.navTo("quickCheckout", {});
		this._oBusyDialog.close();
	},
	_loadItemsModel: function () {
		var s = new sap.ui.model.json.JSONModel();
		var n = this.oApplicationFacade.getODataModel();
		var p = ["$expand=OrderItemSet"];
		n.read("/SalesOrders('" + this.getView().getBindingContext().getProperty("SalesOrderNumber") + "')", null, p, false, function (d) {
			s.setData(d);
			s.updateBindings();
		}, function fnError(e) {
			zcus.sd.pn.salesorder.create.util.Utils.dialogErrorMessage(e.response);
		});
		this.getView().setModel(s, "soc_itemDetails");
	},
	_loadCustomers: function () {
		var c = new sap.ui.model.json.JSONModel();
		var n = this.oApplicationFacade.getODataModel();
		n.read("/Customers", null, null, false, function (d) {
			c.setData(d);
			c.updateBindings();
		}, function fnError(e) {
			zcus.sd.pn.salesorder.create.utils.Utilities.dialogErrorMessage(e.response);
		});
		this.getView().setModel(c, "soc_customers");
	},
	_goToCart: function () {
		this.oRouter.navTo("soCreateCart", {});
	},
	_addProductToCart: function () {
		this._loadItemsModel();
		var I = this.getView().getModel("soc_itemDetails");
		var d = I.getData();
		var a = this.oApplicationFacade.getApplicationModel("soc_cart").getData().oShoppingCartItems;
		var b = zcus.sd.pn.salesorder.create.util.ModelUtils._getDateAsString();
		var n = parseInt(b.slice(4, 6), 10) - 1;
		var D = new Date(b.slice(0, 4), n, b.slice(6, 8));
		var c = null;
		var i;
		for (i = 0; i < d.OrderItemSet.results.length; i++) {
			var o = d.OrderItemSet.results[i];
			if (!c && o.Currency) {
				c = o.Currency;
			}
			var e;
			if (o.ImageFlag) {
				var u = zcus.sd.pn.salesorder.create.util.ServiceHelper.getUrlParameters(this);
				var f = zcus.sd.pn.salesorder.create.util.ServiceHelper.getUrlWithoutParameters(this);
				e = f + "/ProductImages('" + o.MaterialNumber + "')/$value" + u;
			} else {
				e = jQuery.sap.getModulePath("zcus.sd.pn.salesorder.create") + "/img/home/icon_product.png";
			}
			var g = {
				ProductID: o.MaterialNumber,
				ProductDesc: o.ProductName,
				qty: parseFloat(o.Quantity),
				UOM: o.UnitofMeasure,
				UnitofMeasureTxt: o.UnitofMeasureTxt,
				RDD: b,
				formatRDD: D,
				NetPrice: o.NetAmount,
				Currency: o.Currency,
				ImgUrl: e,
				isVisible: true
			};
			a.push(g);
		}
		var C = this.oApplicationFacade.getApplicationModel("soc_cart");
		if (!C.getData().Currency && c) {
			C.getData().Currency = c;
			C.updateBindings();
		}
		C.getData().itemCount = zcus.sd.pn.salesorder.create.util.ModelUtils.getCartCount();
		C.updateBindings();
		zcus.sd.pn.salesorder.create.util.ModelUtils.updateCartIcon();
		var m = this.oApplicationFacade.getResourceBundle().getText("ADDED_ITEM");
		sap.ca.ui.message.showMessageToast(m);
		this.getView().setModel(this.oApplicationFacade.getApplicationModel("soc_cart"), "soc_cart");
	},
	_loadModel: function () {
		var s = new sap.ui.model.json.JSONModel();
		var a = this.oApplicationFacade.getODataModel();
		a.read("/SalesOrders", null, null, false, function (d) {
			s.setData(d);
			s.updateBindings();
		}, function fnError(e) {
			zcus.sd.pn.salesorder.create.util.Utils.dialogErrorMessage(e.response);
		});
		this.getView().setModel(s, "so_models");
	},
	refresh: function () {
		var a = this.oApplicationFacade;
		var v = this.getView();
		var m = v.getBindingContext().getPath();
		var M = v.getModel();
		var d = 0;
		var i = 1;
		M.addBatchReadOperations([M.createBatchOperation(m, "GET"), M.createBatchOperation(m + "/OrderItemSet", "GET")]);
		M.submitBatch(function (D) {
			var b = new sap.ui.model.json.JSONModel();
			b.setData(D.__batchResponses[d].data);
			v.setModel(b, "LocalDetails");
			var c = new sap.ui.model.json.JSONModel();
			c.setData(D.__batchResponses[i].data.results);
			v.setModel(c, "LocalOrderItems");
			var l = c.getData() ? c.getData().length : 0;
			v.byId("soItemDetail").byId("oOrderItems").setHeaderText(a.getResourceBundle().getText("SO_ITM_ORD_ITMS", [l]));
		});
	}
	
	//onFilterSelect: function (oEvent) {
			//var oBinding = this.byId("productsTable").getBinding("items");
			//	sKey = oEvent.getParameter("key");
				
			//oBinding.filter(aFilters);
		//}

});