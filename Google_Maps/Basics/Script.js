/// <reference path="Scripts/jquery-2.1.1.js" />
/// <reference path="Scripts/gmap3.js" />
/// <reference path="google-maps-3-vs-1-0.js" />
$(function initialize() {
    var maps = google.maps,
        DIV_HTML = '<div></div>';
    mapOptions = {
        center: new maps.LatLng(42.239818, 25.300602),
        zoom: 9,
        mapTypeId: maps.MapTypeId.SATELLITE,
        disableDefaultUI: true
    };
    var map = new maps.Map(document.getElementById("map-canvas"),
        mapOptions),
        coordsArray = [],
        polygons = [],
        activePolygon,
        activeMarker,
        markers = [];

    createControlMenu();

    maps.event.addListener(map, 'click', drawPolygonPoint);

    
    function createControlMenu() {
        createControl('Build block', createBlock);
        createControl('Delete marker', deleteMarker);

        function createControl(controlText, clickEventHandler) {
            var container = $(DIV_HTML).addClass('control-container'),
                control = $(DIV_HTML).addClass('control').html(controlText);

            container.append(control);

            map.controls[maps.ControlPosition.TOP_CENTER].push(container[0]);

            container.click(clickEventHandler);
        }
    }

    function createBlock() {

        if (coordsArray.length >=3) {
            activePolygon = addPolygon(map);
            polygons.push(activePolygon);
            polygons[polygons.length - 1].setOptions({ editable: false });

            removeMarkers();
            coordsArray.length = 0;   
        }
    }

    function deleteMarker() {
        if (activeMarker) {
            activeMarker.setMap(null);
            markers.splice(markers.indexOf(activeMarker), 1);
        }
    }

    function drawPolygonPoint(e) {
        var coords = e.latLng;

        if (activePolygon) {
            activePolygon.setOptions({ editable: false });
        }

        coordsArray.push(coords);
        markers.push(addMarker(map, coords));
    }

    function drawPolygon(e) {
        var coords = e.latLng;

        if (activePolygon) {
            activePolygon.setOptions({ editable: false });
        }       

        coordsArray.push(coords);
        if (coordsArray.length < 3) {
            markers.push(addMarker(map, coords));
        }

        else if (coordsArray.length === 3) {
            removeMarkers();
            activePolygon = addPolygon(map);
            polygons.push(activePolygon);
        } else if (coordsArray.length > 3) {
            markers.push(addMarker(map, coords));

            coordsArray.length = 0;
            coordsArray.push(coords);
            polygons[polygons.length - 1].setOptions({ editable: false });

        }
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
        
        maps.event.addListener(marker, 'click', function (e) {

            if (activeMarker) {
                activeMarker.setOptions({
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillOpacity: 1,
                        strokeWeight: 1,
                        scale: 7,
                        fillColor: 'yellow'
                    }
                });
            }

            activeMarker = this;
            this.setOptions({
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillOpacity: 1,
                    strokeWeight: 1,
                    scale: 12,
                    fillColor: 'yellow'
                }
            });
            showControl('DeleteMarker');
        });

        return marker;
    }

    function addPolygon(map) {
        var polygon = new maps.Polygon({
            path: markers.map(function (m) { return m.getPosition(); }),
            strokeColor: 'yellow',
            strokeWeight: 3,
            map: map,
            editable: true
        });

        activePolygon = polygon;

        maps.event.addListener(polygon, 'click', function (e) {
            activePolygon.setOptions({ editable: false });
            this.setOptions({ editable: true });
            activePolygon = this;
            coordsArray.length = 0;
            removeMarkers();
        });

        return polygon;
    }

    function removeMarkers() {
        markers.map(function (m) {
            m.setMap(null);
        });
        markers.length = 0;

    }

    function showControl(menuName) {

    }
});