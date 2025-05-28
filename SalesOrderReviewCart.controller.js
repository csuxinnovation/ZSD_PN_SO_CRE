/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.ca.scfld.md.controller.BaseFullscreenController");
jQuery.sap.require("sap.ui.core.mvc.Controller");
jQuery.sap.require("sap.ui.thirdparty.datajs");
jQuery.sap.require("sap.ca.ui.model.type.Date");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.Utils");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.ModelUtils");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.ServiceHelper");
sap.ca.scfld.md.controller.BaseFullscreenController.extend("zcus.sd.pn.salesorder.create.view.SalesOrderReviewCart", {
	_oBusyDialog: null,
	onInit: function () {
		this.loadData();
		sap.ca.scfld.md.controller.BaseDetailController.prototype.onInit.call(this);
		this._oBusyDialog = new sap.m.BusyDialog();
		this.oRouter.attachRouteMatched(function (e) {
			if (e.getParameter("name") === "soReviewCart") {
				this.loadData();
			}
		}, this);
	},
	loadData: function () {
		var c = this.oApplicationFacade.getApplicationModel("soc_cart");
		var s = zcus.sd.pn.salesorder.create.util.ServiceHelper.getServiceUrl(this);
		var j = false;
		if (c.oData.oShoppingCartItems.length === 0) {
			j = true;
		}
		this.oSOCartModel = new sap.ui.model.odata.ODataModel(s, j);
		this.getView().setModel(c, "soc_cart");
		this.getView().getModel("soc_cart").updateBindings();
		var m = c.getData();
		var f = m.FormattedAddress2;
		var a = m.FormattedAddress3;
		var b = m.FormattedAddress4;
		var d = m.FormattedAddress5;
		var e = m.FormattedAddress6;
		var g = m.FormattedAddress7;
		var h = m.FormattedAddress8;
		var i = m.FormattedAddress9;
		this.getView().byId("address").setText(zcus.sd.pn.salesorder.create.util.Formatter.formatAddress(f, a, b, d, e, g, h, i));
	},
	onNavigateSubmit: function () {
		this._oBusyDialog.open();
		//this.uploadFile();
		this.salesOrderCreate();
	},
	uploadFile: function (oEvent) {

		/*var oFileUploader = this.getView().byId("fileUploader2");
		var oFileUploader = this.getView().byId("fileUploader2");
		var domRef = oFileUploader.getFocusDomRef();
		var file = domRef.files[0];*/
		var file = oEvent.getParameters("files").files[0];
		this.fileName = file.name;
		this.fileType = file.type;
		var that = this;
		var reader = new FileReader();

		reader.onload = function (e) {
			
			//var vContent = e.srcElement.result.replace("data:application/pdf;base64,", "");
			var vContent = e.srcElement.result.replace("data:" + that.fileType + ";base64,", "");
			//vContent = vContent.replace("'", "");
			var fContent = btoa(encodeURI(vContent));
			var fContent2 = btoa(vContent);
			//var c = that.oApplicationFacade.getApplicationModel("soc_cart");
			var c = sap.ca.scfld.md.app.Application.getImpl().getApplicationModel("soc_cart");
			c.setProperty("/Zfilecontent", vContent);
			c.setProperty("/Zfilename", that.fileName);
			c.setProperty("/Zfiletype", that.fileType);
		};
		reader.readAsDataURL(file);
	},
	
	convertBinaryToHex: function(buffer) {
        return Array.prototype.map.call(new Uint8Array(buffer), function(x) {
            return ("00" + x.toString(16)).slice(-2);
        }).join("");
    },
    
	onNavigateHome: function () {
		this.oRouter.navTo("master", {});
	},
	_onNavigateBack: function () {
		window.history.go(-1);
	},
	salesOrderCreate: function () {
		var c = this.oApplicationFacade.getApplicationModel("soc_cart");
		var s = {};
		var t = this;
		if (typeof c.getData().PurchaseOrder === "undefined") {
			c.getData().PurchaseOrder = "";
		}
		if (typeof c.getData().NotesToReceiver === "undefined") {
			c.getData().NotesToReceiver = "";
		}
		if (typeof c.getData().ShippingInstructions === "undefined") {
			c.getData().ShippingInstructions = "";
		}
		s.SingleShipment = c.getData().SingleShipment;
		s.SalesOrderSimulation = false;
		s.SalesOrderNumber = "0";
		s.PO = c.getData().PurchaseOrder;
		s.RequestedDate = c.getData().singleRdd;
		s.CustomerID = c.getData().CustomerNumber;
		s.SalesOrganization = c.getData().SalesOrganization;
		s.DistributionChannel = c.getData().DistributionChannel;
		s.Division = c.getData().Division;
		s.ShipmentInstruction = c.getData().ShippingInstructions;
		s.NotesToReceiver = c.getData().NotesToReceiver;
		s.ShipToPartnerID = c.getData().PartnerID;
		s.Zcondition = c.getData().Zcondition;//141541/10 Ajustes FIORI - GRUPO I
		//s.Zrequesteddatesum = this.OrderDataRadio;
		s.Zrequesteddatesum = this.getView().getModel("soc_cart").getData().Zrequesteddatesum;
		s.Zfilecontent = this.getView().getModel("soc_cart").getData().Zfilecontent;
		s.Zfilename = this.getView().getModel("soc_cart").getData().Zfilename;
		//s.Zfiletype = this.getView().getModel("soc_cart").getData().Zfiletype;
		s.Zfiletype = "teste";
		/*if (s.Zfilecontent == "" || s.Zfilecontent == null) {
			t._oBusyDialog.close();
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Anexar um arquvio"
			});
			return;
		}*/	
		s.Ztipoentrega = c.getData().Ztipoentrega;
		s.Ztipofrete = c.getData().Ztipofrete;
		s.OrderItemSet = [];
		var a = c.getData().oShoppingCartItems;
		var b = sap.ui.core.format.NumberFormat.getIntegerInstance({
			minIntegerDigits: 6,
			maxIntegerDigits: 6
		});
		var j = 0;
		var i;
		for (i = 0; i < a.length; i++) {
			if (a[i].isVisible === true) {
				var C = {};
				C.Quantity = a[i].qty;
				C.UnitofMeasure = a[i].UOM;
				C.RequestedDeliveryDate = a[i].RDD;
				C.Product = a[i].Product;
				C.SalesOrderNumber = a[i].SalesOrderNumber;
				C.ItemNumber = b.format(10 * (i + 1));
				C.Currency = a[i].Currency;
				//fernaj10
				C.Kbetr = a[i].Kbetr;
				if (a[i].Zp80 === undefined || a[i].Zp80 === "") {
					a[i].Zp80 = "0";
				}
				C.Zp80 = a[i].Zp80;
				s.OrderItemSet[j] = C;
				j++;
			}
		}
		t.oSOCartModel.create("/SalesOrders", s, {
			success: function (d, r) {
				t._oBusyDialog.close();
				var oFileUploader = t.byId("fileUploader2");
				oFileUploader.clear();
				t.salesOrderCreated(r.data.DocList);
			},
			error: function fnError(e) {
				t._oBusyDialog.close();
				var d = t.oApplicationFacade.getResourceBundle().getText("ERROR");
				zcus.sd.pn.salesorder.create.util.Utils.dialogErrorMessage(e.response, d);
			},
			async: true
		});
	},
	salesOrderCreated: function (s) {
		var t = this;
		/*sap.ca.ui.message.showMessageBox({
			type: sap.ca.ui.message.Type.SUCCESS,
			message: zcus.sd.pn.salesorder.create.util.Formatter.formatSuccessMessage(s)
		}, function () {
			zcus.sd.pn.salesorder.create.util.ModelUtils.resetCartKeepCustomers();
			t.onNavigateHome();
		});*/
		sap.m.MessageBox.success(zcus.sd.pn.salesorder.create.util.Formatter.formatSuccessMessage(s), {
		    title: "Sucesso",                                    // default
		    onClose: function () {
				zcus.sd.pn.salesorder.create.util.ModelUtils.resetCartKeepCustomers();
				t.onNavigateHome();
			},                                       // default
		    styleClass: "",                                      // default
		    actions: sap.m.MessageBox.Action.OK,                 // default
		    emphasizedAction: sap.m.MessageBox.Action.OK,        // default
		    initialFocus: null,                                  // default
		    textDirection: sap.ui.core.TextDirection.Inherit     // default
		});
	},
	onCancel: function () {
		var t = this;
		sap.ca.ui.dialog.confirmation.open({
			question: this.oApplicationFacade.getResourceBundle().getText("CONFIRM_CLEAR_CART"),
			showNote: false,
			title: this.oApplicationFacade.getResourceBundle().getText("CONFIRMATION"),
			confirmButtonLabel: this.oApplicationFacade.getResourceBundle().getText("YES")
		}, function (r) {
			if (r.isConfirmed) {
				var oFileUploader = t.byId("fileUploader2");
				oFileUploader.clear();
				zcus.sd.pn.salesorder.create.util.ModelUtils.resetCartKeepCustomers();
				t.onNavigateHome();
			}
		});
	},
	booleanFormatter: function (v) {
		return this.oApplicationFacade.getResourceBundle().getText(v ? "SINGLE_SHIPMENT_YES" : "SINGLE_SHIPMENT_NO");
	},
	getHeaderFooterOptions: function () {
		var b = [];
		b.push({
			sI18nBtnTxt: "PLACE_ORDER",
			onBtnPressed: jQuery.proxy(this.onNavigateSubmit, this)
		});
		b.push({
			sI18nBtnTxt: "CANCEL",
			onBtnPressed: jQuery.proxy(this.onCancel, this)
		});
		return {
			sI18NFullscreenTitle: "REVIEW_TITLE",
			buttonList: b,
			onBack: this._onNavigateBack,
			bSuppressBookmarkButton: true
		};
	},
	downloadCart: function (oEvent) { 
		
		var c = this.oApplicationFacade.getApplicationModel("soc_cart");
		var a = c.getData().oShoppingCartItems;
		var j = 0;
		itens = [];
		for (i = 0; i < a.length; i++) {
			if (a[i].isVisible === true) {
				var C = {};
				C.material = a[i].ProductEan;
				C.quantidade = a[i].qty;
				if (a[i].Zp80 === undefined || a[i].Zp80 === "") {
					a[i].Zp80 = "0";
				}
				C.desconto = a[i].Zp80;
				
				itens[j] = C;
				j++;
			}
		}
        /*var itens = [
		  {
		    material: '7896029074619',
		    quantidade: '1',
		    desconto: '0'
		  }
		]*/
		const excelHeader = [
		  "Material",
		  "Quantidade",
		  "Desconto"
		]
		const worksheet = XLSX.utils.json_to_sheet(itens);
	    const workbook = XLSX.utils.book_new();
	    XLSX.utils.book_append_sheet(workbook, worksheet, "Itens");
	    XLSX.utils.sheet_add_aoa(worksheet, [excelHeader], { origin: "A1" });
	    let wscols = []
	    excelHeader.map(arr => {
	      wscols.push({ wch: arr.length + 5 })
	    })
	    worksheet["!cols"] = wscols;
	    XLSX.writeFile(workbook, "Export Cart.xlsx", { compression: true });
    },
});