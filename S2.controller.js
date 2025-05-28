/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.ca.scfld.md.controller.BaseMasterController");
jQuery.sap.require("sap.ca.scfld.md.controller.ScfldMasterController");
jQuery.sap.require("sap.ui.core.mvc.Controller");
jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("sap.ui.model.odata.Filter");
jQuery.sap.require("sap.ca.ui.CustomerContext");

jQuery.sap.require("sap.ui.model.FilterOperator");

jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.ModelUtils");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.Utils");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.jszip");
jQuery.sap.require("zcus.sd.pn.salesorder.create.util.xlsx");
//jQuery.sap.require("zcus.sd.pn.salesorder.create.util.xlsx2");

sap.ca.scfld.md.controller.ScfldMasterController.extend("zcus.sd.pn.salesorder.create.view.S2", {
	onInit: function () {
		sap.ca.scfld.md.controller.ScfldMasterController.prototype.onInit.call(this);
		this.isSalesOrder = true;
		this.setDefaultSelection = false;
		this.customerEvent = 0;
		this.sFilterPattern = "";
		this.lock = false;
		this.oModel = new sap.ui.model.json.JSONModel();
		this.initializeValues();
		this.getList().attachUpdateStarted({}, this.onListUpdateStarted, this);
		this.getList().attachUpdateFinished({}, this.onListUpdateFinished, this);
		this.getView().addEventDelegate({
			onAfterShow: jQuery.proxy(this.onShow, this)
		});
		this._loadMaterialSearch1();
		var oData = {
			"MaterialSearch2": [{
				"Key": "",
				"Text": ""
			}]
		};
		var oModel = new sap.ui.model.json.JSONModel(oData);
		this.getView().setModel(oModel, "MaterialSearch2");
		oData = {
			"MaterialSearch3": [{
				"Key": "",
				"Text": ""
			}]
		};
		oModel = new sap.ui.model.json.JSONModel(oData);
		this.getView().setModel(oModel, "MaterialSearch3");
		
	},
	_loadMaterialSearch1: function () {
		var c = new sap.ui.model.json.JSONModel();
		var n = this.oApplicationFacade.getODataModel();
		var that = this;
		n.read("/ZMaterialSearch1Set", null, null, false, function (d) {
			n = d.results;
			var oDetail = [];
			n.forEach(function (Lin) {
				var oEntry = {};
				oEntry.Prodh = Lin.Prodh;
				oEntry.Text = Lin.Text;
				oDetail.push(oEntry);
			});
			var c = new sap.ui.model.json.JSONModel(oDetail);
			c.setSizeLimit(1000);
			that.getView().setModel(c, "MaterialSearch1");
		}, function fnError(e) {
			zcus.sd.pn.salesorder.create.utils.Utilities.dialogErrorMessage(e.response);
		});
	},
	_loadMaterialSearch2: function () {
		var f = [];
		//var key = this.byId("MaterialSearch1").getSelectedItem().getKey();
		var key = this.MaterialSearch1;
		var FilterOperator = sap.ui.model.FilterOperator.EQ;
        var filter = new sap.ui.model.Filter("Prodh", FilterOperator, key);
        var oFilter = new Array(new sap.ui.model.Filter({
            filters: [filter],
            and: true
        }));    
		var c = new sap.ui.model.json.JSONModel();
		var n = this.oApplicationFacade.getODataModel();
		var that = this;
		n.read("/ZMaterialSearch2Set", {
            filters: [filter],
            success: function (d) {
				n = d.results;
				var oDetail = [];
				n.forEach(function (Lin) {
					var oEntry = {};
					oEntry.Prodh = Lin.Prodh;
					oEntry.Text = Lin.Text;
					oDetail.push(oEntry);
				});
				var c = new sap.ui.model.json.JSONModel(oDetail);
				c.setSizeLimit(1000);
				that.getView().setModel(c, "MaterialSearch2");
            },
            error: function (e) {
				zcus.sd.pn.salesorder.create.utils.Utilities.dialogErrorMessage(e.response);
			}
		});
	},
	_loadMaterialSearch3: function () {
		var f = [];
		//var key = this.byId("MaterialSearch2").getSelectedItem().getKey();
		var key = this.MaterialSearch2;
		var FilterOperator = sap.ui.model.FilterOperator.EQ;
        var filter = new sap.ui.model.Filter("Prodh", FilterOperator, key);
        var oFilter = new Array(new sap.ui.model.Filter({
            filters: [filter],
            and: true
        }));    
		var c = new sap.ui.model.json.JSONModel();
		var n = this.oApplicationFacade.getODataModel();
		var that = this;
		n.read("/ZMaterialSearch3Set", {
            filters: [filter],
            success: function (d) {
				n = d.results;
				var oDetail = [];
				n.forEach(function (Lin) {
					var oEntry = {};
					oEntry.Prodh = Lin.Prodh;
					oEntry.Text = Lin.Text;
					oDetail.push(oEntry);
				});
				var c = new sap.ui.model.json.JSONModel(oDetail);
				c.setSizeLimit(1000);
				that.getView().setModel(c, "MaterialSearch3");
            },
            error: function (e) {
				zcus.sd.pn.salesorder.create.utils.Utilities.dialogErrorMessage(e.response);
			}
		});
	},
	onMaterialSearch1: function () {
		var lb2 = this.getView().byId("MaterialSearch2");
		lb2.setProperty("enabled", true);
		var lb3 = this.getView().byId("MaterialSearch3");
		lb3.setProperty("enabled", false);
		this._loadMaterialSearch2();
		var oDetail = [];
		var c = new sap.ui.model.json.JSONModel(oDetail);
		c.setSizeLimit(1000);
		this.getView().setModel(c, "MaterialSearch3");
	},
	onMaterialSearch2: function () {
		var lb3 = this.getView().byId("MaterialSearch3");
		lb3.setProperty("enabled", true);
		this._loadMaterialSearch3();
	},
	onValueHelpMaterialSearch1: function (oEvent) {
		if (this.oDefaultDialog) {
            this.oDefaultDialog.destroy();
        };
        this.oDefaultDialog = sap.ui.xmlfragment("Dialog", "zcus.sd.pn.salesorder.create.view.MaterialSearch1", this);
        this.getView().addDependent(this.oDefaultDialog);
        this.oDefaultDialog.open();
	},
	onValueHelpMaterialSearch2: function (oEvent) {
		if (this.oDefaultDialog) {
            this.oDefaultDialog.destroy();
        };
        this.oDefaultDialog = sap.ui.xmlfragment("Dialog", "zcus.sd.pn.salesorder.create.view.MaterialSearch2", this);
        this.getView().addDependent(this.oDefaultDialog);
        this.oDefaultDialog.open();
	},
	onValueHelpMaterialSearch3: function (oEvent) {
		if (this.oDefaultDialog) {
            this.oDefaultDialog.destroy();
        };
        this.oDefaultDialog = sap.ui.xmlfragment("Dialog", "zcus.sd.pn.salesorder.create.view.MaterialSearch3", this);
        this.getView().addDependent(this.oDefaultDialog);
        this.oDefaultDialog.open();
	},
	confirmValueHelpMaterialSearch1: function (oEvent) {
		var aContexts = oEvent.getParameter("selectedContexts");
		var Text = aContexts.map(function (oContext) {
			return oContext.getObject().Text;
		});
		var lb2 = this.getView().byId("MaterialSearch1");
		lb2.setValue(Text[0]);
		var Prodh = aContexts.map(function (oContext) {
			return oContext.getObject().Prodh;	
		});
		this.MaterialSearch1 = Prodh[0];
		this.MaterialSearch2 = '';
		this.MaterialSearch3 = '';
		var lb2 = this.getView().byId("MaterialSearch2");
		//lb2.setProperty("enabled", true);
		lb2.setValue('');
		var lb3 = this.getView().byId("MaterialSearch3");
		lb3.setProperty("enabled", false);
		lb3.setValue('');
		var oDetail = [];
		var c = new sap.ui.model.json.JSONModel(oDetail);
		if (this.MaterialSearch1 != '') {
			this._loadMaterialSearch2();
			lb2.setProperty("enabled", true);
		}else{
			this.getView().setModel(c, "MaterialSearch2");
			lb2.setProperty("enabled", false);
		}
		this.getView().setModel(c, "MaterialSearch3");
		this.updateProductsList();
	},
	confirmValueHelpMaterialSearch2: function (oEvent) {
		var aContexts = oEvent.getParameter("selectedContexts");
		var Text = aContexts.map(function (oContext) {
			return oContext.getObject().Text;
		});
		var lb2 = this.getView().byId("MaterialSearch2");
		lb2.setValue(Text[0]);
		var Prodh = aContexts.map(function (oContext) {
			return oContext.getObject().Prodh;	
		});
		//this.MaterialSearch1 = Prodh[0];
		this.MaterialSearch2 = Prodh[0];
		this.MaterialSearch3 = '';
		var lb3 = this.getView().byId("MaterialSearch3");
		lb3.setProperty("enabled", true);
		lb3.setValue('');
		if (this.MaterialSearch2 != '') {
			this._loadMaterialSearch3();
		}else{
			var oDetail = [];
			var c = new sap.ui.model.json.JSONModel(oDetail);
			this.getView().setModel(c, "MaterialSearch3");
		}
		this.updateProductsList();
	},
	confirmValueHelpMaterialSearch3: function (oEvent) {
		var aContexts = oEvent.getParameter("selectedContexts");
		var Text = aContexts.map(function (oContext) {
			return oContext.getObject().Text;
		});
		var lb3 = this.getView().byId("MaterialSearch3");
		lb3.setValue(Text[0]);
		var Prodh = aContexts.map(function (oContext) {
			return oContext.getObject().Prodh;	
		});
		//this.MaterialSearch1 = Prodh[0];
		//this.MaterialSearch2 = Prodh[0];
		this.MaterialSearch3 = Prodh[0];
		this.updateProductsList();
	},
	searchValueHelpMaterialSearch1: function (oControlEvent) {
		var sValue = oControlEvent.getParameters("value");
		var oShlpItems = oControlEvent.getSource().getBinding("items");
		var filter1 = new sap.ui.model.Filter("Prodh", sap.ui.model.FilterOperator.Contains, sValue.value);
		var filter2 = new sap.ui.model.Filter("Text", sap.ui.model.FilterOperator.Contains, sValue.value);
        var oFilter = new Array(new sap.ui.model.Filter({
            filters: [filter1, filter2],
            and: false
        }));    
		oShlpItems.filter(oFilter, "Application");
	},
	searchValueHelpMaterialSearch2: function (oControlEvent) {
		var sValue = oControlEvent.getParameters("value");
		var oShlpItems = oControlEvent.getSource().getBinding("items");
		var filter1 = new sap.ui.model.Filter("Prodh", sap.ui.model.FilterOperator.Contains, sValue.value);
		var filter2 = new sap.ui.model.Filter("Text", sap.ui.model.FilterOperator.Contains, sValue.value);
        var oFilter = new Array(new sap.ui.model.Filter({
            filters: [filter1, filter2],
            and: false
        }));    
		oShlpItems.filter(oFilter, "Application");
	},
	searchValueHelpMaterialSearch3: function (oControlEvent) {
		var sValue = oControlEvent.getParameters("value");
		var oShlpItems = oControlEvent.getSource().getBinding("items");
		var filter1 = new sap.ui.model.Filter("Prodh", sap.ui.model.FilterOperator.Contains, sValue.value);
		var filter2 = new sap.ui.model.Filter("Text", sap.ui.model.FilterOperator.Contains, sValue.value);
        var oFilter = new Array(new sap.ui.model.Filter({
            filters: [filter1, filter2],
            and: false
        }));    
		oShlpItems.filter(oFilter, "Application");
	},
	
	onShow: function () {
		var c = this.oApplicationFacade.getApplicationModel("soc_cart");
		if (!c || !c.getData().CustomerName) {
			//this._setCustomerControl();
		}
	},
	onListUpdateStarted: function () {
		this.getView().byId("list").setNoDataText(this.oApplicationFacade.getResourceBundle().getText("LOADING"));
	},
	onListUpdateFinished: function () {
		this.getView().byId("list").setNoDataText(this.oApplicationFacade.getResourceBundle().getText("NO_ITEMS_AVAILABLE"));
	},
	onRequestCompleted: function () {
		this.lock = false;
		if (sap.ui.Device.system.phone) {
			return;
		}
		if (this.setDefaultSelection) {
			this.setDefaultSelection = false;
			if (this.getList().getItems().length > 0) {
				if (this.isSalesOrder) {
					this.setListItem(this.getList().getItems()[1]);
					/*var b2 = this.getView().byId("__item8");
					b2.setProperty("display", "none");*/
				} else {
					this.setListItem(this.getList().getItems()[0]);
				}
			} else {
				this.getView().byId("list").setNoDataText(this.oApplicationFacade.getResourceBundle().getText("NO_ITEMS_AVAILABLE"));
				this.navToEmpty();
			}
		}
	},
	onNavToSalesOrders: function () {
		/*if (this.lock) {
			return;
		}*/
		this.lock = true;
		this.isSalesOrder = true;
		this.updateCustomer();
	},
	onNavToProducts: function () {
		/*if (this.lock) {
			return;
		}*/
		this.lock = true;
		this.isSalesOrder = false;
		this.updateCustomer();
	},
	updateCustomer: function () {
		var c = this.oApplicationFacade.getApplicationModel("soc_cart");
		if (c && c.getData()) {
			this.oCustomerID = c.getData().CustomerNumber;
			this.oCustomerName = c.getData().CustomerName;
			this.oSalesOrganization = c.getData().SalesOrganization;
			this.oDivision = c.getData().Division;
			this.DistributionChannel = c.getData().DistributionChannel;
			this.CustName = c.getData().CustomerName;
			this.Zcidade = c.getData().Zcidade;
			this.Zbairro = c.getData().Zbairro;
			this.Zregio = c.getData().Zregio;
			this.Ztipofrete = ""
			//this.Zcondition = c.getData().Zcondition;
			if (this.isSalesOrder) {
				this.updateSalesOrdersList();
			} else {
				this.updateProductsList();
			}
		}
	},
	updateSalesOrdersList: function () {
		var f = [];
		var s = new sap.ui.model.Sorter("PO", false, this.oGroupPO);
		f.push(new sap.ui.model.Filter("SalesOrganization", sap.ui.model.FilterOperator.EQ, this.oSalesOrganization));
		f.push(new sap.ui.model.Filter("DistributionChannel", sap.ui.model.FilterOperator.EQ, this.DistributionChannel));
		f.push(new sap.ui.model.Filter("CustomerID", sap.ui.model.FilterOperator.EQ, this.oCustomerID));
		f.push(new sap.ui.model.Filter("Division", sap.ui.model.FilterOperator.EQ, this.oDivision));
		f.push(new sap.ui.model.Filter("SalesOrderNumber", sap.ui.model.FilterOperator.Contains, this.sFilterPattern));
		this.setDefaultSelection = true;
		this.getList().bindItems("/SalesOrders", new sap.ui.xmlfragment("zcus.sd.pn.salesorder.create.view.ListItemTemplate", this), s, f);
		var t = this.getView().byId("SOC_MasterListHeaderTitle");
		t.setText(this.oApplicationFacade.getResourceBundle().getText("MASTER_TITLE", [this.CustName]));
		
		var t2 = this.getView().byId("SOC_MasterListHeaderTitle2");
		t2.setText(this.oApplicationFacade.getResourceBundle().getText([this.Zcidade]));
		
		var t3 = this.getView().byId("SOC_MasterListHeaderTitle3");
		t3.setText(this.oApplicationFacade.getResourceBundle().getText([this.Zregio]));
		
		var b1 = this.getView().byId("excelButton");
		b1.setProperty("enabled", true);
		/*var b2 = this.getView().byId("excelButton2");
		b2.setProperty("enabled", true)
		var b3 = this.getView().byId("excelButton3");
		b3.setProperty("enabled", true)*/
		
		var tb1 = this.getView().byId("TbMaterialSearch1");
		tb1.setProperty("visible", false)
		
		var tb2 = this.getView().byId("TbMaterialSearch2");
		tb2.setProperty("visible", false)
		
		var tb3 = this.getView().byId("TbMaterialSearch3");
		tb3.setProperty("visible", false)
		
		this.registerMasterListBind(this.getList());
	},
	updateProductsList: function () {
		var f = [];
		f.push(new sap.ui.model.Filter("SalesOrganization", sap.ui.model.FilterOperator.EQ, this.oSalesOrganization));
		f.push(new sap.ui.model.Filter("DistributionChannel", sap.ui.model.FilterOperator.EQ, this.DistributionChannel));
		//fernaj10
		f.push(new sap.ui.model.Filter("Division", sap.ui.model.FilterOperator.EQ, this.oDivision));
		f.push(new sap.ui.model.Filter("CustomerNo", sap.ui.model.FilterOperator.EQ, this.oCustomerID));
		f.push(new sap.ui.model.Filter("ProductID", sap.ui.model.FilterOperator.Contains, this.sFilterPattern));
		if	(this.MaterialSearch1 === undefined) {
		} else if (this.MaterialSearch3 != '') {
			f.push(new sap.ui.model.Filter("Zprodh", sap.ui.model.FilterOperator.EQ, this.MaterialSearch3));
		}else if (this.MaterialSearch2 != ''){
			f.push(new sap.ui.model.Filter("Zprodh", sap.ui.model.FilterOperator.EQ, this.MaterialSearch2));
		}else if (this.MaterialSearch1 != ''){
			f.push(new sap.ui.model.Filter("Zprodh", sap.ui.model.FilterOperator.EQ, this.MaterialSearch1));
		}
		this.setDefaultSelection = true;
		this.getList().bindItems("/Products", new sap.ui.xmlfragment("zcus.sd.pn.salesorder.create.view.ProductListItemTemplate", this), null, f);
		var t = this.getView().byId("SOC_MasterListHeaderTitle");
		t.setText(this.oApplicationFacade.getResourceBundle().getText("PRODUCTS_CUST", [this.CustName]));
		
		var t2 = this.getView().byId("SOC_MasterListHeaderTitle2");
		t2.setText(this.oApplicationFacade.getResourceBundle().getText([this.Zcidade]));
		
		var t3 = this.getView().byId("SOC_MasterListHeaderTitle3");
		t3.setText(this.oApplicationFacade.getResourceBundle().getText([this.Zregio]));
		
		var b1 = this.getView().byId("excelButton");
		b1.setProperty("enabled", true)
		/*var b2 = this.getView().byId("excelButton2");
		b2.setProperty("enabled", true)
		var b3 = this.getView().byId("excelButton3");
		b3.setProperty("enabled", true)*/
		
		var tb1 = this.getView().byId("TbMaterialSearch1");
		tb1.setProperty("visible", true)
		
		var tb2 = this.getView().byId("TbMaterialSearch2");
		tb2.setProperty("visible", true)
		
		var tb3 = this.getView().byId("TbMaterialSearch3");
		tb3.setProperty("visible", true)
		
		this.registerMasterListBind(this.getList());
	},
	oGroupPO: function (c) {
		return c.getProperty("PO");
	},
	getHeaderFooterOptions: function () {
		if (sap.ui.Device.system.phone) {
			return {};
		}
		return {};
	},
	initializeValues: function () {
		this.top = 30;
		this.skip = 0;
		this.searchSkip = 0;
		this.firstTime = true;
		this.serverSearch = false;
		this.clientSearch = false;
		this.latestFetch = 0;
		this.latestSearchFetch = 0;
	},
	setListItem: function (i) {
		if (i && i.getBindingContext()) {
			this.setDefaultSelection = false;
			var l = this.getList();
			l.removeSelections();
			i.setSelected(true);
			l.setSelectedItem(i, true);
			if (this.isSalesOrder) {
				this.oRouter.navTo("detail", {
					contextPath: i.getBindingContext().sPath.substr(1)
				}, !sap.ui.Device.system.phone);
			} else {
				this.oRouter.navTo("productdetail", {
					customerID: this.oCustomerID,
					productID: encodeURIComponent(i.getBindingContext().getProperty("ProductID")),
					salesOrganization: this.oSalesOrganization,
					distributionChannel: this.DistributionChannel,
					division: this.oDivision
				}, !sap.ui.Device.system.phone);
			}
		}
	},
	navToEmpty: function () {
		if (this.isSalesOrder) {
			this.oRouter.navTo("noData", {
				viewTitle: "SALES_ORDER_DETAIL",
				languageKey: "NO_ITEMS_AVAILABLE"
			}, !sap.ui.Device.system.phone);
		} else {
			this.oRouter.navTo("noData", {
				viewTitle: "PRODUCT_DETAIL",
				languageKey: "NO_ITEMS_AVAILABLE"
			}, !sap.ui.Device.system.phone);
		}
	},
	onDataLoaded: function () {
		this.onRequestCompleted();
	},
	applySearchPatternToListItem: function (i, f) {
		if (f === "") {
			return true;
		}
		if (!i.getBindingContext()) {
			return false;
		}
		return sap.ca.scfld.md.controller.BaseMasterController.prototype.applySearchPatternToListItem.call(null, i, f);
	},
	isLiveSearch: function () {
		return true;
	},
	isBackendSearch: function () {
		return true;
	},
	applyBackendSearchPattern: function (f, b) {
		this.sFilterPattern = f;
		var F = [];
		if (this.isSalesOrder) {
			F = [new sap.ui.model.Filter("CustomerID", sap.ui.model.FilterOperator.EQ, this.oCustomerID), 
				new sap.ui.model.Filter("SalesOrderNumber", sap.ui.model.FilterOperator.Contains, f), 
				new sap.ui.model.Filter("SalesOrganization", sap.ui.model.FilterOperator.EQ, this.oSalesOrganization), 
				new sap.ui.model.Filter("DistributionChannel", sap.ui.model.FilterOperator.EQ, this.DistributionChannel),
				new sap.ui.model.Filter("Division", sap.ui.model.FilterOperator.EQ, this.oDivision)
			];
		} else {
			
			//var lv_CustomerID = "'" + this.oCustomerID + "'";
			
			F = [new sap.ui.model.Filter("ProductID", sap.ui.model.FilterOperator.Contains, f), 
				new sap.ui.model.Filter("SalesOrganization", sap.ui.model.FilterOperator.EQ, this.oSalesOrganization), 
				new sap.ui.model.Filter("DistributionChannel", sap.ui.model.FilterOperator.EQ,this.DistributionChannel),
				new sap.ui.model.Filter("CustomerNo", sap.ui.model.FilterOperator.EQ, this.oCustomerID),
				new sap.ui.model.Filter("Division", sap.ui.model.FilterOperator.EQ, this.oDivision)
				];
		}
		this.setDefaultSelection = true;
		b.filter(F, sap.ui.model.FilterType.Application);
	},
	_setCustomerControl: function () {
		this.customerContext = new sap.ca.ui.CustomerContext({
			dialogTitle: "Cliente",
			personalizationPageName: "ZSRA017_SD_SO_CR",
			showSalesArea: true,
			customerSelected: jQuery.proxy(this.onCustomerSelected, this),
			path: "/Customers"
		});
		this.customerContext.setModel(this.oApplicationFacade.getODataModel());
		this.customerContext.select();
	},
	changeInCustomerContext: function () {
		this.setDefaultSelection = true;
		this.customerChanged = true;
		this.tCustommerID = '';
		//this.customerContext.change();
		if (this.oDefaultDialog) {
            this.oDefaultDialog.destroy();
        };
        this.oDefaultDialog = sap.ui.xmlfragment("Dialog", "zcus.sd.pn.salesorder.create.view.CustomerSelect", this);
        this.getView().addDependent(this.oDefaultDialog);
        this.oDefaultDialog.open();
	},
	handleSelectionChange: function (oEvent) {
		var oContext = oEvent.getParameter('listItem').getBindingContext().getObject()
		this.tCustommerID = oContext.CustomerID;
		this.tCustomerName = oContext.CustomerName;
		this.tDistributionChannel = oContext.DistributionChannel;
		this.tSalesOrganization = oContext.SalesOrganization;
		this.tZbairro = oContext.Zbairro;
		this.tZcidade = oContext.Zcidade;
		this.tZregio = oContext.Zregio;
		this.tDivision = '05';
       //var oContext = oEvent.getParameters('listItem').getBidingContext().getObject();
    },
	onCloseCustomerSelect: function (oEvent) {
        this.oDefaultDialog.close();
		this.oDefaultDialog.destroy();
		this.customerChanged = false;
    },
    onAcceptCustomerSelect: function (e) {
    	if (this.tCustommerID != '') {
	    	this.setDefaultSelection = true;
	    	this.customerChanged = true;
	    	//var oContext = e.getParameters('listItem').getBidingContext().getObject();
			if (this.customerChanged) {
				this.customerChanged = false;
				//this.customerNewParams = e.getParameters();
				var t = this;
				sap.ca.ui.dialog.confirmation.open({
					question: "Fazer seleção de cliente e esvaziar o carrinho?",
					showNote: false,
					title: this.oApplicationFacade.getResourceBundle().getText("CONFIRMATION"),
					confirmButtonLabel: this.oApplicationFacade.getResourceBundle().getText("YES")
				}, function (r) {
					if (r.isConfirmed) {
						t.oDefaultDialog.close();
						t.oDefaultDialog.destroy();
						t.zhandleCustomerChange();
					}
				});
			} else if (this.customerChanged === undefined && e.getParameters().CustomerID === undefined) {} else {
				//this.handleCustomerChange(e.getParameters());
			}
    	}	
    },
    
	onCustomerSelected: function (e) {
		this.setDefaultSelection = true;
		if (this.customerChanged) {
			this.customerChanged = false;
			this.customerNewParams = e.getParameters();
			var t = this;
			sap.ca.ui.dialog.confirmation.open({
				question: this.oApplicationFacade.getResourceBundle().getText("CONFIRM_CLEAR_CART"),
				showNote: false,
				title: this.oApplicationFacade.getResourceBundle().getText("CONFIRMATION"),
				confirmButtonLabel: this.oApplicationFacade.getResourceBundle().getText("YES")
			}, function (r) {
				if (r.isConfirmed) {
					t.handleCustomerChange(t.customerNewParams);
				}
			});
		} else if (this.customerChanged === undefined && e.getParameters().CustomerID === undefined) {} else {
			this.handleCustomerChange(e.getParameters());
		}
	},
	handleCustomerChange: function (c) {
		zcus.sd.pn.salesorder.create.util.ModelUtils._setCartModel();
		var C = this.oApplicationFacade.getApplicationModel("soc_cart");
		C.getData().CustomerName = c.CustomerName;
		C.getData().CustomerNumber = c.CustomerID;
		C.getData().SalesOrganization = c.SalesOrganization;
		C.getData().Division = c.Division;
		C.getData().DistributionChannel = c.DistributionChannel;
		C.getData().Zcidade = c.Zcidade;
		C.getData().Zbairro = c.Zbairro;
		C.getData().Ztipofrete = "";
		C.getData().Ztipofretetxt = "";
		C.getData().Ztipoentrega = "";
		C.getData().Ztipoentregatxt = "";
		C.getData().ZBasePallet = "";
		//C.getData().Zcondition = c.Zcondition;
		C.getData().itemCount = 0;
		C.getData().SingleShipment = false;
		C.getData().PurchaseOrder = "";
		C.getData().NotesToReceiver = "";
		C.getData().ShippingInstructions = "";
		this.updateCustomer();
		if (c.CustomerID) var p = "(CustomerID='" + c.CustomerID + "'," + "SalesOrganization='" + c.SalesOrganization + "'," +
			"DistributionChannel='" + c.DistributionChannel + "'," + "Division='" + c.Division + "')";
		function s(r) {
			var o = sap.ca.scfld.md.app.Application.getImpl().getApplicationModel("soc_cart");
			o.getData().Currency = r.Currency;
			o.updateBindings();
		}

		function e(E) {
			zcus.sd.pn.salesorder.create.util.Utils.dialogErrorMessage(E.response);
		}
		this.oApplicationFacade.getODataModel().read("/Customers" + p, null, null, true, s, e);
	},
	zhandleCustomerChange: function () {
		zcus.sd.pn.salesorder.create.util.ModelUtils._setCartModel();
		var C = this.oApplicationFacade.getApplicationModel("soc_cart");
		C.getData().CustomerName = this.tCustomerName;
		C.getData().CustomerNumber = this.tCustommerID;
		C.getData().SalesOrganization = this.tSalesOrganization;
		C.getData().Division = this.tDivision;
		C.getData().DistributionChannel = this.tDistributionChannel;
		C.getData().Zcidade = this.tZcidade;
		C.getData().Zbairro = this.tZbairro;
		C.getData().Zregio = this.tZregio;
		C.getData().Ztipofrete = "";
		C.getData().Ztipofretetxt = "";
		C.getData().Ztipoentrega = "";
		C.getData().Ztipoentregatxt = "";
		C.getData().ZBasePallet = "";
		//C.getData().Zcondition = c.Zcondition;
		C.getData().itemCount = 0;
		C.getData().SingleShipment = false;
		C.getData().PurchaseOrder = "";
		C.getData().NotesToReceiver = "";
		C.getData().ShippingInstructions = "";
		this.updateCustomer();
		if (this.tCustommerID) var p = "(CustomerID='" + this.tCustommerID + "'," + "SalesOrganization='" + this.tSalesOrganization + "'," +
			"DistributionChannel='" + this.tDistributionChannel + "'," + "Division='" + this.tDivision + "')";
			//"DistributionChannel='" + this.tDistributionChannel + "'," + "Division='" + '05' + "')";
			function s(r) {
			var o = sap.ca.scfld.md.app.Application.getImpl().getApplicationModel("soc_cart");
			o.getData().Currency = r.Currency;
			o.updateBindings();
		}

		function e(E) {
			zcus.sd.pn.salesorder.create.util.Utils.dialogErrorMessage(E.response);
		}
		this.oApplicationFacade.getODataModel().read("/Customers" + p, null, null, true, s, e);
		var o = sap.ca.scfld.md.app.Application.getImpl().getApplicationModel("soc_cart");
			o.getData().Currency = 'BRL';
			o.updateBindings();
	},
	
	//////////////////////////////////////////////////////////////////////////////
	onPressExcelButton: function () {
		if (this.oDefaultDialog) {
            this.oDefaultDialog.destroy();
        };
        this.oDefaultDialog = sap.ui.xmlfragment("Dialog", "zcus.sd.pn.salesorder.create.view.dialogUploadFile", this);
        this.getView().addDependent(this.oDefaultDialog);
        this.oDefaultDialog.open();
	},
	downloadModelo: function (oEvent) { 
        /*let sUrl = "/sap/opu/odata/sap/ZSRA017_PN_SALESORDER_CREATE_SRV/ExcelSet?$format=xlsx";
        var encodeUrl = encodeURI(sUrl);
        sap.m.URLHelper.redirect(encodeUrl, true);*/
        var itens = [
		  {
		    material: '',
		    quantidade: '',
		    desconto: ''
		  }
		]
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
	    XLSX.writeFile(workbook, "Model.xlsx", { compression: true });
        
    },
    /*downloadCart: function (oEvent) { 
        const itens = [
		  {
		    material: '7896029074619',
		    quantidade: '1',
		    desconto: '0'
		  }
		]
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
    },*/
    
    
    
    closeDialog: function (oEvent) {
        this.oDefaultDialog.destroy();
    },
    
    pressFecharMessage: function (oEvent) {
		this.oDialogMessage.close();
		this.oDialogMessage.destroy();
	},
    
    uploadFileAction: function (oEvent) {
    	var _oBusyDialog = new sap.m.BusyDialog();
        let oFileUploader = sap.ui.core.Fragment.byId("Dialog", "fileUploader");
        let file = oFileUploader.getFocusDomRef().files[0];
        var that = this;
        let excelData = {};
        var oDataClient = this.oApplicationFacade.getApplicationModel("soc_cart").oData;
        
        if (file && window.FileReader) {
            _oBusyDialog.open();
            let reader = new FileReader();
            reader.onload = function (e) {
                let data = e.target.result;
                let workbook = XLSX.read(data, {
                    type: 'binary'
                });
                workbook.SheetNames.forEach(function (sheetName) {
                    // Here is your object for every sheet in workbook
                    excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName], { defval: "", intVal: true, rawNumbers: true });
                });
                //Verificar se arquivo vazio
                if (excelData.length === 0) {
                    oFileUploader.setValueState(sap.ui.core.ValueState.Error);
                    oFileUploader.setValueStateText("Arquivo vazio");
                    oFileUploader.focus();
                    _oBusyDialog.close();
                    return;
                };
                var oModel = that.oApplicationFacade.getODataModel(); 
                /////////////////////////////////////////
                
                let sRequest = "/ZcartHeaderSet";
                var oDetail = [];
		        var oEntry = {};
                var ZcartHeader = {
                	Customerno: oDataClient.CustomerNumber,
					Salesorganization: oDataClient.SalesOrganization,
					Distributionchannel: oDataClient.DistributionChannel,
					Division: oDataClient.Division,
					Processo: '1',			
					ZcartHeaderItem: [],
				};
				excelData.forEach(function (Lin) {
					if( Lin.Material === undefined || Lin.Quantidade === undefined || Lin.Desconto === undefined ){
						_oBusyDialog.close();
						sap.m.MessageBox.show("Arquivo com formato inválido", sap.m.MessageBox.Icon.ERROR, "Erro", [sap.m.MessageBox.Action.OK]);
				    }
					Lin.Material = Lin.Material.toString();
					Lin.Quantidade = Lin.Quantidade.toString();
					Lin.Desconto = Lin.Desconto.toString();
					if( Lin.Desconto == '' ){
						Lin.Desconto = '0';
					}
					if( Lin.Quantidade == '' ){
						Lin.Quantidade = '0';
					}
					ZcartHeader.ZcartHeaderItem.push({
	                    Customerno: oDataClient.CustomerNumber,
						Salesorganization: oDataClient.SalesOrganization,
						Distributionchannel: oDataClient.DistributionChannel,
						Division: oDataClient.Division,
						Productid: Lin.Material,
						//Productdesc: '',
						Quantity001: Lin.Quantidade,
						Desconto: Lin.Desconto,
						//Contradesconto: Lin.Desconto,
						/*Uom: Lin.Desconto,
						Uomdesc: Lin.Desconto,
						Zpeso: Lin.Desconto,
						ZpesoB: Lin.Desconto,
						ZpesoUn: Lin.Desconto,
						Zpallet: Lin.Desconto,
						Imageflag: Lin.Desconto,*/
					})
				});
                var oSuccess = function (oDataRet, oResponse) {
					_oBusyDialog.close();
					var results = oDataRet.ZcartHeaderItem;
	                var c = that.oApplicationFacade.getApplicationModel("soc_cart");
	                var n = parseInt(c.getData().singleRdd.slice(4, 6), 10) - 1;
	                var d = new Date(c.getData().singleRdd.slice(0, 4), n, c.getData().singleRdd.slice(6, 8));
	                var i = c.getData().oShoppingCartItems;
	                var I;
	                var validMaterial = false;
	                results.results.forEach(function (Lin) { 
	                	if( Lin.TypeMessage == 'S' ){
		                	if (Lin.imageFlag == 'X') {
								var a = "/sap/opu/odata/sap/ZSRA017_PN_SALESORDER_CREATE_SRV";
								I = a + "/ProductImages('" + Lin.Productid + "')/$value";
							} else {
								I = jQuery.sap.getModulePath("zcus.sd.pn.salesorder.create") + "/img/home/icon_product.png";
							}
			                var b = {
			                	ProductID: Lin.Productid,
			                	ProductEan: Lin.Productean,
								ProductDesc: Lin.Productdesc,
								qty: Lin.Quantity001,
								UOM: Lin.Uom,
								UnitofMeasureTxt: Lin.Uomdesc,
								RDD: c.getData().singleRdd,
								NetPrice: "",
								currency: "",
								Zpeso: Lin.Zpeso,
								ZpesoB: Lin.ZpesoB,
								ZpesoUn: Lin.ZpesoUn,
								Zpallet: Lin.Zpallet,
								Zqtdeemb: Lin.Zpallet,
								Zp80: Lin.Desconto,
								ImgUrl: I,
								isVisible: true,
								formatRDD: d
							};
							i.push(b);
							c.getData().itemCount = zcus.sd.pn.salesorder.create.util.ModelUtils.getCartCount();
							c.updateBindings();
		                }else{
		                	oEntry.Material = Lin.Productid.toString();
		                	oEntry.Icon = 'sap-icon://message-error';
	                    	oEntry.Color = '#FF0000';
	                    	oEntry.Mensagem = Lin.Message;
	                		oDetail.push(oEntry);
		                }
	                });
	                
	                var c = new sap.ui.model.json.JSONModel(oDetail);
	                c.setSizeLimit(500);                
	                that.getView().setModel(c, "returnMessage");
					_oBusyDialog.close();
					
					var m = that.oApplicationFacade.getResourceBundle().getText("ADDED_ITEM");
					that.oDefaultDialog.destroy();
					zcus.sd.pn.salesorder.create.util.ModelUtils.updateCartIcon();
					sap.ca.ui.message.showMessageToast(m);
					
					if( oDetail.length > 0 ){
						if (that.oDialogMessage) {
		                that.oDialogMessage.destroy();
			            };
			            that.oDialogMessage = sap.ui.xmlfragment("Dialog", "zcus.sd.pn.salesorder.create.view.ReturnMessage", that);
				        that.getView().addDependent(that.oDialogMessage);
				        that.oDialogMessage.open();
					}
				};   
	            var oError = function (oErrorRet) {
					_oBusyDialog.close();
					var oMessage = JSON.parse(oErrorRet.responseText).error.message.value;
					MessageBox.error(oMessage.message);
				};
	            oModel.create(sRequest, ZcartHeader, {
					success: oSuccess,
					error: oError
				});
            };
            
            reader.onerror = function (ex) {
                _oBusyDialog.close();
                console.log(ex);
            };
            reader.readAsBinaryString(file);
        }else{
            MessageBox.error("Preencher todos os campos");
        }
    },
});