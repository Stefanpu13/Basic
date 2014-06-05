var MapBuilder = (function (maps) {

    var infoWindowContent = '<div id="info-window-container">' +
            'Simple Window Opened '
            + '<textarea> </textarea>' + '<div> Some More text</div>' +
            '<button> click to close</button>'+
            '</div>';

    var selectedMarkerOptions = {
        icon: {
            path: maps.SymbolPath.CIRCLE,
            fillOpacity: 1,
            strokeWeight: 1,
            scale: 13,
            fillColor: 'yellow'
        }
    },
        referenceMarkerOptions = {
            icon: {
                scale: 0
            }
        },
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
            scale: 9,
            fillColor: 'yellow'
        },
        defaultMarkerOptions = {
            icon: defaultMarkerIcon,
            draggable: true
        },
        defaultPolygonOptions = {
            strokeColor: 'yellow',
            strokeWeight: 3,
            editable: true
        };
    // #endregion

    function Block(referenceMarker, polygon) {
        this.polygon = polygon;
        this.referenceMarker = referenceMarker;

    }

    function MapBuilder(map, mapOptions, blocks) {
        map.setOptions(mapOptions);
        this.map = map;
        this.defaultMarkerOptions = setDefaultMarkerOptions(map);
        this.blocks = restorePolygons.apply(this, blocks);
        this.markers = [];
        this.activeBlock = null;
        this.activeMarker = null;
    }

    // #region Private functions

    // Note: if any of these private functions is called as method of the 'MapBuilder' object,
    // the 'this' value refers to that object.
    function setDefaultMarkerOptions(map) {
        // copy the 'defaultMarkerOptions' onject to new object.
        var markerOptions = JSON.parse(JSON.stringify(defaultMarkerOptions));
        markerOptions.map = map;
        return markerOptions;
    }

    function createMarker(coords) {

        var markerOptions = this.defaultMarkerOptions,
            marker,
            self = this;

        markerOptions.position = coords;
        marker = new maps.Marker(markerOptions);

        this.markers.push(marker);

        maps.event.addListener(marker, 'click', function (e) {
            if (self.activeMarker) {
                self.activeMarker.setOptions(defaultMarkerOptions);
            }

            self.activeMarker = this;
            this.setOptions(selectedMarkerOptions);
        });

        return marker;
    }

    function restorePolygons(blocks) {
        var self = this;

        this.blocks = [];

        if (blocks && blocks.forEach) {
            blocks.forEach(function (block) {
                var blockCoords = [],
                    polygon;

                if (block.Points) {
                    block.Points.forEach(function (point) {
                        blockCoords.push(new maps.LatLng(point.Lat, point.Lng));
                    });
                }

                polygon = this.addBlock(blockCoords);
                this.blocks.push(polygon);
            });
        }
    }

    // Function is called on 'block' Object
    function setFirstMarkerAsReference(marker) {
        marker.setOptions(referenceMarkerOptions);        
        this.referenceMarker = marker;
    }

    // #endregion

    MapBuilder.prototype.getBlockPath = function H(points) {
        // If 'points' is defined return them.
        if (Object.prototype.toString.call(points) === '[object Array]') {
            return points;
        } else {
            return this.markers.map(function (m) { return m.getPosition(); });
        }
    };

    MapBuilder.prototype.removeMarkers = function removeMarkers() {
        this.markers.map(function (m) {
            m.setMap(null);
        });
        this.markers.length = 0;
    };

    MapBuilder.prototype.addMarker = function addMarker(coords) {

        //var coords = e.latLng;

        if (this.activeBlock) {
            this.activeBlock.polygon.setOptions({ editable: false });
            this.activeBlock = null;
        }

        // Involke private function as method of this 'mapBuilder'.
        createMarker.call(this, coords);
    };

    MapBuilder.prototype.removeMarker = function removeMarker() {
        if (this.activeMarker) {
            this.activeMarker.setMap(null);
            this.markers.splice(this.markers.indexOf(this.activeMarker), 1);
            this.activeMarker = null;
        }
    };

    MapBuilder.prototype.addBlock = function addBlock(points) {
        var block,
            referenceMarker,
            polygon,
            self = this;

        this.blocks = this.blocks || [];

        // If 'points' is not defined then the block coordinates are in 'markers'.
        if (!points && this.markers.length >= 3) {
            defaultPolygonOptions.path = this.getBlockPath(points);
            defaultPolygonOptions.map = this.map;

            polygon = new maps.Polygon(defaultPolygonOptions);
            referenceMarker = this.markers[0];
            block = new Block(referenceMarker, polygon);

            this.blocks.push(block);
            this.blocks[this.blocks.length - 1].polygon.setOptions({ editable: false });

            // Delete markers that have been drawed.
            this.removeMarkers();

            maps.event.addListener(polygon, 'click', function (e) {
                if (self.activeBlock) {
                    self.activeBlock.polygon.setOptions({ editable: false });
                }
               
                polygon.setOptions({ editable: true });
                // Get the 'Block' object, whose polygon is the clicked polygon.
                self.activeBlock = self.blocks.reduce(function (previousBlock, currentBlock, index) {
                    return currentBlock.polygon === polygon ?
                        currentBlock :  previousBlock;
                }, self.blocks[0]);

                var infoWindow = new maps.InfoWindow({
                    content: infoWindowContent,
                    dragable:true
                });

                infoWindow.open(self.map, self.activeBlock.referenceMarker);
            });
        }

        return block;
    };

    MapBuilder.prototype.removeBlock = function removeBlock() {
        if (this.activeBlock) {
            this.activeBlock.polygon.setMap(null);
        }

        this.activeBlock = null;
    };

    MapBuilder.prototype.saveBlocks = function saveBlocks() {
        var blocksCoords = this.blocks.map(function (block) {
            // 'getPath()' returns an 'MVCArray' element. See 
            // https://developers.google.com/maps/documentation/javascript/reference#MVCArray
            var path = block.polygon.getPath();

            // an array of 'LatLng' elements. See: https://developers.google.com/maps/documentation/javascript/reference#LatLng
            return path.getArray();
        });

        return blocksCoords;
    };

    MapBuilder.prototype.deleteAllPoints = function deleteAllPoints() {
        this.markers.forEach(function (marker) {
            marker.setMap(null);
        });
        this.markers.length = 0;
        this.activeMarker = null;
    };

    return MapBuilder;
})(google.maps);