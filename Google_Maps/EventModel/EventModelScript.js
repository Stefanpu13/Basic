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
        map = new maps.Map(document.getElementById("map-canvas"), mapOptions);


    maps.event.addListener(map, 'click', triggerAddMarker);
    maps.event.addListener(map, 'markerAdded', addMarker);
    maps.event.addListener(map, 'markerSelected', selectMarker);   

    function triggerAddMarker(e) {

        var position = e.latLng;
        maps.event.trigger(map, 'markerAdded', map, position);
    }

    function addMarker(map, position) {
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
            maps.event.trigger(map, 'markerSelected', this);
        });
    }

    function selectMarker(marker) {
        marker.setOptions({
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillOpacity: 1,
                strokeWeight: 1,
                scale: 11,
                fillColor: 'yellow'
            }
        });
    }

    
});