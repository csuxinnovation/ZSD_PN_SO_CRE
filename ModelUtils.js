/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("zcus.sd.pn.salesorder.create.util.ModelUtils");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.Formatter");
zcus.sd.pn.salesorder.create.util.ModelUtils = {
	setUniformRddInCartModel: function () {
		var c = sap.ca.scfld.md.app.Application.getImpl().getApplicationModel("soc_cart");
		var n = c.getData().singleRdd;
		var a = c.getData().oShoppingCartItems;
		var b = parseInt(n.slice(4, 6), 10) - 1;
		var i;
		for (i = 0; i < a.length; i++) {
			a[i].RDD = n;
			a[i].formatRDD = new Date(n.slice(0, 4), b, n.slice(6, 8));
		}
		c.updateBindings();
	},
	_setCartModel: function () {
		var c = new sap.ui.model.json.JSONModel();
		var d = this._getDateAsString();
		var n = parseInt(d.slice(4, 6), 10) - 1;
		var D = new Date(d.slice(0, 4), n, d.slice(6, 8));
		c.setData({
			singleRdd: d,
			formatSingleRdd: D,
			itemCount: 0,
			oShippingInfo: [],
			oShoppingCartItems: []
		});
		c.setSizeLimit(1000);
		sap.ca.scfld.md.app.Application.getImpl().setApplicationModel("soc_cart", c);
		this.updateCartIcon();
	},
	_getDateAsString: function () {
		var d = new Date();
		d.setDate(d.getDate() + 1);
		return sap.ca.ui.model.format.DateFormat.getDateInstance({
			pattern: "yyyyMMdd"
		}).format(d);
	},
	resetCartKeepCustomers: function () {
		var c = sap.ca.scfld.md.app.Application.getImpl().getApplicationModel("soc_cart");
		var d = this._getDateAsString();
		var n = parseInt(d.slice(4, 6), 10) - 1;
		var D = new Date(d.slice(0, 4), n, d.slice(6, 8));
		// var d2 = c.getData().Zorderdate;
		// var n2 = parseInt(d2.slice(4, 6), 10) - 1;
		// var D2 = new Date(d2.slice(0, 4), n2, d2.slice(6, 8));
		c.setData({
			singleRdd: d,
			formatSingleRdd: D,
			itemCount: 0,
			oShippingInfo: [],
			oShoppingCartItems: [],
			CustomerNumber: c.getData().CustomerNumber,
			CustomerName: c.getData().CustomerName,
			DistributionChannel: c.getData().DistributionChannel,
			Division: c.getData().Division,
			SalesOrganization: c.getData().SalesOrganization,
			Currency: c.getData().Currency,
			//fernaj10
			Zcidade: c.getData().Zcidade,
			Zbairro: c.getData().Zbairro,
			Zregio: c.getData().Zregio
			//Zcondition: c.getData().Zcondition
		});
		c.updateBindings();
		this.updateCartIcon();
	},
	updateCartIcon: function () {
		var m = sap.ca.scfld.md.app.Application.getImpl().getApplicationModel("soc_cart");
		var d = m.getData();
		var i = d.oShoppingCartItems;
		var I = sap.ca.scfld.md.app.Application.getImpl().getApplicationModel("img");
		I.getData().cartIcon = i.length > 0 ? "sap-icon://cart-full" : "sap-icon://cart";
		I.updateBindings();
	},
	navToCustomers: function () {
		this.resetCart();
	},
	navToHome: function () {
		this.resetCartKeepCustomer();
	},
	deleteCartItemAtIndex: function (i) {
		var m = sap.ca.scfld.md.app.Application.getImpl().getApplicationModel("soc_cart");
		var d = m.getData();
		var a = d.oShoppingCartItems;
		a.splice(i, 1);
		if (!a.length) {
			delete d.Freight;
			delete d.GrandTotal;
			delete d.Tax;
			delete d.TotalAmount;
		}
		m.setData(d);
		d.itemCount = zcus.sd.pn.salesorder.create.util.ModelUtils.getCartCount();
		m.updateBindings();
		this.updateCartIcon();
	},
	updateCartModelFromSimulationResponse: function (r) {
 
		var c = sap.ca.scfld.md.app.Application.getImpl().getApplicationModel("soc_cart");
		var C = c.getData();
		var o = {};
		var a = C.oShoppingCartItems;
		var i;
		for (i = 0; i < a.length; i++) {
			var n = zcus.sd.pn.salesorder.create.util.Formatter.formatItemNumber(i + 1);
			o[n] = a[i];
		}
		C.TotalAmount = r.data.TotalAmount;
		C.GrandTotal = r.data.GrandTotal;
		C.Tax = r.data.Tax;
		C.Freight = r.data.Freight;
		//fernaj10
		C.Zfreight = r.data.Zfreight;
		C.Zweigth = r.data.Zweigth;
		C.ZweigthB = r.data.ZweigthB;
		C.Zpallet = r.data.Zpallet;
		C.Zqtdeemb = "";
		C.Zr00 = r.data.Zr00;
		C.Zipi = r.data.Zipi;
		C.Zniv = r.data.Zniv;
		C.Zgsv = r.data.Zgsv;
		C.ZweigthUn = "Kg";
		C.Zorderdate = r.data.Zorderdate;
		C.Zorderdatefinal = r.data.Zorderdatefinal;
		C.Zorderdateplus = r.data.Zorderdateplus;
		C.Zradio = true;
		C.Zrequesteddatesum = r.data.Zrequesteddatesum;
		/*if(this.byId("RB01").checked) {
		  C.Zorderdate = r.data.Zorderdate;
		}else if(this.byId("RB02").checked) {
		  C.Zorderdate = r.data.Zorderdate;
		}*/
		C.formatSingleRdd = r.data.RequestedDate;
		var d0 = c.getData().formatSingleRdd;
		var n0 = parseInt(d0.slice(4, 6), 10) - 1;
		var D0 = new Date(d0.slice(0, 4), n0, d0.slice(6, 8));
		C.formatSingleRdd = D0;
		//C.formatSingleRdd = r.data.Zorderdate;
		C.Zcondition = r.data.Zcondition;
		C.ZconditionText = r.data.ZconditionText; //141541/10 Ajustes FIORI - GRUPO I INI
		C.ZprecoNfPrazo = r.data.ZprecoNfPrazo; //141541/10 Ajustes FIORI - GRUPO I INI                        
		/*var d2 = c.getData().Zorderdate;
		var n2 = parseInt(d2.slice(4, 6), 10) - 1;
		var D2 = new Date(d2.slice(0, 4), n2, d2.slice(6, 8));
		var d3 = c.getData().Zorderdateplus;
		var n3 = parseInt(d3.slice(4, 6), 10) - 1;
		var D3 = new Date(d3.slice(0, 4), n3, d3.slice(6, 8));
		var df = c.getData().Zorderdateplus;
		var nf = parseInt(df.slice(4, 6), 10) - 1;
		var Df = new Date(df.slice(0, 4), nf, df.slice(6, 8));
		var totn_string = "";
		C.Zorderdate1 = D2;
		C.Zorderdate2 = D3;
		C.Zorderdate1t = totn_string.concat(d2.slice(6,8), ".", d2.slice(4,6), ".", d2.slice(0,4));
		C.Zorderdate2t = totn_string.concat(d3.slice(6,8), ".", d3.slice(4,6), ".", d3.slice(0,4));*/
		C.PaymentTerms = r.data.PaymentTerms;
		
		if (r.data.OrderItemSet !== null) {
			C.oShoppingCartItems = r.data.OrderItemSet.results;
		} else {
			C.oShoppingCartItems = [];
		}
		var b = C.oShoppingCartItems;
		this.formatCartModel(b, o);
		c.updateBindings();
	},
	formatCartModel: function (a, o) {
		var s = sap.ui.core.ValueState.Success;
		var w = sap.ui.core.ValueState.Warning;
		var e = sap.ui.core.ValueState.Error;
		var n = sap.ui.core.ValueState.None;
		var i;
		for (i = 0; i < a.length; i++) {
			a[i].isVisible = i > 0 ? a[i].ItemNumber !== a[i - 1].ItemNumber : true;
			if (!(i > 0 && a[i].ItemNumber === (a[i - 1].ItemNumber))) {
				var N = a[i].ItemNumber;
				a[i].ImgUrl = o[N].ImgUrl;
				a[i].qty = o[N].qty;
				a[i].RDD = o[N].RDD;
				a[i].UOM = o[N].UOM;
				a[i].UnitofMeasureTxt = o[N].UnitofMeasureTxt;
				a[i].ProductID = a[i].Product;
				a[i].ProductDesc = a[i].ProductName;
				a[i].Zpeso = o[N].Zpeso;
				a[i].ZpesoB = o[N].ZpesoB;
				a[i].ZpesoUn = o[N].ZpesoUn;
				a[i].Zpallet = o[N].Zpallet;
				a[i].Zp80 = o[N].Zp80;
				a[i].Zgsv = a[i].Zgsv;
				a[i].ProductEan = o[N].ProductEan;
				a[i].Zqtdeemb = o[N].Zqtdeemb;
				if (a[i].Zp80 === undefined || a[i].Zp80 === "") {
					a[i].Zp80 = "0";
				}
				if (a[i].RDD) {
					var b = parseInt(a[i].RDD.slice(4, 6), 10) - 1;
					a[i].formatRDD = new Date(a[i].RDD.slice(0, 4), b, a[i].RDD.slice(6, 8));
				} else {
					a[i].formatRDD = new Date();
				}
			}
			a[i].AvailableQuantity = parseFloat(a[i].AvailableQuantity);
			var f = zcus.sd.pn.salesorder.create.util.Formatter.convertFloatToLocaleNoDecimalHandling(a[i].AvailableQuantity);
			switch (a[i].QuantityStatusCode) {
			case "A":
				a[i].AvailableQuantityStatus = s;
				a[i].AvailQuantity = zcus.sd.pn.salesorder.create.util.Formatter.formatQuantityStatusA();
				break;
			case "B":
				a[i].AvailableQuantityStatus = w;
				a[i].AvailQuantity = f;
				break;
			default:
				a[i].AvailableQuantityStatus = n;
				a[i].AvailQuantity = a[i].AvailableQuantity;
			}
			switch (a[i].DeliveryStatusCode) {
			case "A":
				a[i].EstimatedDeliveryStatus = s;
				a[i].EstimatedDelivery = zcus.sd.pn.salesorder.create.util.Formatter.formatDeliveryStatusA();
				break;
			case "B":
				a[i].EstimatedDeliveryStatus = w;
				a[i].EstimatedDelivery = zcus.sd.pn.salesorder.create.util.Formatter.convertDateToLocaleMedium(a[i].EstimatedDeliveryDate);
				break;
			case "C":
				a[i].EstimatedDeliveryStatus = e;
				a[i].EstimatedDelivery = zcus.sd.pn.salesorder.create.util.Formatter.formatDeliveryStatusC();
				a[i].AvailableQuantityStatus = e;
				a[i].AvailQuantity = zcus.sd.pn.salesorder.create.util.Formatter.formatSignQuantity(f);
				break;
			default:
				a[i].EstimatedDeliveryStatus = n;
				a[i].EstimatedDelivery = a[i].EstimatedDeliveryDate;
			}
		}
	},
	getCartCount: function () {
		var c = sap.ca.scfld.md.app.Application.getImpl().getApplicationModel("soc_cart");
		var C = c.getData();
		var a = C.oShoppingCartItems;
		var b = 0;
		var i;
		for (i = 0; i < a.length; i++) {
			if (a[i].isVisible === true) {
				b++;
			}
		}
		return b;
	}
};