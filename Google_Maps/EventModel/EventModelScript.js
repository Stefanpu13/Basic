/// <reference path="Scripts/jquery-2.1.1.js" />
/// <reference path="Scripts/google-maps-3-vs-1-0.js" />

$(function () {
    var maps = google.maps;

    var observer = (function () {

        var subscribers = {};

        function subscribe(subscriber, eventType, handler) {
            maps.event.addListener(subscriber, eventType, handler);

            if (!subscribers[eventType]) {
                subscribers[eventType] = [];
            }

            subscribers[eventType].push(subscriber);
        };

        function unsubscribe(subscriber, eventType) {
            var subscriberIndex;
            if (subscribers[eventType] && subscribers[eventType].length) {
                subscriberIndex = subscribers[eventType].indexOf(subscriber);

                if (subscriberIndex > -1) {
                    subscribers[eventType].slice(subscriberIndex, 1);
                }
            }
        };

        function publish(publisher, eventType) {
            var eventSubscribers = subscribers[eventType];

            if (eventSubscribers) {
                eventSubscribers.forEach(function (subscr) {
                    maps.event.trigger(subscr, eventType, publisher);
                });
            }

        };

        return {
            subscribe: subscribe,
            unsubscribe: unsubscribe,
            publish: publish
        }
    })();

    var menu = (function () {

        function addButton(controlName) {
            var container = createControl(controlName);

            //maps.event.addListener(container, 'markerSelected', showButton);
            observer.subscribe(container, 'markerSelected', showButton);


            function createControl(controlName) {
                var container = $(DIV_HTML).addClass('control-container'),
                    control = $(DIV_HTML).addClass('control').html(controlName);

                container.append(control);

                return container[0];
            }

            return container;
        }

        function showButton(marker) {
            map.controls[maps.ControlPosition.TOP_CENTER].push(this);
        }

        return {
            addButton: addButton,
            showButton: showButton
        }
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
                observer.publish(this, 'markerSelected');
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

        return {
            addMarker: addMarker,
            selectMarker: selectMarker
        }
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
    
    observer.subscribe(map, 'markerSelected', mapBuilder.selectMarker);

    //maps.event.addListener(map, 'markerSelected', mapBuilder.selectMarker);   

    
});