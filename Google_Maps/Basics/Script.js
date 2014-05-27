/// <reference path="Scripts/gmap3.js" />
/// <reference path="google-maps-3-vs-1-0.js" />
var maps = google.maps;

function initialize() {
    var mapOptions = {
        center: new maps.LatLng(42.239818, 25.300602),
        zoom: 9,
        mapTypeId:maps.MapTypeId.SATELLITE
    };
    var map = new maps.Map(document.getElementById("map-canvas"),
        mapOptions);

    alert(maps.Symbol);

    var marker = new maps.Marker({
        title: "First Marker",
        map: map,
        position: map.getCenter()
    });

    maps.event.addListener(map, 'click', function (e) {
        //var map = this;

        var marker = new maps.Marker({
            map: map,
            position: e.latLng,
            icon: new maps.Symbol()
        });
    });
}




maps.event.addDomListener(window, 'load', initialize);

//maps.event.addDomListener(window, 'load', initialize);