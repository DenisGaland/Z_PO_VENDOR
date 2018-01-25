sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../TABLE/TableExampleUtils",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/core/BusyIndicator",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller, TableExampleUtils, MessageToast, MessageBox, JSONModel, ODataModel, ResourceModel, BusyIndicator, Filter,
	FilterOperator) {
	"use strict";
	return Controller.extend("Press_Shop_Fiori10Z_PO_VENDOR.controller.View1", {

		onInit: function() {
			var oView = this.getView();
			var oController = this;
			var i18nModel = new ResourceModel({
				bundleName: "Press_Shop_Fiori10Z_PO_VENDOR.i18n.i18n" //,
			});
			oView.setModel(i18nModel, "i18n");
			var osite = oView.byId("__PLANT");
			var URL = "/sap/opu/odata/sap/ZGET_PLANT_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/S_T001WSet(Type='')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				var plant = response.EPlant;
				var name1 = response.ET001w.Name1;
				var site = plant + " " + name1;
				osite.setText(site);
				oController.getData();
				jQuery.sap.delayedCall(500, this, function() {
					oView.byId("SearchArt").focus();
				});
				oView.byId("Article").setVisible(true);
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		ClearBox: function(oEvent) {
			var oView = this.getView();
			var infoMsg = oView.getModel("i18n").getResourceBundle().getText("confirm_clear");
			MessageBox.confirm(infoMsg, {
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function(sButton) {
					if (sButton === MessageBox.Action.OK) {
						debugger;
						var URL = "/sap/opu/odata/sap/ZPREPARE_FLUX_SRV/ItemsSet(Zfilter='T" + "06" + "')";
						BusyIndicator.show();
						OData.read(URL, function(response) {
							BusyIndicator.hide();
							if (response.Message !== "" && response.EZtype === "O") {
								oView.byId("TOOL_BAR").setVisible(false);
								oView.byId("table1").setVisible(false);
								var model = new JSONModel();
								oView.setModel(model, "itemModel");
								infoMsg = oView.getModel("i18n").getResourceBundle().getText("list_cleared");
								MessageBox.show(infoMsg, {
									icon: MessageBox.Icon.INFORMATION,
									actions: [MessageBox.Action.OK],
									onClose: function(oAction) {
										if (oAction === "OK") {
											jQuery.sap.delayedCall(500, this, function() {
												oView.byId("SearchArt").focus();
											});
										}
									}
								});
							}
						}, function(error) {
							BusyIndicator.hide();
							MessageBox.error(JSON.parse(error.response.body).error.message.value, {
								title: "Error"
							});
						});
					}
				}
			});
		},

		SaveSelected: function(evt) {
			var oView = this.getView();
			var URL = "/sap/opu/odata/sap/ZPREPARE_FLUX_SRV/ItemsSet(Zfilter='C06')";
			debugger;
			BusyIndicator.show();
			OData.read(URL, function(response) {
				BusyIndicator.hide();
				if (response.Message !== "" && response.EZtype === "O") {
					oView.byId("TOOL_BAR").setVisible(false);
					oView.byId("table1").setVisible(false);
					var model = new JSONModel();
					oView.setModel(model, "itemModel");
					MessageBox.show(response.Message, {
						icon: MessageBox.Icon.INFORMATION,
						actions: [MessageBox.Action.OK],
						onClose: function(oAction) {
							if (oAction === "OK") {
								jQuery.sap.delayedCall(500, this, function() {
									oView.byId("SearchArt").focus();
								});
							}
						}
					});
				} else {
					jQuery.sap.delayedCall(500, this, function() {
						oView.byId("SearchArt").focus();
					});
					var path = $.sap.getModulePath("Press_Shop_Fiori10Z_PO_VENDOR", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					MessageBox.show(response.Message, {
						icon: MessageBox.Icon.ERROR,
						onClose: function() {
							jQuery.sap.delayedCall(500, this, function() {
								oView.byId("SearchArt").focus();
							});
						}
					});
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		searchArt: function(oEvent) {
			var oController = this;
			var oView = this.getView();
			var material = oView.byId("SearchArt").getValue();
			var URL = "/sap/opu/odata/sap/ZCHECK_VALUE_SCAN_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/MessageSet(PValue='0202" + material + "')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				if (response.EMessage !== "" && response.EZtype === "E") {
					var path = $.sap.getModulePath("Press_Shop_Fiori10Z_PO_VENDOR", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					oView.byId("SearchArt").setValue("");
					var infoMsg = oView.getModel("i18n").getResourceBundle().getText("scan_a_valid_material");
					MessageBox.show(infoMsg, {
						icon: MessageBox.Icon.INFORMATION,
						onClose: function() {
							jQuery.sap.delayedCall(500, this, function() {
								oView.byId("SearchArt").focus();
							});
						}
					});
				} else {
					jQuery.sap.delayedCall(500, this, function() {
						oView.byId("SearchArt").focus();
					});
					oController.getData(material);
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		/*getData: function(material) {
			var oView = this.getView();
			var oTable = oView.byId("table1");
			var searchString = null;
			if (material == null) {
				searchString = "A" + "/" + "06";
			} else {
				searchString = "A" + material + "/" + "06";
			}
			var config = this.getOwnerComponent().getManifest();
			var sServiceUrl = config["sap.app"].dataSources.ZPREPARE_FLUX_SRV.uri;
			var oDataModel = new ODataModel(sServiceUrl, true);
			var query = "/ItemsSet";
			var oFilter = new Filter("Zfilter", FilterOperator.EQ, searchString);
			BusyIndicator.show();
			oDataModel.read(query, {
				filters: [oFilter],
				success: function(oData, response) {
					BusyIndicator.hide();
					var newArray = response.results;
					var lines = newArray.length;
					if (response.results[0] != null) {
						oView.byId("TOOL_BAR").setVisible(true);
						oTable.setVisible(true);
						var sum = parseInt(response.results[0].Menge);
						for (var i = 1; i < response.results.length; i++) {
							if (i < response.results.length) {
								sum = parseInt(response.results[i].Menge) + sum;
							}
						}
						var model2 = new JSONModel({
							"Sum": sum,
							"Products": lines
						});
						oView.setModel(model2, "Model2");
						var model = new JSONModel({
							"items": newArray
						});
						model.setSizeLimit(2000);
						oView.setModel(model, "itemModel");
					}
				},
				error: function(error) {
					BusyIndicator.hide();
					MessageBox.error(JSON.parse(error.response.body).error.message.value, {
						title: "Error"
					});
				}
			});
		}*/

		getData: function(material,from) {
			var oView = this.getView();
			var oTable = oView.byId("table1");
			var searchString = null;
			if (material == null) {
				searchString = "A" + "/" + "06";
			} else {
				if (from == null){
					searchString = "A" + material + "/" + "06";	
				} else {
					searchString = "M/" + material + "/" + "06/" + from;
				}
			}
			var URL = "/sap/opu/odata/sap/ZPREPARE_FLUX_SRV/ItemsSet?$filter=Zfilter " + "%20eq%20" + "%27" + searchString + "%27&$format=json";
			oView.byId("SearchArt").setValue("");
			debugger;
			BusyIndicator.show();
			OData.read(URL, function(response) {
				BusyIndicator.hide();
				var newArray = response.results;
				var lines = newArray.length;
				if (response.results[0] != null) {
					oView.byId("TOOL_BAR").setVisible(true);
					oTable.setVisible(true);
					var sum = parseInt(response.results[0].Menge);
					for (var i = 1; i < response.results.length; i++) {
						if (i < response.results.length) {
							sum = parseInt(response.results[i].Menge) + sum;
						}
					}
					var model2 = new JSONModel({
						"Sum": sum,
						"Products": lines
					});
					oView.setModel(model2, "Model2");
					var model = new JSONModel({
						"items": newArray
					});
					model.setSizeLimit(2000);
					oView.setModel(model, "itemModel");
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},
		
		update: function(evt) {
			var oView = this.getView();
			var oArticle_input = oView.byId("SearchArt");
			var id = evt.mParameters.id;
			var number = evt.mParameters.selectedItem.getText();
			id = id.replace("oSelect", "gtin");
			var gtin = oView.byId(id).getText();
			if (!isNaN(number) && number > 0) {
				this.getData(gtin, number);
				jQuery.sap.delayedCall(500, this, function() {
					oArticle_input.focus();
				});
			} else {
				var path = $.sap.getModulePath("Press_Shop_Fiori2", "/audio");
				var aud = new Audio(path + "/MOREINFO.png");
				aud.play();
				var infoMsg = oView.getModel("i18n").getResourceBundle().getText("numerical");
				MessageBox.show(infoMsg, {
					icon: MessageBox.Icon.ERROR,
					onClose: function() {
						jQuery.sap.delayedCall(500, this, function() {
							oArticle_input.focus();
						});
					}
				});
			}
		}
	});
});