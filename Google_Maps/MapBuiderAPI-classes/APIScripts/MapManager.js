/// <reference path="google-maps-3-vs-1-0.js" />
/// <reference path="MapBuilder.js" />
/// <reference path="Menu.js" />
var mapManager = (function () {
    var maps = google.maps,
        defaultMapOptions = {
            center: new maps.LatLng(42.239818, 25.300602),
            zoom: 9,
            mapTypeId: maps.MapTypeId.SATELLITE,
            disableDefaultUI: true
        },
        map,
        mapBuilder,
        eidtableMenu;

    var mediator = (function () {

        // contains props that represent arrays of objects of type: {'subscriber': subscr, 'handle': handle};
        var subscribers = {};

        function subscribe(subscr, eventType, handler) {
            var handle, eventTypes = eventType.split(' ');

            eventTypes.forEach(function (et) {
                if (subscr instanceof Element) {
                    handle = maps.event.addDomListener(subscr, et, handler);
                } else {
                    handle = maps.event.addListener(subscr, et, handler);
                }

                if (!subscribers[et]) {
                    subscribers[et] = [];
                }

                subscribers[et].push({ subscriber: subscr, handle: handle });
            });
           
        }

        function unsubscribe(subscriber, eventType) {
            var subscriberIndex = -1, 
                handle, eventTypes = eventType.split(' ');
            eventTypes.forEach(function (et) {
                if (subscribers[et] && subscribers[eventType].length) {
                    subscribers[et].forEach(function (subscr, i) {
                        if (subscr.subscriber === subscriber) {
                            subscriberIndex = i;
                        }
                    });

                    if (subscriberIndex > -1) {
                        handle = subscribers[et][subscriberIndex].handle;
                        maps.event.removeListener(handle);

                        subscribers[et].splice(subscriberIndex, 1);
                    }
                }
            });
        }

        function publish(eventType, data) {
            var eventTypes = eventType.split(' ');

            eventTypes.forEach(function (et) {
                var eventSubscribers = subscribers[et];

                if (eventSubscribers) {
                    eventSubscribers.forEach(function (subscr) {
                        maps.event.trigger(subscr.subscriber, et, data);
                    });
                } else {
                    //throw Error('No subscirbers for ' + et);
                    console.log('No subscirbers for ' + et);
                }
            });            
        }
        return {
            subscribe: subscribe,
            unsubscribe: unsubscribe,
            publish: publish
        };
    })();

    function initializeMenu(map, isEditMode) {
        eidtableMenu = new menu.Menu(map, undefined, mediator);    
        menu.create(isEditMode);

        return eidtableMenu;
    }

    function createMap(elementId, isEditMode,blocks) {
        // first, init map.
        map = new google.maps.Map(document.getElementById(elementId));
        mapBuilder = new MapBuilder(map, defaultMapOptions, mediator, blocks);
        eidtableMenu = initializeMenu(map, isEditMode);
    }

    return {
        createMap: createMap
    };

})();