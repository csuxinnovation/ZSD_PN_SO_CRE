/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.ca.scfld.md.controller.BaseFullscreenController");
jQuery.sap.require("sap.ui.core.mvc.Controller");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.Utils");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.ServiceHelper");
sap.ca.scfld.md.controller.BaseFullscreenController.extend("zcus.sd.pn.salesorder.create.view.SalesOrderCartDetails", {
	_oBusyDialog: null,
	onInit: function () {
		this._view = this.getView();
		sap.ca.scfld.md.controller.BaseDetailController.prototype.onInit.call(this);
		this._oBusyDialog = new sap.m.BusyDialog();
		this.oRouter.attachRouteMatched(function (e) {
			if (e.getParameter("name") === "soCartDetails") {
				this.reloadData();
			}
		}, this);
	},
	reloadData: function () {
		this.oCartModel = this.oApplicationFacade.getApplicationModel("soc_cart");
		this._view = this.getView();
		this.oSOCartModel = this.oApplicationFacade.getODataModel();
		this.getView().setModel(this.oCartModel, "soc_cart");
		var c = this.oCartModel.getData().CustomerNumber;
		var s = this.oCartModel.getData().SalesOrganization;
		var d = this.oCartModel.getData().DistributionChannel;
		var a = this.oCartModel.getData().Division;
		var p = ["$expand=PartnerAddressSet"];

		function S(r) {
			this.addresses = r.PartnerAddressSet.results;
			var b = this.oCartModel.getData();
			b.ShipToIncoTerms = r.ShipToIncoTerms;
			b.ShipToCarrier = r.ShipToCarrier;
			b.PartnerAddressSet = r.PartnerAddressSet.results;
			b.ShippingInstructions = b.ShippingInstructions ? b.ShippingInstructions : r.ShipToInstructions;
			b.NotesToReceiver = b.NotesToReceiver ? b.NotesToReceiver : r.ShipToReceiverNotes;
			this.oCartModel.updateBindings();
			if (this.addresses && this.addresses.length > 0 && typeof b.PartnerID === "undefined") {
				var f = this.byId("AddressSelect");
				f.setSelectedItem(f.getItems()[0]);
				this._updateAddress(0);
			}
		}

		function e(E) {
			zcus.sd.pn.salesorder.create.util.Utils.dialogErrorMessage(E.response);
		}
		this.oSOCartModel.read("/Customers(CustomerID='" + c + "',SalesOrganization='" + s + "',DistributionChannel='" + d + "',Division='" +
			a + "')/", null, p, true, jQuery.proxy(S, this), jQuery.proxy(e, this));
	},
	onNavigateHome: function () {
		zcus.sd.pn.salesorder.create.util.ModelUtils.navToCustomers();
	},
	_onNavigateBack: function () {
		window.history.go(-1);
	},
	onAddressSelect: function () {
		var s = this.byId("AddressSelect").getSelectedItem().getKey();
		var i;
		for (i = 0; i < this.addresses.length; i++) {
			var p = this.addresses[i].PartnerID;
			if (p === s) {
				this._updateAddress(i);
				break;
			}
		}
	},
	simulateSalesOrderCreate: function () {
		var s = {};
		var a = zcus.sd.pn.salesorder.create.util.ServiceHelper.getServiceUrl(this);
		this.oSOCartModel = new sap.ui.model.odata.ODataModel(a, false);
		var b = this.oApplicationFacade.getApplicationModel("soc_cart").getData().oShoppingCartItems;
		var t = this;
		if (b.length > 0) {
			if (typeof this.oCartModel.getData().PurchaseOrder === "undefined") {
				this.oCartModel.getData().PurchaseOrder = "";
			}
			if (typeof this.oCartModel.getData().NotesToReceiver === "undefined") {
				this.oCartModel.getData().NotesToReceiver = "";
			}
			if (typeof this.oCartModel.getData().ShippingInstructions === "undefined") {
				this.oCartModel.getData().ShippingInstructions = "";
			}
			s.SalesOrderSimulation = true;
			s.SalesOrderNumber = "0";
			s.PO = this.oCartModel.getData().PurchaseOrder;
			s.RequestedDate = parseInt(this.oCartModel.getData().singleRdd, 10);
			s.CustomerID = this.oCartModel.getData().CustomerNumber;
			s.SalesOrganization = this.oCartModel.getData().SalesOrganization;
			s.DistributionChannel = this.oCartModel.getData().DistributionChannel;
			s.Division = this.oCartModel.getData().Division;
			s.Zcondition = this.oCartModel.getData().Zcondition;//141541/10 Ajustes FIORI - GRUPO I INI
			//s.Zrequesteddatesum = this.OrderDataRadio;
			s.Zrequesteddatesum = this.getView().getModel("soc_cart").getData().Zrequesteddatesum;
			s.OrderItemSet = [];
			b = this.oCartModel.getData().oShoppingCartItems;
			var c = sap.ui.core.format.NumberFormat.getIntegerInstance({
				minIntegerDigits: 6,
				maxIntegerDigits: 6
			});
			var j = 0;
			var i;
			for (i = 0; i < b.length; i++) {
				if (b[i].isVisible === true) {
					var C = {};
					C.Quantity = b[i].qty;
					C.UnitofMeasure = b[i].UOM;
					C.RequestedDeliveryDate = parseInt(b[i].RDD, 10);
					C.Product = b[i].Product;
					C.SalesOrderNumber = b[i].SalesOrderNumber;
					C.ItemNumber = c.format(10 * (i + 1));
					C.Currency = b[i].Currency;
					C.ProductName = b[i].ProductName;
					//fernaj10
					if (b[i].Zp80 === undefined || b[i].Zp80 === "") {
						b[i].Zp80 = "0";
					}
					C.Zp80 = b[i].Zp80;
					C.Kbetr = b[i].Kbetr;
					s.OrderItemSet[j] = C;
					j++;
				}
			}
			this._oBusyDialog.open();
			this.oSOCartModel.create("/SalesOrders", s, {
				success: function (d, r) {
					t._oBusyDialog.close();
					zcus.sd.pn.salesorder.create.util.ModelUtils.updateCartModelFromSimulationResponse(r);
				},
				error: function fnError(e) {
					t._oBusyDialog.close();
					var d = t.oApplicationFacade.getResourceBundle().getText("ERROR");
					zcus.sd.pn.salesorder.create.util.Utils.dialogErrorMessage(e.response, d);
				},
				async: true
			});
		}
	},
	onNavigateReview: function () {
		if (!this._view.byId("PUR_ORDER").getValue()) {
			//zcus.sd.pn.salesorder.create.util.Utils.dialogErrorMessage("bbb", "aaa");
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Preencher campos obrigatórios"
			});
			return;
		}
		this.oCartModel.getData().PurchaseOrder = this._view.byId("PUR_ORDER").getValue();
		//this.oCartModel.getData().ShippingInstructions = this._view.byId("ship").getValue();
		//this.oCartModel.getData().NotesToReceiver = this._view.byId("notes").getValue();
		//this.oCartModel.getData().PhoneNumber = this._view.byId("phoneNum").getText();
		this.simulateSalesOrderCreate();
		this.oRouter.navTo("soReviewCart", {});
	},
	_updateAddress: function (i) {
		this._view.byId("addresses1").setText(this.addresses[i].ShipToAddress1);
		this._view.byId("addresses2").setText(this.addresses[i].ShipToAddress2);
		this._view.byId("city").setText(this.addresses[i].ShipToCity);
		this._view.byId("state").setText(this.addresses[i].ShipToRegionName);
		this._view.byId("country").setText(this.addresses[i].ShipToCountryName);
		this._view.byId("zip").setText(this.addresses[i].ShipToPostalCode);
		//this._view.byId("phoneNum").setText(this.addresses[i].ShipToTelephone);
		var a = this.addresses[i].ShipToAddress2;
		var s = ((typeof a === "undefined") || (!a.trim())) ? false : true;
		this._view.byId("addresses2").setVisible(s);
		this.oCartModel.getData().PartnerName2 = this.addresses[i].PartnerName2;
		this.oCartModel.getData().PartnerID = this.addresses[i].PartnerID;
		this.oCartModel.getData().FormattedAddress1 = this.addresses[i].FormattedAddress1;
		this.oCartModel.getData().FormattedAddress2 = this.addresses[i].FormattedAddress2;
		this.oCartModel.getData().FormattedAddress3 = this.addresses[i].FormattedAddress3;
		this.oCartModel.getData().FormattedAddress4 = this.addresses[i].FormattedAddress4;
		this.oCartModel.getData().FormattedAddress5 = this.addresses[i].FormattedAddress5;
		this.oCartModel.getData().FormattedAddress6 = this.addresses[i].FormattedAddress6;
		this.oCartModel.getData().FormattedAddress7 = this.addresses[i].FormattedAddress7;
		this.oCartModel.getData().FormattedAddress8 = this.addresses[i].FormattedAddress8;
		this.oCartModel.getData().FormattedAddress9 = this.addresses[i].FormattedAddress9;
	},
	getHeaderFooterOptions: function () {
		var b = [];
		b.push({
			sI18nBtnTxt: "REVIEW_ORDER",
			onBtnPressed: jQuery.proxy(this.onNavigateReview, this)
			//onBtnPressed: this.onReviewOrder(this)
		});
		return {
			sI18NFullscreenTitle: "CART_DETAILS_TITLE",
			buttonList: b,
			onBack: this._onNavigateBack,
			bSuppressBookmarkButton: true
		};
	}
});