/// <reference path="Scripts/jquery-2.1.1.js" />
/// <reference path="Scripts/google-maps-3-vs-1-0.js" />
$(function () {
    var maps = google.maps,
        mapOptions = {
            center: new maps.LatLng(42.239818, 25.300602),
            zoom: 9,
            mapTypeId: maps.MapTypeId.SATELLITE,
            disableDefaultUI: true
        },
        map = new maps.Map(document.getElementById("map-canvas"), mapOptions),
        customOverlayHTML = '<div id="info-window-container">' +
        'Simple Window Opened <textarea> </textarea><div> Some More text</div>' +
        '<button> click to close</button></div>';



    maps.event.addListener(map, 'click', addMarker);

    function addMarker(e) {
        var position = e.latLng;
        var marker = new maps.Marker({
            map: map,
            position: position,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillOpacity: 1,
                strokeWeight: 1,
                scale: 7,
                fillColor: 'yellow'
            },
            draggable: true
        });

        maps.event.addListener(marker, 'click', function () {
            createCustomOverlay(this);
        });
    }


    function createCustomOverlay(marker) {
        var overlay;

        CustomOverlay.prototype = new maps.OverlayView();

        overlay = new CustomOverlay(map);

        function CustomOverlay(map) {
            this.div = null;
            this.map_ = map;

            this.setMap(map);
        }

        CustomOverlay.prototype.onAdd = function () {
            this.div = customOverlayHTML;            

            var panes = this.getPanes();

            panes.floatPane.appendChild($(customOverlayHTML)[0]);
        };

        CustomOverlay.prototype.draw = function () {            
            this.div = customOverlayHTML;          
        };
    }
});