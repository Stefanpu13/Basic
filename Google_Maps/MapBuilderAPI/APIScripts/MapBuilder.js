var MapBuilder = (function (maps) {

    var call = Function.prototype.call,
        selectedMarkerOptions = {
        icon: {
            path: maps.SymbolPath.CIRCLE,
            fillOpacity: 1,
            strokeWeight: 1,
            scale: 7,
            fillColor: 'yellow'
        }
    }

    function MapBuilder(map, defaultMarkerOptions) {
        this.map = map;
        this.defaultMarkerOptions = setDefaultMarkerOptions(map, defaultMarkerOptions);
        this.polygons = [];
        this.markers = [];
        this.activePolygon = null;
        this.activeMarker = null;        
    }

    function setDefaultMarkerOptions(map, defaultMarkerOptions) {
        var markerOptions = defaultMarkerOptions || {};
        markerOptions.map = map;
        return markerOptions;
    }

    function createMarker(coords) {

        var markerOptions = this.defaultMarkerOptions;
            marker = new maps.Marker((markerOptions.position = )),
            self = this;

        this.markers.push(marker);

        maps.event.addListener(marker, 'click', function (e) {
            if (self.activeMarker) {
                self.activeMarker.setOptions(selectedMarkerOptions);
            }

            self.activeMarker = this;
            this.setOptions({
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillOpacity: 1,
                    strokeWeight: 1,
                    scale: 12,
                    fillColor: 'yellow'
                }
            });
        });

        return marker;
    }

    MapBuilder.prototype.getPolygonPath = function () {
        return this.markers.map(function (m) { return m.getPosition(); });
    };

    MapBuilder.prototype.removeMarkers = function removeMarkers() {
        this.markers.map(function (m) {
            m.setMap(null);
        });
        this.markers.length = 0;
    };

    MapBuilder.prototype.addMarker = function addMarker(e) {

        var coords = e.latLng;

        if (this.activePolygon) {
            this.activePolygon.setOptions({ editable: false });
            this.activePolygon = null;
        }
               
        createMarker.call(this, coords);
        //markerOptions.map = this.map;

        //var marker = new maps.Marker(this.defaultMarkerOptions),
        //    self = this;

        //this.markers.push(marker);

        //maps.event.addListener(marker, 'click', function (e) {
        //    if (self.activeMarker) {
        //        self.activeMarker.setOptions(selectedMarkerOptions);
        //    }

        //    self.activeMarker = this;
        //    this.setOptions({
        //        icon: {
        //            path: google.maps.SymbolPath.CIRCLE,
        //            fillOpacity: 1,
        //            strokeWeight: 1,
        //            scale: 12,
        //            fillColor: 'yellow'
        //        }
        //    });
        //});

        //return marker;
    };

    MapBuilder.prototype.removeMarker = function removeMarker() {
        if (this.activeMarker) {
            this.activeMarker.setMap(null);
            this.markers.splice(this.markers.indexOf(this.activeMarker), 1);
        }
    }

    MapBuilder.prototype.addPolygon = function addPolygon() {
        var polygon = new maps.Polygon({
            path: this.getPolygonPath(),
            strokeColor: 'yellow',
            strokeWeight: 3,
            map: this.map,
            editable: true
        }), self = this;

        this.polygons.push(polygon);
        this.polygons[this.polygons.length - 1].setOptions({ editable: false });

        // Delete markers that have been drawed.
        this.removeMarkers();

        maps.event.addListener(polygon, 'click', function (e) {
            if (self.activePolygon) {
                self.activePolygon.setOptions({ editable: false });
            }
            
            this.setOptions({ editable: true });
            self.activePolygon = this;
        });
    }

    MapBuilder.prototype.removePolygon = function removePolygon() {
        if (this.activePolygon) {
            this.activePolygon.setMap(null);
        }
        
        this.activePolygon = null;
    }  

    

    return MapBuilder;
})(google.maps);