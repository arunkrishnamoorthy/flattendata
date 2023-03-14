sap.ui.define(
  ["sap/ui/core/mvc/Controller"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller) {
    "use strict";

    return Controller.extend("ns.exercise5.controller.root", {
      onInit: function () {
        this._mColumns = {};
        this._mCellIdentifier = {};
        this.loadData().attachEventOnce("requestCompleted", () => {
          this.formatData();
        });
        var oFlatDataModel = new sap.ui.model.json.JSONModel();
        this.getView().setModel(oFlatDataModel, "flat");
        this._oRowTemplate = { lineNo: "", item: "", code: "" };
      },

      loadData: function () {
        var oModel = new sap.ui.model.json.JSONModel("../model/data.json");
        this.getView().setModel(oModel);
        return oModel;
      },

      formatData: function () {
        debugger;
        var oData = this.getView().getModel().getData();
        var aCells = oData.DecisionTable["Cell"];
        var aColumns = oData.DecisionTable["Column"];
        var aRows = oData.DecisionTable["Row"];

        // Construct row structure by flattening columns
        this._mapColumns(aColumns);

        $.each(aCells, (index, cell) => {
          // row
          if (!this._mCellIdentifier[cell.RowId]) {
            this._mCellIdentifier[cell.RowId] = {};
          }
          // column
          if (!this._mCellIdentifier[cell.RowId][cell.ColumnId]) {
            this._mCellIdentifier[cell.RowId][cell.ColumnId] = {};
          }
          this._mCellIdentifier[cell.RowId][cell.ColumnId] = cell.AST.find(
            (element) => {
              var keys = Object.keys(element);
              if (keys.indexOf("Value") > 0) {
                return true;
              }
              return false;
            }
          );
        });
        var aFlattendData = [];
        $.each(this._mCellIdentifier, (row, column) => {
          var oRowData = $.extend({}, this._oRowTemplate);
          var i = 0;
          $.each(column, (index, cell) => {
            var keys = Object.keys(oRowData);
            oRowData[keys[i]] = cell.Value;
            i++;
          });
          oRowData["identifier"] = [row, column];
          aFlattendData.push(oRowData);
        });

        this.getView().getModel("flat").setData({
          rows: aFlattendData,
        });
      },

      _mapColumns: function (aColumns) {
        $.each(aColumns, (index, column) => {
          if (!this._mColumns[column.Id]) {
            this._mColumns[column.Id] = column;
          }
        });
      },

      handleSaveChanges: function (oEvent) {
        var aFlattendData = this.getView().getModel("flat").getData().rows;
        var aColumnKeys = Object.keys(this._oRowTemplate);
        $.each(aFlattendData, (index, oFlatData) => {
          const [row, column] = oFlatData.identifier;
          var i = 0;
          $.each(column, (key, element) => {
            var sColumnName = aColumnKeys[i];
            element["Value"] = oFlatData[sColumnName];
            i++;
          });
        });

        // update the original payload.
        var oData = this.getView().getModel().getData();
        var aCells = oData.DecisionTable["Cell"];
        $.each(aCells, (index, cell) => {
          var oUpdatedValue = this._mCellIdentifier[cell.RowId][cell.ColumnId];
          cell.AST = cell.AST.map((element) => {
            var keys = Object.keys(element);
            if (keys.indexOf("Value") > 0) {
              element["Value"] = oUpdatedValue["Value"];
            }
            return element;
          });
        });
        debugger;
      },
    });
  }
);
