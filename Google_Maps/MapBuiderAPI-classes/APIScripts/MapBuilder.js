/// <reference path="google-maps-3-vs-1-0.js" />
var MapBuilder = (function (maps) {
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
        },
        // #endregion
        mediator; // set in the 'MapBuilder' constructor.

    var BlockNameInfoBox = (function () {
        var infoBoxHTML = '<div id="block-name-info-box"></div>';

        function BlockNameInfoBox(map) {
            this.div = null;
            this.map_ = map;

            this.setMap(map);
        }

        BlockNameInfoBox.prototype.onAdd = function () {
            this.div = infoBoxHTML;
            var args = arguments;

            var panes = this.getPanes();

            panes.overlayImage.appendChild($(infoBoxHTML)[0]);
        };

        BlockNameInfoBox.prototype.draw = function () {
            this.div = infoBoxHTML;
            var self = this;
        };

        BlockNameInfoBox.prototype = new maps.OverlayView();

        return BlockNameInfoBox;
    })();

    function Block(referenceMarker, polygon, blockInfo) {
        this.polygon = polygon;
        this.referenceMarker = referenceMarker;

        var infoBox = new BlockNameInfoBox(polygon.getMap());
    }

    function MapBuilder(map, mapOptions, eventMediator, blocks) {
        map.setOptions(mapOptions);
        this.map = map;
        this.defaultMarkerOptions = setDefaultMarkerOptions(map);
        this.blocks = restorePolygons.apply(this, blocks);
        this.markers = [];
        this.activeBlock = null;
        this.activeMarker = null;

        mediator = eventMediator;
        attachBuilderFunctionality.apply(this);
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

    function attachBuilderFunctionality() {
        // map functionality
        mediator.subscribe(this, 'editingModeOn', this.enableMapEditing);
        mediator.subscribe(this, 'editingModeOff', this.disableMapEditing);

        //maps.event.addListener(map, 'click', drawPolygonPoint);

        // 'Block' functionality
        mediator.subscribe(this, 'blockButtonClicked', this.blockCanBeBuilt);
        mediator.subscribe(this, 'blockCreated', this.addBlock);
        mediator.subscribe(this, 'blockDeleted', this.removeBlock);
        mediator.subscribe(this, 'saveBlocks', this.saveBlocks);

        // 'Point' functionality
        mediator.subscribe(this, 'pointDeleted', this.removePoint);
        mediator.subscribe(this, 'allPointsDeleted', this.deleteAllPoints);
    }

    function createMarker(coords) {

        var markerOptions = this.defaultMarkerOptions,
            marker,
            self = this;

        markerOptions.position = coords;
        marker = new maps.Marker(markerOptions);

        this.markers.push(marker);

        mediator.subscribe(marker, 'click', selectMarker);

        mediator.subscribe(marker, 'editingModeOff', function () {
            mediator.unsubscribe(marker, 'click');
        });

        mediator.subscribe(marker, 'editingModeOn', function () {
            mediator.subscribe(marker, 'click', selectMarker);
        });

        // attach marker events
        mediator.subscribe(marker, 'pointUnselected', function () {
            marker.setOptions(defaultMarkerOptions);
            self.activeMarker = null;
        });

        return marker;

        function selectMarker(e) {
            if (self.activeMarker) {
                self.activeMarker.setOptions(defaultMarkerOptions);
            } else {
                // 'point selected' mode is entered only the first time.
                mediator.publish('pointSelected');
            }

            self.activeMarker = this;
            this.setOptions(selectedMarkerOptions);
        }
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

    MapBuilder.prototype.blockCanBeBuilt = function blockCanBeBuilt() {
        if (this.markers.length >= 3) {
            mediator.publish('blockCanBeBuilt');
        }
    };

    MapBuilder.prototype.enableMapEditing = function enableMapEditing() {
        var self = this;
        //maps.event.addListener(this.map, 'click', function (e) { self.addPoint(e); });
        mediator.subscribe(this.map, 'click', function (e) {
            self.addPoint(e);
            mediator.publish('blockUnselected pointUnselected');
        });
    };

    MapBuilder.prototype.disableMapEditing = function disableMapEditing() {
        mediator.unsubscribe(this.map, 'click');
    };

    MapBuilder.prototype.getBlockPath = function getBlockPath() {
        // return arrayf of 'mrakers' points.
        return this.markers.map(function (m) { return m.getPosition(); });
    };

    MapBuilder.prototype.removeMarkers = function removeMarkers() {
        this.markers.map(function (m) {
            m.setMap(null);
        });
        this.markers.length = 0;
    };

    MapBuilder.prototype.addPoint = function addPoint(e) {
        var coords = e.latLng;

        if (this.activeBlock) {
            this.activeBlock.polygon.setOptions({ editable: false });
            this.activeBlock = null;
        }

        // Involke private function as method of this 'mapBuilder'.
        createMarker.call(this, coords);
    };

    MapBuilder.prototype.removePoint = function removePoint() {
        if (this.activeMarker) {
            this.activeMarker.setMap(null);
            this.markers.splice(this.markers.indexOf(this.activeMarker), 1);
            this.activeMarker = null;
        }
    };

    MapBuilder.prototype.addBlock = function addBlock(blockInfo) {
        var block,
            referenceMarker,
            polygon,
            self = this;

        this.blocks = this.blocks || [];


        if (this.markers.length >= 3) {
            defaultPolygonOptions.path = this.getBlockPath();
            defaultPolygonOptions.map = this.map;

            polygon = new maps.Polygon(defaultPolygonOptions);
            referenceMarker = this.markers[0];
            block = new Block(referenceMarker, polygon, blockInfo);

            this.blocks.push(block);
            this.blocks[this.blocks.length - 1].polygon.setOptions({ editable: false });

            // Delete markers that have been drawed.
            this.removeMarkers();

            mediator.subscribe(polygon, 'click', selectBlock);
            mediator.subscribe(polygon, 'editingModeOff', function () {
                mediator.unsubscribe(polygon, 'click');
                polygon.setOptions({ editable: false });
            });

            mediator.subscribe(polygon, 'editingModeOn', function () {
                mediator.subscribe(polygon, 'click', selectBlock);
            });
        }

        return block;

        function selectBlock(e) {
            if (self.activeBlock) {
                self.activeBlock.polygon.setOptions({ editable: false });
            }

            polygon.setOptions({ editable: true });
            // Get the 'Block' object, whose polygon is the clicked polygon.
            self.activeBlock = self.blocks.reduce(function (previousBlock, currentBlock) {
                return currentBlock.polygon === polygon ?
                    currentBlock : previousBlock;
            }, self.blocks[0]);

            mediator.publish('blockSelected');
        }
    };

    MapBuilder.prototype.removeBlock = function removeBlock() {
        if (this.activeBlock) {
            this.activeBlock.polygon.setMap(null);
            // remove block from 'blocks'
            var activeBlockIndex = this.blocks.indexOf(this.activeBlock);
            if (activeBlockIndex > -1) {
                this.blocks.splice(activeBlockIndex, 1);
            }
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