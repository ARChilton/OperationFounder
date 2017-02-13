Raven.config('https://281842b80161488daee1cbbf2a0bdf9a@sentry.io/119364').install()
//Global variables
//To make map a global variable to always be able to update the map
var map = ''
var marker;
//To make accessing the pouchDb for app settings always available
var appdb = new PouchDB('appdb');

var currentBackgroundMap = '';

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    // Now safe to use device APIs
    console.log('deviceready');
    if (cordova.platformId == 'android') {
        StatusBar.backgroundColorByHexString("#283593"); //#333 grey #00796B is 700 color for teal
        StatusBar.overlaysWebView(true);
    }
}
document.addEventListener("pause", onPause, false);

function onPause() {
    // Handle the pause event
    console.log('devicePaused');

    //save current map settings

    appdb.get('pause')
        .then(function (doc) {
            return appdb.put({
                _id: doc._id,
                _rev: doc._rev,
                mapCenter: map.getCenter(),
                timeStamp: Date.now()
                //bgMap: currentBackgroundMap
            });
        }).catch(function (err) {

            return appdb.put({
                _id: 'pause',
                mapCenter: map.getCenter(),
                timeStamp: Date.now()
                //bgMap: currentBackgroundMap
            });
        });
}
document.addEventListener("resume", onResume, false);

function onResume() {
    // Handle the resume event
    console.log('deviceResume');

    // restore current settings

    appdb.get('pause').then(function (doc) {
        map.setView(doc.mapCenter);
        // console.log(doc.mapCenter.lat);
        // backgroundMapUpdate(doc.bgMap);
    });
}



ons.ready(function () {
    console.log('ons-ready function fired');
    //using pouchdb to get settings



    // API KEYS
    // MapBox access token
    var mapboxTkn = 'pk.eyJ1IjoiYXJjaGlsdG9uIiwiYSI6ImNpdm1mdGk4NjA3eDUyenBveTgwejB2dWIifQ.ehb0-8mRLEpQ9R89H0HlvQ';
    // Mapzen access token
    var mapzenTkn = 'mapzen-oEnArD7'
    //Bing api key
    var BING_KEY = 'AqVat8HR9TsQF1uwWckLU_1Dv_wrrDR3ThriJUmZyDhPcHRGwpeTDA9NVhKaS5RX';
    //Cache variables
    var turnCachingOn = true;
    var reCacheAfter = 30 * 24 * 3600 * 1000; // 30 days * 24 hours * 3600 seconds in an hour * 1000 milliseconds in a second




    // --- Leaflet Map Controls ---

    //Geoserver Settings
    var geoserverURL = "http://192.168.1.9:8080/geoserver/wms?";

    // options for the geoserver WMS
    var options = {
        'transparent': true,
        'minZoom': 14,
        'format': 'image/png',
        'tiled': true
    };

    // Geoserver layer information - URL:WMS options:layer from geoserver
    var geoserver = L.WMS.source(geoserverURL, options);
    var streetParking = geoserver.getLayer('StreetParking:roads');
    var streetCleaning = geoserver.getLayer('StreetParking:streetcleaning');


    //Copyright info for mapbox
    var mapboxAttributes = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap<\/a> contributors, ' + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA<\/a>,' + 'Imagery © <a href="http://mapbox.com">Mapbox<\/a>';

    //URL for mapbox where the style is inserted     
    var mapboxURL = 'https://api.mapbox.com/styles/v1/mapbox/{style}/tiles/256/{z}/{x}/{y}?access_token=' + mapboxTkn;

    //mapbox background layers with style information   
    var greyscale = L.tileLayer(mapboxURL, {
            style: 'light-v9',
            attribution: mapboxAttributes,
            useCache: turnCachingOn,
            crossOrigin: true,
            cacheMaxAge: reCacheAfter
        }),
        streets = L.tileLayer(mapboxURL, {
            style: 'streets-v10',
            attribution: mapboxAttributes,
            useCache: turnCachingOn,
            crossOrigin: true,
            cacheMaxAge: reCacheAfter
        }),
        outdoor = L.tileLayer(mapboxURL, {
            style: 'outdoors-v10',
            attribution: mapboxAttributes,
            useCache: turnCachingOn,
            crossOrigin: true,
            cacheMaxAge: reCacheAfter
        }),
        dark = L.tileLayer(mapboxURL, {
            style: 'dark-v9',
            attribution: mapboxAttributes,
            useCache: turnCachingOn,
            crossOrigin: true,
            cacheMaxAge: reCacheAfter
        }),
        satellite = L.tileLayer(mapboxURL, {
            style: 'satellite-v9',
            attribution: mapboxAttributes,
            useCache: turnCachingOn,
            crossOrigin: true,
            cacheMaxAge: reCacheAfter
        }),
        sat_streets = L.tileLayer(mapboxURL, {
            style: 'satellite-streets-v10',
            attribution: mapboxAttributes,
            useCache: turnCachingOn,
            crossOrigin: true,
            cacheMaxAge: reCacheAfter
        });

    //Bing Maps attributes

    //Bing Map Layers
    var bingRoads = L.tileLayer.bing({
            bingMapsKey: BING_KEY,
            imagerySet: 'Road',
            useCache: turnCachingOn,
            crossOrigin: true,
            cacheMaxAge: reCacheAfter
        }),
        bingSatellite = L.tileLayer.bing({
            bingMapsKey: BING_KEY,
            imagerySet: 'Aerial',
            useCache: turnCachingOn,
            crossOrigin: true,
            cacheMaxAge: reCacheAfter
        }),
        bingSatLabel = L.tileLayer.bing({
            bingMapsKey: BING_KEY,
            imagerySet: 'AerialWithLabels',
            useCache: turnCachingOn,
            crossOrigin: true,
            cacheMaxAge: reCacheAfter
        }),
        bingOS = L.tileLayer.bing({
            bingMapsKey: BING_KEY,
            imagerySet: 'ordnanceSurvey',
            maxNativeZoom: 17,
            maxZoom: 17,
            minZoom: 10,
            useCache: turnCachingOn,
            crossOrigin: true,
            cacheMaxAge: reCacheAfter
        }),
        bingCollins = L.tileLayer.bing({
            bingMapsKey: BING_KEY,
            imagerySet: 'collinsBart',
            maxZoom: 17,
            minZoom: 10,
            useCache: turnCachingOn,
            crossOrigin: true,
            cacheMaxAge: reCacheAfter
        });

    currentBackgroundMap = streets;

    //useful for debugging the pouchdb cache
    /*bingOS.on('tilecachehit', function (ev) {
        console.log('Cache hit: ', ev.url);
    });
    bingOS.on('tilecachemiss', function (ev) {
        console.log('Cache miss: ', ev.url);
    });
    bingOS.on('tilecacheerror', function (ev) {
        console.log('Cache error: ', ev.tile, ev.error);
    });
    streets.on('tilecachehit', function (ev) {
        console.log('Cache hit: ', ev.url);
    });
    streets.on('tilecachemiss', function (ev) {
        console.log('Cache miss: ', ev.url);
    });
    streets.on('tilecacheerror', function (ev) {
        console.log('Cache error: ', ev.tile, ev.error);
    });
    outdoor.on('tilecachehit', function (ev) {
        console.log('Cache hit: ', ev.url);
    });
    outdoor.on('tilecachemiss', function (ev) {
        console.log('Cache miss: ', ev.url);
    });
    outdoor.on('tilecacheerror', function (ev) {
        console.log('Cache error: ', ev.tile, ev.error);
    });*/


    // This loop tries to create the map
    var tries = 0;
    var maxTries = 3;
    while (tries < maxTries) {
        try {
            //map centred on NY city hall   
            map = L.map('map', {
                center: [40.712742, -74.006080],
                zoom: 10,
                layers: [currentBackgroundMap],
                zoomControl: false
            });
            break;
        } catch (err) {
            tries++;
            console.log(err + ' : on try #' + tries);
            if (tries === maxTries) {
                throw err;
            }
        }
    }
    appdb.get('currentBackgroundMap').then(function (doc) {
        //some sort of selection to choose the previously used map type
        console.log(doc.layer);
    }).catch(function (err) {
        currentBackgroundMap = 'streets';
        return appdb.put({
            _id: 'currentBackgroundMap',
            layer: 'streets'
        }).catch(function (err) {
            //space to catch err
        })
    });


    // Controls the background map
    function backgroundMapUpdate(bgMap) {
        mapMaxZoom(bgMap);

        if ($('#menu').hasClass('menuShadow')) {
            closeMenu();
        }
        if (!(currentBackgroundMap == bgMap)) {
            map.removeLayer(currentBackgroundMap);
            map.addLayer(bgMap);
            currentBackgroundMap = bgMap;
            switch (bgMap) {
                default: bingLogo('remove');
                break;
                case bingRoads:
                        case bingOS:
                        case bingCollins:
                        bingLogo('dark');
                    break;
                case bingSatellite:
                        case bingSatLabel:
                        bingLogo('white');

            }
            appdb.get('currentBackgroundMap').then(function (doc) {
                return appdb.put({
                    _id: 'currentBackgroundMap',
                    _rev: doc._rev,
                    layer: currentBackgroundMap.toString(), //FixMe: this does not work need to pick up here, trying to convert the var name to string
                    timestamp: Date.now()
                });
            }).catch(function (err) {
                //space to catch error
            });
        }

        function bingLogo(colour) {
            switch (colour) {
                case 'dark':
                    $('#bingGrey').removeClass('hide');
                    $('#bingWhite').addClass('hide');
                    break;
                case 'white':
                    $('#bingWhite').removeClass('hide');
                    $('#bingGrey').addClass('hide');
                    break;
                case 'remove':
                    $('#bingGrey').addClass('hide');
                    $('#bingWhite').addClass('hide');

            }

        }

    }

    function mapMaxZoom(bgMap) {
        switch (bgMap) {
            default: map.setMaxZoom(18);
            map.setMinZoom(0);
            break;
            case bingCollins:
                    case bingOS:
                    map.setMaxZoom(17);
        }
    }

    //Click handlers for background map
    $('#menu').on('click', '#streets', function () {
        backgroundMapUpdate(streets);
    });
    $('#menu').on('click', '#dark', function () {
        backgroundMapUpdate(dark);
    });
    $('#menu').on('click', '#greyscale', function () {
        backgroundMapUpdate(greyscale);
    });
    $('#menu').on('click', '#satellite', function () {
        backgroundMapUpdate(satellite);
    });
    $('#menu').on('click', '#hybrid', function () {
        backgroundMapUpdate(sat_streets);
    });
    $('#menu').on('click', '#outdoor', function () {
        backgroundMapUpdate(outdoor);
    });
    $('#menu').on('click', '#bingRoads', function () {
        backgroundMapUpdate(bingRoads);
    });
    $('#menu').on('click', '#bingSatellite', function () {
        backgroundMapUpdate(bingSatellite);
    });
    $('#menu').on('click', '#bingSatLabel', function () {
        backgroundMapUpdate(bingSatLabel);
    });
    $('#menu').on('click', '#bingOS', function () {
        backgroundMapUpdate(bingOS);
    });
    $('#menu').on('click', '#bingCollins', function () {
        backgroundMapUpdate(bingCollins);
    });


    // Adds a marker to the centre of the map before the GPS changes it's location
    var currentLatLon = map.getCenter();
    var currentLat = currentLatLon.lat;
    var currentLng = currentLatLon.lng;
    var startRadius = 3;
    var accuracyCircle = L.circle(currentLatLon, {
        radius: startRadius,
        fillColor: '#aaf29f',
        fillOpacity: 0.4,
        stroke: true,
        color: '#37e21d',
        weight: 1

    }).addTo(map);
    marker = L.circleMarker(currentLatLon, {
        radius: 8,
        fill: true,
        fillOpacity: 1,
        fillColor: '#009688',
        stroke: true,
        color: '#ffffff',
        weight: 3
    }).addTo(map);
    var followGPS = false;



    // This will locate you on the map and add a marker to show where you are
    function onLocationFound(e) {
        accRadius = e.accuracy / 2;

        //L.marker(e.latlng).addTo(map)
        //.bindPopup("You are within " + radius + " meters from this point").openPopup();

        marker.setLatLng(e.latlng);
        accuracyCircle.setLatLng(e.latlng);
        accuracyCircle.setRadius(accRadius);

        // console.log('marker changed location to: ' + e.latlng + ' accurate to ' + e.accuracy + ' meters');
        //console.log('followGPS = ' + followGPS);
        currentLatLon = e.latlng;

        if (followGPS) {
            //map.setView(marker.getLatLng(),map.getZoom());
            map.flyTo(marker.getLatLng(), map.getZoom());
            console.log('I have moved because followGPS = ' + followGPS);
        }
    }

    function onLocationError(e) {
        alert(e.message);
        Raven.captureException(e);
    }

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    map.locate({
        setView: false,
        maxZoom: map.getZoom(),
        watch: true
    });


    // --- This adds routing ---
    var includeRouting = false;
    if (includeRouting) {

        L.Routing.control({
                /*To have a predefined route add some waypoints like this: 
                L.latLng(57.74, 11.94),
                L.latLng(57.6792, 11.949)
            
                You can add as many waypoints as you like*/
                waypoints: [],
                // This adds geocoder and reverse geocoder controls
                geocoder: L.Control.Geocoder.mapbox(mapboxTkn),

                // Allows the user to drag a waypoint and re-calculate the route
                routeWhileDragging: true,
                routeDragTimeout: 250,
                // Allows alternate lines to be calculated
                showAlternatives: true,
                // Styling for the alternate line
                altLineOptions: {
                    styles: [{
                        color: 'black',
                        opacity: 0.15,
                        weight: 9
                    }, {
                        color: 'white',
                        opacity: 0.8,
                        weight: 6
                    }, {
                        color: '#a2f',
                        opacity: 0.5,
                        weight: 2
                    }]

                },
                //This points the router to the mapbox routing rather than OSRM which would require it's own build for commercial usage
                router: L.Routing.mapbox('pk.eyJ1IjoiYXJjaGlsdG9uIiwiYSI6ImNpdm1mdGk4NjA3eDUyenBveTgwejB2dWIifQ.ehb0-8mRLEpQ9R89H0HlvQ')

                //This works with the mapzen plugin for LRM and adds mapzen routing
                /*router: L.Routing.mapzen('mapzen-oEnArD7', {
                    costing: 'auto'
                }),*/
                //formatter: new L.Routing.mapzenFormatter()

            })
            .addTo(map)

    }




    //  --- JQuery controls begin here: ---

    /*This function controls the locate button's abilit to follow the GPS marker or not - 2 = off 1 = on*/
    function locateButton(press) {
        switch (press) {
            case 1:

                /*This updates the map to the current GPS location*/
                map.setView(marker.getLatLng(), map.getZoom());
                /* This will update the variable which defines if the map follows the GPS marker */
                followGPS = true;
                /* This will change the styling of the fabLocate button */
                $('#fabLocateIcon').replaceWith("<ons-icon icon=\"md-gps-dot\" class=\"locateAlign locateSelected\" id=\"fabLocateIcon\"><\/ons-icon>");
                /*For testing*/
                //console.log('following marker');

                break;

            case 2:

                /* This updates whether the map follows the marker's GPS movements */
                followGPS = false;
                /*This will change the styling of the fabLocate button*/
                $('#fabLocateIcon').replaceWith("<ons-icon icon=\"md-gps\" class=\"locateAlign locateNotSelected\" id=\"fabLocateIcon\"><\/ons-icon>");
                /* For testing */
                //console.log('I have cancelled movements due to toggling followGPS now =' + followGPS)

                break;
        }
    }

    /* On the click of the #fabLocate which is the location button in the bottom right the following actions will occur */
    $('.locOn').on("click", function () {

        /*If follow GPS is on then turn it off else turn it on - 2 is off 1 is on*/
        if (followGPS) {
            locateButton(2);
        } else {
            locateButton(1);
        }

    })

    /*On any movement of the map:
    - the follow GPS setting and locate button is turned off
    - the autocomplete options are updated*/
    function mapMove() {
        /*This updates the fab icon*/
        if (followGPS) {
            /*This updates the locate button by passing in the second switch option that turns the button off*/
            locateButton(2);
            /*For testing*/
            // console.log('toggling locate button');
        }
    }
    $('#map').on("swipe tap click taphold", function () {
        //console.log('map touched in some way');
        mapMove();
    })
    //This does the same but when the map is scrolled
    map.on('dragstart', function () {
        // console.log('map dragged');
        mapMove();

    });

    // --- MENU CONTROLS ---
    // Opens the menu and adds the shadow on the right edge
    function openMenu() {
        document.getElementById('menu').toggle();
        $('#menu').addClass('menuShadow');
    }
    // closes the menu
    function closeMenu() {
        document.getElementById('menu').toggle();
    }
    $('.menuButton').on("click", function () {
        openMenu();
    })

    //listens to onsenui event for the splitter menu closing line 22815 of onsenui.js
    //removes the shadow when the menu closes
    $('#menu').on('postclose', function () {
        console.log('menu closed');
        $('#menu').removeClass('menuShadow');
    });

    //stops the click event passing through to the map div causing a GetFeatureInfo request
    $('.stopClickThrough').on("click tap taphold dblclick swipe", function (e) {
        e.stopPropagation();
    })

    /*Allows the search bar to work by stopping clicks from propagating*/
    el = document.getElementById('mapSearchBar');
    L.DomEvent.disableClickPropagation(el);

    var menu = document.getElementById('menu');
    var navi = document.getElementById('navi');
    //Loads a page on the menu 
    window.fn = {};
    window.fn.load = function (page) {
        closeMenu();
        navi.bringPageTop(page, {
            animation: 'fade'
        });
    };
    searchedLocation = L.featureGroup()
    L.LayerGroup.include({
        customGetLayer: function (id) {
            for (var i in this._layers) {
                if (this._layers[i].id == id) {
                    return this._layers[i];
                }
            }
        }
    });
    var searchMarkerPresent = false;
    $('#mapSearchBar').on('click tap', function () {
        // console.warn(searchedLocation.hasLayer(searchedLocation.customGetLayer('selectedSearchMarker')));
        if (searchedLocation.hasLayer(searchedLocation.customGetLayer('selectedSearchMarker'))) {
            searchMarkerPresent = true;
        } else {
            searchMarkerPresent = false;
        }
        navi.bringPageTop(('search.html'), {
            animation: 'none'
        });
    });
    var currentSearchLocation = "";
    var characterCount = 0;

    function clearSearchBar() {
        addHideClass($('.clearSearchBar'));
        currentSearchLocation = "";
        $('#autocomplete').autocomplete('clear');
        $('#mapSearchBar').val(currentSearchLocation);
        $('#autocomplete').val(currentSearchLocation);
        console.log('search bar should be cleared');
    }

    function toggleHideClass(el) {
        el.toggleClass('hide');
    }

    function addHideClass(el) {
        el.addClass('hide');
    }

    function removeHideClass(el) {
        el.removeClass('hide');
    }

    $('.clearSearchBar').on('click', function () {
        clearSearchBar();
    });

    // --- Other page JS ---

    // search page load - pick up here - use if function to pick up which page has been pushed
    document.addEventListener('postpush', function (event) {
        console.log('page pushed');

        if ($('#searchPage').length) {
            console.log('yay i made it work ' + $('#searchPage').length + ' ' + map.getCenter());
            //enter code for searchPage here
            $(function () {
                $('#autocomplete').focus().val(currentSearchLocation);

                if (currentSearchLocation.length > 0) {
                    removeHideClass($('.clearSearchBar'));
                }
            });

            $('.clearSearchBar').on('click', function () {
                clearSearchBar();

            });
            $('#autocomplete').keyup(function () {
                characterCount = ($('#autocomplete').val()).length;
                console.log('entering switch');
                //  console.log(characterCount > 0);
                if (characterCount === 0) {
                    addHideClass($('.clearSearchBar'));
                    console.log('cross hidden');
                } else if (characterCount === 1) {
                    removeHideClass($('.clearSearchBar'));
                    console.log('I should be showing a cross');
                }

            });

            // JQuery controller for Mapzen geocoder
            var myArray = [];
            var geocodeAction = 'autocomplete'; //'search';
            var mapzenSearchUrl = "https://search.mapzen.com/v1/" + geocodeAction + "?api_key=" + mapzenTkn;
            var numberOfResults = 20;


            function addSelectionToMap(id, lat, lon) {
                var selection = L.marker([lat, lon]);
                selection.id = id;
                //device.name = yourTrackers[deviceInformationFromID(deviceId)].name;
                searchedLocation.addLayer(selection).addTo(map);
                /*trackers.customGetLayer(deviceId).bindTooltip(device.name, {
                    permanent: true,
                    direction: 'top'
                }).openTooltip();*/
            }
            $('#autocomplete').autocomplete({
                onSearchStart: function () {
                    myArray = [];
                },
                params: {
                    'focus.point.lat': map.getCenter().lat,
                    'focus.point.lon': map.getCenter().lng
                    //size: numberOfResults
                },
                serviceUrl: mapzenSearchUrl,
                deferRequestBy: 0,
                paramName: 'text',
                width: '100vw',
                appendTo: $('#autocomplete-response-container'),
                groupBy: 'layer',
                transformResult: function (response) {
                    var jsonResponse = JSON.parse(response);
                    var jsonFeatures = jsonResponse.features;
                    for (var i = 0, l = jsonFeatures.length; i < l && i < numberOfResults; i++) {
                        myArray.push({
                            // this is the point that decides what is shown in the search bar
                            value: jsonFeatures[i].properties.label,
                            data: {
                                coordinates: jsonFeatures[i].geometry.coordinates,
                                layer: jsonFeatures[i].properties.layer
                            }
                        })
                    }
                    return {
                        suggestions: $.map(myArray, function (item) {
                            return {
                                value: item.value,
                                data: item.data
                            }
                        })
                    }
                },
                // groupBy: 'layer',
                onSelect: function (suggestion) {
                    console.log('you selected: ' + suggestion.value + ', ' + suggestion.data);
                    currentSearchLocation = suggestion.value;
                    //the comment block below is to remove pre-existing markers - relies on a variable set before jumping to the search page
                    // console.warn(!(searchMarkerPresent));
                    if (!(searchMarkerPresent)) {
                        addSelectionToMap('selectedSearchMarker', suggestion.data.coordinates[1], suggestion.data.coordinates[0]);
                    } else {
                        searchedLocation.removeLayer(searchedLocation.customGetLayer('selectedSearchMarker'));
                        addSelectionToMap('selectedSearchMarker', suggestion.data.coordinates[1], suggestion.data.coordinates[0]);
                    } //searchedLocation = L.marker([suggestion.data.coordinates[1], suggestion.data.coordinates[0]]);
                    // searchedLocation.addTo(map);
                    followGPS = false;
                    //map.flyTo(searchedLocation.getLatLng(), 15);
                    map.fitBounds(searchedLocation.getBounds(), {
                        maxZoom: 15
                    });
                    navi.bringPageTop('map.html', {
                        animation: 'none'
                    });

                    //console.log(map.hasLayer(searchedLocation));
                    $('#mapSearchBar').val(currentSearchLocation);
                }

            });
        }
    });



    //my first test of ajax requests
    /*$.ajax({
        url: mapzenSearchUrl
            //url: thisOne
    }).then(function (data) {
        $('#testing').replaceWith(data.features[0].properties.id);


    });*/
    // autocomplete on the search bar

    //End of the ons.ready function
});