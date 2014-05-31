/// <reference path="google-maps-3-vs-1-0.js" />
/// <reference path="MapBuilder.js" />
/// <reference path="Menu.js" />
var mapManager = (function () {
    var maps = google.maps,

        // #region default options
        defaultMapOptions = {
            center: new maps.LatLng(42.239818, 25.300602),
            zoom: 9,
            mapTypeId: maps.MapTypeId.SATELLITE,
            disableDefaultUI: true
        },
        defaultMarkerIcon = {
            path: maps.SymbolPath.CIRCLE,
            fillOpacity: 1,
            strokeWeight: 1,
            scale: 7,
            fillColor: 'yellow'
        },
        defaultMarkerOptions = {
            icon: defaultMarkerIcon,
            draggable: true
        }
        // #endregion

        map = undefined,        
        // Note: for intellisence only. 'mapBuilder' is reinitialized in
        // 'createMap'.
        mapBuilder = new MapBuilder(null),
        // Note: for intellisence only. 'menu' is later reinitialized in 'createMap'
        menu = new Menu(mapBuilder);

    
    function drawPolygonPoint(e) {
        mapBuilder.addMarker(e);
    } 

    function createBlock() {
        if (mapBuilder.markers.length >= 3) {
            mapBuilder.addPolygon();
        }
    }

    function deleteBlock() {
        mapBuilder.removePolygon();
    }

    function removeMarker() {
        mapBuilder.removeMarker();
    }

    function attachMapEvents() {
        maps.event.addListener(map, 'click', drawPolygonPoint);
    }

    function initializeMenu(map) {

        menu = new Menu(map);

        menu.addControl('button', 'Build block', [{ type: 'click', func: createBlock }]);
        menu.addControl('button', 'Delete Marker', [{ type: 'click', func: removeMarker }]);
        menu.addControl('button', 'Delete Block', [{ type: 'click', func: deleteBlock }]);

        return menu;
    }

    function createMap(elementId, blocks) {
        // first, init map.
        map = new google.maps.Map(document.getElementById(elementId), defaultMapOptions);
        mapBuilder = new MapBuilder(map);
        menu = initializeMenu(map);

        attachMapEvents();

        if (blocks) {
            // TODO: Restore 'blocks' objects
        }
    }

    return {
        createMap: createMap
    }

})();