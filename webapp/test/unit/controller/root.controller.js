/*global QUnit*/

sap.ui.define([
	"ns/exercise5/controller/root.controller"
], function (Controller) {
	"use strict";

	QUnit.module("root Controller");

	QUnit.test("I should test the root controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
