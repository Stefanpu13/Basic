/// <reference path="google-maps-3-vs-1-0.js" />
/// <reference path="MapBuilder.js" />
/// <reference path="Menu.js" />
var mapManager = (function () {
    var maps = google.maps,
        defaultMapOptions = {
            center: new maps.LatLng(42.239818, 25.300602),
            zoom: 9,
            mapTypeId: maps.MapTypeId.SATELLITE,
            disableDefaultUI: true
        },
        map,
        mapBuilder,
        menu;
    
    function drawPolygonPoint(e) {
        var coords = e.latLng;
        mapBuilder.addMarker(coords);
    } 

    function createBlock() {
        var block = mapBuilder.addBlock(), 
            infoWindow;

        if (block !== undefined) {
            // Show info window. Attach it to marker.
            // that marker should be attached to the polygon but should not be visible.
  

        }
    }

    function deleteBlock() {
        mapBuilder.removeBlock();
    }

    function removeMarker() {
        mapBuilder.removeMarker();
    }

    function attachMapEvents() {
        maps.event.addListener(map, 'click', drawPolygonPoint);
    }

    function saveBlocks() {
      var blocks = mapBuilder.saveBlocks();
    }

    function deleteAllPoints(){
        mapBuilder.deleteAllPoints();
    }

    function initializeMenu(map) {

        menu = new Menu(map);

        menu.addControl('button', 'Build block', [{ type: 'click', func: createBlock }]);
        menu.addControl('button', 'Delete point', [{ type: 'click', func: removeMarker }]);
        menu.addControl('button', 'Delete Block', [{ type: 'click', func: deleteBlock }]);
        menu.addControl('button', 'Save Blocks', [{ type: 'click', func: saveBlocks }]);
        menu.addControl('button', 'Delete all points', [{ type: 'click', func: deleteAllPoints }]);

        return menu;
    }

    function createMap(elementId, blocks) {
        // first, init map.
        map = new google.maps.Map(document.getElementById(elementId));
        mapBuilder = new MapBuilder(map, defaultMapOptions, blocks);
        menu = initializeMenu(map);

        attachMapEvents();    
    }

    return {
        createMap: createMap
    };

})();