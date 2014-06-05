/// <reference path="APIScripts/MapBuilder.js" />
/// <reference path="APIScripts/MapManager.js" />
/// <reference path="Scripts/jquery-2.1.1.js" />

$(function () {
    var isEditMode = true;
    mapManager.createMap('map-canvas', isEditMode);  
});