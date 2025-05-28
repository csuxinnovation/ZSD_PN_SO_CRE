/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.ca.scfld.md.controller.BaseFullscreenController");
jQuery.sap.require("sap.ui.core.mvc.Controller");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.Formatter");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.ModelUtils");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.Utils");
jQuery.sap.require("sap.ca.ui.message.message");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("jquery.sap.history");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.Validator");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.ServiceHelper");
jQuery.sap.require("sap.m.Dialog");
jQuery.sap.require("sap.m.Button");
sap.ca.scfld.md.controller.BaseFullscreenController.extend("zcus.sd.pn.salesorder.create.view.SalesOrderCreatePriceAndAvailabilityCheck", {
	validator: null,
	_oBusyDialog: null,
	onInit: function () {
		var c = this.getView();
		var s = zcus.sd.pn.salesorder.create.util.ServiceHelper.getServiceUrl(this);
		this.oSOCartModel = new sap.ui.model.odata.ODataModel(s, false);
		this._oBusyDialog = new sap.m.BusyDialog();
		c.addEventDelegate({
			onBeforeShow: jQuery.proxy(function (e) {
				this.onBeforeShow(e);
			}, this)
		});
		this.byId("items").attachUpdateStarted({}, this.onTableUpdateStarted, this);
		this.oRouter.attachRouteMatched(function (e) {
			if (e.getParameter("name") === "quickCheckout") {
				this.getView().setModel(this.oApplicationFacade.getApplicationModel("soc_cart"), "soc_cart");
				this.validator = new zcus.sd.pn.salesorder.create.util.Validator();
				this.prepDataDate(false); //141541/10 Ajustes FIORI - GRUPO I INI
			}
			var a = this.getView().getModel("soc_cart");
			if (!a) {
				return;
			}
			//fernaj10
			//this.byId("SOC_SINGLE_SHIPMENT_CHECKBOX").setSelected(a.getData().SingleShipment);
			this.byId("SOC_SINGLE_SHIPMENT_CHECKBOX").setSelected(true);
		}, this);
		
		this.setModelCbBoxPaymentTerms(); //141541/10 Ajustes FIORI - GRUPO I INI

	},
 
	setModelCbBoxPaymentTerms: function() { //141541/10 Ajustes FIORI - GRUPO I INI
		var that = this;

		var sUrl = zcus.sd.pn.salesorder.create.util.ServiceHelper.getServiceUrl(this);
		var service = new sap.ui.model.odata.ODataModel(sUrl, false);
		var oCart = this.oApplicationFacade.getApplicationModel("soc_cart");

		service.read('/PaymentTermsSet', {
			filters: [
				new sap.ui.model.Filter("Country", sap.ui.model.FilterOperator.EQ, 'BR'),
				new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.EQ, oCart.getData().CustomerNumber),
				new sap.ui.model.Filter("Vkorg", sap.ui.model.FilterOperator.EQ, oCart.getData().SalesOrganization),
				new sap.ui.model.Filter("Vtweg", sap.ui.model.FilterOperator.EQ, oCart.getData().DistributionChannel),
				new sap.ui.model.Filter("Spart", sap.ui.model.FilterOperator.EQ, oCart.getData().Division)
			],
			success: function(data) {
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(data.results);
				that.getView().setModel(oModel, 'oCbBoxPaymentTerms');
				that.getView().updateBindings();
			},
			error: function() {

			}

		})

	},	
	onTableUpdateStarted: function () {
		var s = this.getView().getModel("soc_cart").getData().oShoppingCartItems;
		if (!s.length === 0) {
			this._oBusyDialog.open();
		}
	},
	onShipAndPay: function () {
		if (this.validator.getInvalidControlsNumber() === 0) {
			var c = this.oApplicationFacade.getApplicationModel("soc_cart");
			c.getData().SingleShipment = this.byId("SOC_SINGLE_SHIPMENT_CHECKBOX").getSelected();
			this.oRouter.navTo("soCartDetails", {});
		} else {
			sap.m.MessageBox.show(this.getView().getModel("i18n").getProperty("MISSING_INVALID"), sap.m.MessageBox.Icon.ERROR, this.getView().getModel(
				"i18n").getProperty("MISSING_TITLE"), [sap.m.MessageBox.Action.OK]);
		}
	},
	onBeforeShow: function (e) {
		if (e.firstTime !== true) {
			this.getView().setModel(this.oApplicationFacade.getApplicationModel("soc_cart"), "soc_cart");
			this.getView().updateBindings();
		}
		
		this.setModelCbBoxPaymentTerms(); //141541/10 Ajustes FIORI - GRUPO I INI
	},
	prepData: function () {
		var c = this.oApplicationFacade.getApplicationModel("soc_cart");
		if (!c) {
			return;
		}
		var a = c.getData().oShoppingCartItems;
		if (a.length <= 0) {
			return;
		}
		this._oBusyDialog.open();
		this.removePnADataFromCartModel();
		var s = {};
		s.SalesOrderSimulation = true;
		s.SingleShipment = this.byId("SOC_SINGLE_SHIPMENT_CHECKBOX").getSelected();
		var C = this.oApplicationFacade.getApplicationModel("soc_cart");
		C.getData().SingleShipment = this.byId("SOC_SINGLE_SHIPMENT_CHECKBOX").getSelected();
		s.PO = "";
		s.RequestedDate = this.getView().getModel("soc_cart").getData().singleRdd;
		s.CustomerID = this.getView().getModel("soc_cart").getData().CustomerNumber;
		s.SalesOrganization = this.getView().getModel("soc_cart").getData().SalesOrganization;
		s.DistributionChannel = this.getView().getModel("soc_cart").getData().DistributionChannel;
		s.Division = this.getView().getModel("soc_cart").getData().Division;
		s.Currency = this.getView().getModel("soc_cart").getData().Currency;
		s.Zrequesteddatesum = this.OrderDataRadio;
		s.Zcondition = this.getView().getModel("soc_cart").getData().Zcondition;//141541/10 Ajustes FIORI - GRUPO I INI
		//s.Zrequesteddatesum = this.getView().getModel("soc_cart").getData().Zrequesteddatesum;
		s.OrderItemSet = [];
		a = this.getView().getModel("soc_cart").getData().oShoppingCartItems;
		var i;
		for (i = 0; i < a.length; i++) {
			var o = {};
			o.Quantity = a[i].qty;
			o.UnitofMeasure = a[i].UOM;
			o.RequestedDeliveryDate = a[i].RDD;
			o.Product = a[i].ProductID;
			o.Currency = a[i].Currency;
			o.ItemNumber = zcus.sd.pn.salesorder.create.util.Formatter.formatItemNumber(i + 1);
			o.ProductName = a[i].ProductDesc;
			o.Zpeso = a[i].Zpeso;
			o.ZpesoB = a[i].ZpesoB;
			o.Zpallet = a[i].Zpallet;
			//fernaj10
			o.Kbetr = a[i].Kbetr;
			if (a[i].Zp80 === undefined || a[i].Zp80 === "") {
				a[i].Zp80 = "0";
			}
			o.Zp80 = a[i].Zp80;
			/*o.Zr00 = a[i].Zr00;
			o.Zp39 = a[i].Zp39;
			o.Zp30 = a[i].Zp30;
			o.Zp37 = a[i].Zp37;
			o.Zipi = a[i].Zipi;
			o.ZweigthB = a[i].ZweigthB;
			o.Zweigth = a[i].Zweigth;*/
			s.OrderItemSet[i] = o;
		}
		var t = this;
		var b = 0;
		t.oSOCartModel.create("/SalesOrders", s, {
			success: function (d, r) {

				zcus.sd.pn.salesorder.create.util.ModelUtils.updateCartModelFromSimulationResponse(r);
				t._oBusyDialog.close();
			},
			error: function fnError(e) {
				t._oBusyDialog.close();
				var d = t.oApplicationFacade.getResourceBundle().getText("ERROR");
				zcus.sd.pn.salesorder.create.util.Utils.dialogErrorMessage(e.response, d, true);
				var f = sap.ca.scfld.md.app.Application.getImpl().getApplicationModel("soc_cart");
				var g = f.getData();
				var a = g.oShoppingCartItems;
				var i;
				for (i = 0; i < a.length; i++) {
					a[i].isVisible = true;
				}
				f.updateBindings();
				b = -1;
			},
			async: true
		});
		if (b === -1) {
			return -1;
		}
	},
	prepDataDate: function (navNext) {
 
		var c = this.oApplicationFacade.getApplicationModel("soc_cart");
		if (!c) {
			return;
		}
		var a = c.getData().oShoppingCartItems;
		if (a.length <= 0) {
			return;
		}
		this._oBusyDialog.open();
		this.removePnADataFromCartModel();
		var s = {};
		s.SalesOrderSimulation = true;
		s.ZdateCalculation = true;
		s.SingleShipment = this.byId("SOC_SINGLE_SHIPMENT_CHECKBOX").getSelected();
		var C = this.oApplicationFacade.getApplicationModel("soc_cart");
		C.getData().SingleShipment = this.byId("SOC_SINGLE_SHIPMENT_CHECKBOX").getSelected();
		s.PO = "";
		s.RequestedDate = this.getView().getModel("soc_cart").getData().singleRdd;
		s.CustomerID = this.getView().getModel("soc_cart").getData().CustomerNumber;
		s.SalesOrganization = this.getView().getModel("soc_cart").getData().SalesOrganization;
		s.DistributionChannel = this.getView().getModel("soc_cart").getData().DistributionChannel;
		s.Division = this.getView().getModel("soc_cart").getData().Division;
		s.Currency = this.getView().getModel("soc_cart").getData().Currency;
		s.Zrequesteddatesum = this.OrderDataRadio;
		s.Ztipofrete = this.getView().getModel("soc_cart").getData().Ztipofrete;
		s.Ztipoentrega = this.getView().getModel("soc_cart").getData().Ztipoentrega;
		s.Zbasepallet = this.getView().getModel("soc_cart").getData().ZBasePallet;
		s.Zcondition = this.getView().getModel("soc_cart").getData().Zcondition;//141541/10 Ajustes FIORI - GRUPO I INI
		//s.Zrequesteddatesum = this.getView().getModel("soc_cart").getData().Zrequesteddatesum;
		s.OrderItemSet = [];
		a = this.getView().getModel("soc_cart").getData().oShoppingCartItems;
		var i;
		var localValidator = true;
		for (i = 0; i < a.length; i++) {
			var o = {};
			o.Quantity = a[i].qty;
			if (!(a[i].qty > 0)){
				localValidator = false
			}	
			o.UnitofMeasure = a[i].UOM;
			o.RequestedDeliveryDate = a[i].RDD;
			o.Product = a[i].ProductID;
			o.Currency = a[i].Currency;
			o.ItemNumber = zcus.sd.pn.salesorder.create.util.Formatter.formatItemNumber(i + 1);
			o.ProductName = a[i].ProductDesc;
			o.Zpeso = a[i].Zpeso;
			o.ZpesoB = a[i].ZpesoB;
			o.Zpallet = a[i].Zpallet;
			//fernaj10
			o.Kbetr = a[i].Kbetr;
			if (a[i].Zp80 === undefined || a[i].Zp80 === "") {
				a[i].Zp80 = "0";
			}
			o.Zp80 = a[i].Zp80;
			/*o.Zr00 = a[i].Zr00;
			o.Zp39 = a[i].Zp39;
			o.Zp30 = a[i].Zp30;
			o.Zp37 = a[i].Zp37;
			o.Zipi = a[i].Zipi;
			o.ZweigthB = a[i].ZweigthB;
			o.Zweigth = a[i].Zweigth;*/
			s.OrderItemSet[i] = o;
		}
		var t = this;
		if	(localValidator == false) {
			t._oBusyDialog.close();
			sap.m.MessageBox.show(this.getView().getModel("i18n").getProperty("MISSING_QTY"), sap.m.MessageBox.Icon.ERROR, this.getView().getModel(
					"i18n").getProperty("MISSING_TITLE"), [sap.m.MessageBox.Action.OK]);
		}else{
			var b = 0;
			t.oSOCartModel.create("/SalesOrders", s, {
				success: function (d, r) {
					//141541/10 Ajustes FIORI - GRUPO I INI
					if (navNext === true){ 
						t.confirmAction(); 
					};
					//141541/10 Ajustes FIORI - GRUPO I END
	 
					zcus.sd.pn.salesorder.create.util.ModelUtils.updateCartModelFromSimulationResponse(r);
					t._oBusyDialog.close();
				},
				error: function fnError(e) {
					t._oBusyDialog.close();
					var d = t.oApplicationFacade.getResourceBundle().getText("ERROR");
					zcus.sd.pn.salesorder.create.util.Utils.dialogErrorMessage(e.response, d, false);
					var f = sap.ca.scfld.md.app.Application.getImpl().getApplicationModel("soc_cart");
					var g = f.getData();
					var a = g.oShoppingCartItems;
					var i;
					for (i = 0; i < a.length; i++) {
						a[i].isVisible = true;
					}
					f.updateBindings();
					b = -1;
				},
				async: true
			});
			if (b === -1) {
				return -1;
			}
		}
	},
	removePnADataFromCartModel: function () {
		var c = this.oApplicationFacade.getApplicationModel("soc_cart").getData();
		var a = c.oShoppingCartItems;
		var i;
		for (i = a.length - 1; i > -1; i--) {
			if (a[i].isVisible === false) {
				a.splice(i, 1);
				continue;
			}
			delete a[i].isVisible;
			delete a[i].TotalAmount;
			delete a[i].AvailableQuantity;
			delete a[i].AvailQuantity;
			delete a[i].QuantityStatusCode;
			delete a[i].AvailableQuantityStatus;
			delete a[i].EstimatedDeliveryDate;
			delete a[i].EstimatedDelivery;
			delete a[i].DeliveryStatusCode;
			delete a[i].EstimatedDeliveryStatus;
			delete a[i].FinalPrice;
			delete a[i].NetAmount;
			delete a[i].ProductName;
			delete a[i].Quantity;
			delete a[i].UnitofMeasure;
		}
		this.oApplicationFacade.getApplicationModel("soc_cart").updateBindings();
	},
	removeItem: function (e) {
		var b = e.getSource();
		var l = b.getParent();
		var p = l.getBindingContext("soc_cart").getPath();
		var i = p.substr(p.lastIndexOf("/") + 1);
		var d = 3;
		var a = l.getCells()[d];
		this.validator.unregisterInvalidControl(a.getId());
		zcus.sd.pn.salesorder.create.util.ModelUtils.deleteCartItemAtIndex(i);
	},
	onATPCheckUpdate: function () {
		/*var c = sap.ca.scfld.md.app.Application.getImpl().getApplicationModel("soc_cart");
		var C = c.getData();
		var d2 = c.getData().Zorderdate;
		d2 = "20230125";
		var n2 = parseInt(d2.slice(4, 6), 10) - 1;
		var D2 = new Date(d2.slice(0, 4), n2, d2.slice(6, 8));
		var d1 = c.getData().Zorderdate;
		var n1 = parseInt(d1.slice(4, 6), 10) - 1;
		var D1 = new Date(d1.slice(0, 4), n1, d1.slice(6, 8));
		if (c.getData().Zradio) {
			C.Zorderdate = d2;
		}*/
		console.log('onATPCheckUpdate');
		if (this.validator.getInvalidControlsNumber() === 0) {
			this.prepDataDate();
		} else {
			sap.m.MessageBox.show(this.getView().getModel("i18n").getProperty("MISSING_INVALID"), sap.m.MessageBox.Icon.ERROR, this.getView().getModel(
				"i18n").getProperty("MISSING_TITLE"), [sap.m.MessageBox.Action.OK]);
		}
	},
	onNumberEnter: function (e) {
		var t = e.getParameters().newValue;
		if (t.indexOf("-") !== -1) {
			var r = t.replace("-", "");
			e.getSource().setValue(r);
		}
		if (!this.isNumberFieldValid(t)) {
			e.getSource().setValueState(sap.ui.core.ValueState.Error);
			this.validator.registerInvalidControl(e.getSource().getId());
		} else {
			e.getSource().setValueState(sap.ui.core.ValueState.None);
			this.validator.unregisterInvalidControl(e.getSource().getId());
		}
	},
	setUniformSingleRdd: function (e) {
		var d = e.getSource();
		var D = e.getParameter("newYyyymmdd");
		if (D === null) {
			d.setValueState("Error");
			this.validator.registerInvalidControl(d.getId());
		} else {
			this.getView().getModel("soc_cart").setProperty("/singleRdd", D);
			var i = this.getView().byId("SOC_SINGLE_SHIPMENT_CHECKBOX").getProperty("selected");
			if (i === true) {
				zcus.sd.pn.salesorder.create.util.ModelUtils.setUniformRddInCartModel();
			}
			d.setValueState("None");
			this.validator.unregisterInvalidControl(d.getId());
		}
	},
	setSingleShipmentDate: function (e) {
		this.getView().getModel("soc_cart").setProperty("/SingleShipment", e.getParameter("selected"));
		if (e.getParameter("selected") === true) {
			zcus.sd.pn.salesorder.create.util.ModelUtils.setUniformRddInCartModel();
		}
	},
	setUniformRDD: function (e) {
		var d = e.getSource();
		var D = e.getParameter("newYyyymmdd");
		if (D === null) {
			d.setValueState("Error");
			this.validator.registerInvalidControl(d.getId());
		} else {
			e.getSource().getModel("soc_cart").setProperty("RDD", D, e.getSource().getBindingContext("soc_cart"));
			var i = this.getView().byId("SOC_SINGLE_SHIPMENT_CHECKBOX").getProperty("selected");
			if (i === true) {
				zcus.sd.pn.salesorder.create.util.ModelUtils.setUniformRddInCartModel();
				var m = this.oApplicationFacade.getResourceBundle().getText("ALERT_SINGLE_SHIPMENT");
				sap.ca.ui.message.showMessageToast(m);
			}
			d.setValueState("None");
			this.validator.unregisterInvalidControl(d.getId());
		}
	},
	_onNavigateBack: function () {
		window.history.go(-1);
	},
	getHeaderFooterOptions: function () {
 
		var b = [];
		b.push({
			sI18nBtnTxt: "UPDATE",
			onBtnPressed: jQuery.proxy(this.onATPCheckUpdate, this)
		});
		b.push({
			sI18nBtnTxt: "SHIPPING_AND_PAYMENT",
			//onBtnPressed: jQuery.proxy(this.onShipAndPay, this) 
			onBtnPressed: jQuery.proxy(this.onApproveDialogPress, this)
		});
		return {
			sI18NFullscreenTitle: "PRICE_AND_AVAILABILITY_CHECK",
			buttonList: b,
			onBack: this._onNavigateBack,
			bSuppressBookmarkButton: true
		};
	},
	isNumberFieldValid: function (t) {
		var n = t.replace(/ +/, '');
		var i = /^\d+$/.test(n);
		return i;
	},
	setRadioToModel: function (e) {
		var d = e.getParameters();
		var v = d.selectedIndex;
		this.OrderDataRadio = v;
		//e.mParameters.selectedIndex
		var c = sap.ca.scfld.md.app.Application.getImpl().getApplicationModel("soc_cart");
		var C = c.getData();
		var o = {};
		C.Zrequesteddatesum = v;
		var b = C.oShoppingCartItems;
		c.setProperty("/Zrequesteddatesum", v);
		//this.formatCartModel(b, o);
		//c.updateBindings();
	},
	onApproveDialogPress: function() { //141541/10 Ajustes FIORI - GRUPO I INI

		this.prepDataDate(true);
	},
	confirmAction: function(){ //141541/10 Ajustes FIORI - GRUPO I INI
		console.log('confirmAction');
		var oShoppingCartItems = this.oApplicationFacade.getApplicationModel("soc_cart").getData().oShoppingCartItems;
		var localValidator = true;
		for (i = 0; i < this.oApplicationFacade.getApplicationModel("soc_cart").getData().oShoppingCartItems.length; i++) {
			if (!(oShoppingCartItems[i].qty > 0)){
				localValidator = false
			}		
		}
		if	(localValidator == false) {
			sap.m.MessageBox.show(this.getView().getModel("i18n").getProperty("MISSING_QTY"), sap.m.MessageBox.Icon.ERROR, this.getView().getModel(
					"i18n").getProperty("MISSING_TITLE"), [sap.m.MessageBox.Action.OK]);
		} else {
			if (!this.oApproveDialog) {
				this.oApproveDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Confirmação",
					content: new sap.m.Text({
						text: "As quantidades e Itens estão de acordo com o pedido do cliente e cadastros ativos?"
					}),
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "Sim",
						press: function () {
							this.oApproveDialog.close();
							this.onShipAndPay();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "Voltar",
						press: function () {
							this.oApproveDialog.close();
						}.bind(this)
					})
				});
			}
			this.oApproveDialog.open();
		}
	},
	onApproveDialogPress_OLD: function () { //141541/10 Ajustes FIORI - GRUPO I INI
		console.log('onApproveDialogPress');
		var oShoppingCartItems = this.oApplicationFacade.getApplicationModel("soc_cart").getData().oShoppingCartItems;
		var localValidator = true;
		for (i = 0; i < this.oApplicationFacade.getApplicationModel("soc_cart").getData().oShoppingCartItems.length; i++) {
			if (!(oShoppingCartItems[i].qty > 0)){
				localValidator = false
			}		
		}
		if	(localValidator == false) {
			sap.m.MessageBox.show(this.getView().getModel("i18n").getProperty("MISSING_QTY"), sap.m.MessageBox.Icon.ERROR, this.getView().getModel(
					"i18n").getProperty("MISSING_TITLE"), [sap.m.MessageBox.Action.OK]);
		} else {
			if (!this.oApproveDialog) {
				this.oApproveDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Confirmação",
					content: new sap.m.Text({
						text: "As quantidades e Itens estão de acordo com o pedido do cliente e cadastros ativos?"
					}),
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "Sim",
						press: function () {
							this.oApproveDialog.close();
							this.onShipAndPay();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "Voltar",
						press: function () {
							this.oApproveDialog.close();
						}.bind(this)
					})
				});
			}
			this.oApproveDialog.open();
		}	
	},
	onPercentEnter: function (e) {
		var t = e.getParameters().newValue;
		if (t.indexOf("-") !== -1) {
			//var r = t.replace("-", "");
			e.getSource().setValue(t);
		}
		if (!this.isPercentageFieldValid(t)) {
			e.getSource().setValueState(sap.ui.core.ValueState.Error);
			this.validator.registerInvalidControl(e.getSource().getId());
		} else {
			e.getSource().setValueState(sap.ui.core.ValueState.None);
			this.validator.unregisterInvalidControl(e.getSource().getId());
		}
	},
	isPercentageFieldValid: function (t) {
		if (t == '' || t == '-') {
			return true;
		}
		var x = parseFloat(t);
		if (x > 100) {
			return false;
		}
		if (x < -100) {
			return false;
		}
		var text;
		if (t[0] == '-') {
			text = t.substr(1);
		}else{
			text = t;
		}
		const myArray = text.split(".");
		//sem pontos (.)
		var n = myArray[0].replace(/ +/, '');
		var i = /^\d+$/.test(n);
		if (!i) {
			return false;
		}
		//um ponto
		if (myArray[1] !== undefined) {
			if (myArray[1] == "" ){
				return false;
			}
			var n = myArray[1].replace(/ +/, '');
			var i = /^\d+$/.test(n);
			if (!i || myArray[1].length > 2) {
				return false;
			}
		}
		//mais de um ponto
		if (myArray[2] !== undefined) {
			return false;
		}
		return true;
		
	}
});