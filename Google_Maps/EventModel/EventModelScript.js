/// <reference path="Scripts/jquery-2.1.1.js" />
/// <reference path="Scripts/google-maps-3-vs-1-0.js" />

$(function () {
    var maps = google.maps;

    var mediator = (function () {

        var subscribers = {};

        function subscribe(subscriber, eventType, handler) {
            maps.event.addListener(subscriber, eventType, handler);

            if (!subscribers[eventType]) {
                subscribers[eventType] = [];
            }

            subscribers[eventType].push(subscriber);
        }

        function unsubscribe(subscriber, eventType) {
            var subscriberIndex;
            if (subscribers[eventType] && subscribers[eventType].length) {
                subscriberIndex = subscribers[eventType].indexOf(subscriber);

                if (subscriberIndex > -1) {
                    subscribers[eventType].slice(subscriberIndex, 1);
                }
            }
        }

        function publish(eventType, publisher) {
            var eventSubscribers = subscribers[eventType];

            if (eventSubscribers) {
                eventSubscribers.forEach(function (subscr) {
                    maps.event.trigger(subscr, eventType, publisher);
                });
            } else {
                throw Error('No subscirbers for ' + eventType);
            }
        }
        return {
            subscribe: subscribe,
            unsubscribe: unsubscribe,
            publish: publish
        };
    })();

    var menu = (function () {

        function addButton(controlName) {
            var container = createControl(controlName);

            $(container).hide();
            map.controls[maps.ControlPosition.TOP_CENTER].push(container);

            maps.event.addListener(container, 'click', function () {
                mediator.publish('deleteMarker', this);
            });

            mediator.subscribe(container, 'markerSelected', showButton);
            mediator.subscribe(container, 'hideButton', hideButton);


            function createControl(controlName) {
                var container = $(DIV_HTML).addClass('control-container'),
                    control = $(DIV_HTML).addClass('control').html(controlName);

                container.append(control);

                return container[0];
            }

            return container;
        }

        function showButton(marker) {
            $(this).show();
            
        }

        function hideButton() {
            $(this).hide();
        }

        return {
            addButton: addButton          
        };
    })();

    var mapBuilder = (function () {

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
                mediator.publish('markerSelected', this);
            });

            mediator.publish('hideButton', marker);

            mediator.subscribe(marker, 'deleteMarker', deleteMarker);
        }

        function deleteMarker() {
            this.setMap(null);
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

        return {
            addMarker: addMarker,
            selectMarker: selectMarker
        };
    })();    

    var DIV_HTML = '<div></div>',        
        mapOptions = {
            center: new maps.LatLng(42.239818, 25.300602),
            zoom: 9,
            mapTypeId: maps.MapTypeId.SATELLITE,
            disableDefaultUI: true
        },        
        map = new maps.Map(document.getElementById("map-canvas"), mapOptions),
        button = menu.addButton("Remove Marker");

    maps.event.addListener(map, 'click', mapBuilder.addMarker); 
    
    mediator.subscribe(map, 'markerSelected', mapBuilder.selectMarker);
});