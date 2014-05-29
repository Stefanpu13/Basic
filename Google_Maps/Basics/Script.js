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


    var Menu = (function () {
        var Menu = function Menu(map, menuPosition) {
            this.map = map;
            this.menuPosition = menuPosition || maps.ControlPosition.TOP_CENTER;
            this.controls = [];
        }

        Menu.prototype.addControl = function (controlName, controlHandlers) {
            var control = new Control(controlName, controlHandlers);
            this.controls.push(control);
            this.showControl(controlName);
        }

        Menu.prototype.showControl = function (controlName) {
            var controls = this.controls.filter(function (control) {
                return control.name === controlName;
            }),
            self = this;

            controls.forEach(function (control) {
                self.map.controls[self.menuPosition].push(control.container);
            });
        }

        Menu.prototype.hideControl = function (controlName) {
            var controls = this.controls.filter(function (control) {
                return control.name === controlName;
            }),
            self = this;

            controls.forEach(function (control) {
                self.map.controls[self.menuPosition]
                    .slice(self.map.controls[self.menuPosition].indexOf(control.container));
            });
        }

        return Menu;
    })();

    // Recieve 'map-canvas' as parameter
    var map = new maps.Map(document.getElementById("map-canvas"),
        mapOptions),
        coordsArray = [],
        polygons = [],
        activePolygon,
        activeMarker,
        markers = [],
        menu = new Menu(map);

    menu.addControl('Build block', [{
        name: 'click', func: function (e) {
            createBlock();
        }
    }]);
    menu.addControl('DeleteMarker', [{
        name: 'click', func: function () {
        }
    }, {
        name: 'markerSelected', func: function (e, m) {
            var x = this;
        }
    }])

    //createControlMenu();

    maps.event.addListener(map, 'click', drawPolygonPoint);   
    
    function createControlMenu() {
        createControl('Build block', map ,createBlock, true);
        createControl('Delete marker',map ,deleteMarker, true);
        createControl('Delete block', map, deleteBlock, true);
    }

    function createControl(controlText, map, clickEventHandler, addToMap) {
        var container = $(DIV_HTML).addClass('control-container'),
            control = $(DIV_HTML).addClass('control').html(controlText);

        container.append(control);

        if (addToMap) {
            map.controls[maps.ControlPosition.TOP_CENTER].push(container[0]);
        }

        container.click(clickEventHandler);
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

    function deleteBlock(block) {

    }

    function drawPolygonPoint(e) {
        var coords = e.latLng;

        if (activePolygon) {
            activePolygon.setOptions({ editable: false });
        }

        coordsArray.push(coords);
        markers.push(addMarker(map, coords));
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

            maps.event.trigger(this, 'markerSelected');
            //$(this).trigger('markerSelected', this);
           
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

            maps.event.trigger(map, 'polygonSlected', this);
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

    function Control(controlName, controlHadlers) {
        var self = this;
        this.name = controlName;
        this.controlHandlers = controlHadlers;
        this.container = createControl();

        controlHadlers.forEach(function(handler){
            $(self.container).on(handler.name, handler.func);
        });

        function createControl() {
            var container = $(DIV_HTML).addClass('control-container'),
                control = $(DIV_HTML).addClass('control').html(controlName);

            container.append(control);

            return container[0];
        }
    }
});