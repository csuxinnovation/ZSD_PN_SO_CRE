/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.ca.scfld.md.controller.BaseFullscreenController");
jQuery.sap.require("sap.ui.core.mvc.Controller");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.ModelUtils");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.Utils");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.Validator");
sap.ca.scfld.md.controller.BaseFullscreenController.extend("zcus.sd.pn.salesorder.create.view.SalesOrderCreateCart", {
	validator: null,
	onInit: function () {
		sap.ca.scfld.md.controller.BaseFullscreenController.prototype.onInit.call(this);
		this.oRouter.attachRouteMatched(function (e) {
			if (e.getParameter("name") === "soCreateCart") {
				this.getView().setModel(this.oApplicationFacade.getApplicationModel("soc_cart"), "soc_cart");
				this.getView().updateBindings();
				this.validator = new zcus.sd.pn.salesorder.create.util.Validator();
			}
		}, this);
	},
	removeItem: function (e) {
		var b = e.getSource();
		var l = b.getParent();
		var p = l.getBindingContext("soc_cart").getPath();
		var i = parseInt(p.substring(p.lastIndexOf('/') + 1));
		var d = 4;
		var a = l.getCells()[d];
		this.validator.unregisterInvalidControl(a.getId());
		zcus.sd.pn.salesorder.create.util.ModelUtils.deleteCartItemAtIndex(i);
	},
	setUniformRDD: function (e) {
		var d = e.getSource();
		var D = e.getParameter("newYyyymmdd");
		if (D === null) {
			d.setValueState("Error");
			this.validator.registerInvalidControl(d.getId());
		} else {
			d.getModel("soc_cart").setProperty("RDD", D, d.getBindingContext("soc_cart"));
			d.setValueState("None");
			this.validator.unregisterInvalidControl(d.getId());
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
			d.setValueState("None");
			this.validator.unregisterInvalidControl(d.getId());
		}
	},
	onATPCheck: function () {
		//var lGroupFields = ["idCBTipoFrete", "idCBTipoEntrega"];
		var lGroupFields = ["idCBTipoFrete"];
		var lValidated = this.utilGrpRequiredFilled(lGroupFields, "Campo de preenchimento obrigatório!");

		if (lValidated == true) {
			this.oApplicationFacade.getApplicationModel("soc_cart").getData().Ztipofrete = this.getView().byId("idCBTipoFrete").getSelectedKey()
			this.oApplicationFacade.getApplicationModel("soc_cart").getData().Ztipofretetxt = this.getView().byId("idCBTipoFrete")._getSelectedItemText()
			this.oApplicationFacade.getApplicationModel("soc_cart").getData().Ztipoentrega = this.getView().byId("idCBTipoEntrega").getSelectedKey()
			this.oApplicationFacade.getApplicationModel("soc_cart").getData().Ztipoentregatxt = this.getView().byId("idCBTipoEntrega")._getSelectedItemText()
			var oShoppingCartItems = this.oApplicationFacade.getApplicationModel("soc_cart").getData().oShoppingCartItems;
			var localValidator = true;
			for (i = 0; i < this.oApplicationFacade.getApplicationModel("soc_cart").getData().oShoppingCartItems.length; i++) {
				if (!(oShoppingCartItems[i].qty > 0)){
					localValidator = false
				}		
			}
			if (this.getView().byId("idCBBasePallet").getSelected()) {
				this.oApplicationFacade.getApplicationModel("soc_cart").getData().ZBasePallet = "X"
				this.oApplicationFacade.getApplicationModel("soc_cart").getData().ZBasePalletBool = true
			} else{
				this.oApplicationFacade.getApplicationModel("soc_cart").getData().ZBasePallet = ""
				this.oApplicationFacade.getApplicationModel("soc_cart").getData().ZBasePalletBool = false
			}
			if	(localValidator == false) {
				sap.m.MessageBox.show(this.getView().getModel("i18n").getProperty("MISSING_QTY"), sap.m.MessageBox.Icon.ERROR, this.getView().getModel(
						"i18n").getProperty("MISSING_TITLE"), [sap.m.MessageBox.Action.OK]);
			} else {
				if (this.validator.getInvalidControlsNumber() === 0) {
					this.oRouter.navTo("quickCheckout", {});
				} else {
					sap.m.MessageBox.show(this.getView().getModel("i18n").getProperty("MISSING_INVALID"), sap.m.MessageBox.Icon.ERROR, this.getView().getModel(
						"i18n").getProperty("MISSING_TITLE"), [sap.m.MessageBox.Action.OK]);
				}
			}	
		}
	},

	utilGrpRequiredFilled: function (aFields, sStateText) {
		var lOneFilled = false;
		var lField, i, lValue;
		var lValidated = true;
		var lView = sap.ui.getCore().byId(this.FormViewId);
		for (i = 0; i < aFields.length; i++) {
			//lField = sap.ui.getCore().byId(aFields[i]);
			lField = this.getView().byId(aFields[i])
			lField.setValueStateText(sStateText);

			if (lField.getId() == "idPernrHE") {

				if (lField.getTokens().length == 0) {
					lValue = "";
				} else {
					lValue = ((lField.getMetadata().getName() !== "sap.m.Select") ? lField.getTokens()[0].getKey() : lField.getSelectedKey());
				}
			} else {
				lValue = ((lField.getMetadata().getName() !== "sap.m.Select") ? lField.getValue() : lField.getSelectedKey());
			}

			//if (lValue === "" && lOneFilled === false) {
			if (lValue === "") {
				lField.setValueState(sap.ui.core.ValueState.Error);
				lValidated = false;
			} else {
				lField.setValueState(sap.ui.core.ValueState.None);
			}
		}
		return lValidated;
	},

	_onNavigateHome: function () {
		window.history.go(-1);
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
	//fernaj10
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
	getHeaderFooterOptions: function () {
		var b = [];
		b.push({
			sI18nBtnTxt: "CHECKOUT",
			onBtnPressed: jQuery.proxy(this.onATPCheck, this)
		});
		return {
			sI18NFullscreenTitle: "CART",
			buttonList: b,
			onBack: jQuery.proxy(this._onNavigateHome, this),
			bSuppressBookmarkButton: true
		};
	},
	isNumberFieldValid: function (t) {
		var n = t.replace(/ +/, '');
		var i = /^\d+$/.test(n);
		return i;
	},
	//fernaj10
	isPercentageFieldValid: function (t) {
		if (t == '' || t == '-') {
			return true;
		}
		var x = parseFloat(t);
		if (x > 100 || x < -100) {
			return false;
		}
		var text;
		if (t[0] == '-') {
			text = t.substr(1);
		} else {
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
			if (myArray[1] == "") {
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