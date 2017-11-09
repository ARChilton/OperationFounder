/**
 * @file Javascript for OperationFounder app
 * @copyright Adam Chilton 2017
 */

/** Information stored in localstorage:
 * @param {string} username: username of the user
 * @param {string} password: password of the user
 * @param {boolean} previousSignIn signed in or out
 * @param {string} couchdb url of couchdb
 * @param {string[]} db array of databases
 * @param {boolean | undefined} evtOrganiser event organiser
 * @param {string} http whether the couchdb instance is http:// or https://
 * @param {boolean | undefined} verified whether the user is verified
 */
//dev variables

// global variables
var eventDescription;
var baseCodes = []; // MUST BE LOWER CASE
var baseNames = [];
var appdb;
var appdbConnected = false;
var basedb;
var basedbConnected = false;
var remotedb;
var remotedbConnected = false;
var admindb;
var admindbConnected = false;
var adminSyncInProgress = false;
var baseSyncInProgress = false;
var evtUpdateCheckConnected = false;
var syncBasedb;
var adminSync;
var evtUpdateCheck;
var adminCurrentlySelected;
var userCurrentlySelected;
var deleteNotificationCleared = true;
var attemptCount = 0;
//user variables
var username = localStorage.username;
var password = localStorage.password;
//db variables
var lastDb = localStorage.lastDb;
var couchdb = localStorage.couchdb;
var http = localStorage.http;
var db = localStorage.db;
//database names
var adminDatabaseName;
var baseDatabaseName;
var appDatabaseName = 'oppFounderLoginDb';
//var remotedbURL = 'http://@vps358200.ovh.net:5984/adam_test_ssl';
//var remotedbURL = 'https://admin:f80caba00b47@couchdb-335dec.smileupps.com/founder';
//var remotedbURL = 'http://adam123:adam123@127.0.0.1:5984/adam123';
var remotedbURL = http + username + ':' + password + '@' + couchdb + '/' + lastDb;

//server variables
var appServer = 'http://127.0.0.1:3000'; //'https://adam.localtunnel.me'; 

// map variables
var marker;
var accuracyCircle;
var locationFoundCount = 0;
var followGPS;
var mapMarkers = L.featureGroup()
L.LayerGroup.include({
    customGetLayer: function (id) {
        for (var i in this._layers) {
            if (this._layers[i].id == id) {
                return this._layers[i];
            }
        }
    }
});
var mapMade = false;
var map;
var BING_KEY = 'AqVat8HR9TsQF1uwWckLU_1Dv_wrrDR3ThriJUmZyDhPcHRGwpeTDA9NVhKaS5RX';
var turnCachingOn = true;
var reCacheAfter = 30 * 24 * 3600 * 1000;
var bingOS = L.tileLayer.bing({
    bingMapsKey: BING_KEY,
    imagerySet: 'ordnanceSurvey',
    maxNativeZoom: 17,
    maxZoom: 17,
    minZoom: 10,
    useCache: turnCachingOn,
    crossOrigin: true,
    cacheMaxAge: reCacheAfter
})
// var currentLocation;
// var location;
// login variables
var base;
var name;

//table variables
var tableId;
var tableLogId;
// Quick submit variables
var sqPatrol;
var sqTimeIn;
var sqTimeOut;
var sqWait;
var sqOffRoute;
var sqTotalScore;
var patrolRecord = [];
var patrolRecordAdmin = [];
var offRouteIndex = [];
var offRouteIndexAdmin = [];
//page change animation
var pageChangeAnimation = 'none';
/**
 * Device ready event listener
 * @event deviceReady - the device is deemed ready in the cordova lifecycle
 */
document.addEventListener("deviceready", onDeviceReady, false);
/**
 * handles the deveice ready event on mobile devices
 */
function onDeviceReady() {
    // Now safe to use device APIs
    console.log('deviceready');
    if (cordova.platformId == 'android') {
        StatusBar.backgroundColorByHexString("#283593"); //#333 grey #00796B is 700 color for teal

    }

}
/**
 * Device paused i.e. is no longer the top app on view, this can be used to run functions in the background
 * @event pause - the app has been set to pause in the lifecycle
 */
document.addEventListener("pause", onPause, false);
/**
 * handles the on pause event in the lifecycle
 */
function onPause() {
    // Handle the pause event
    console.log('devicePaused');


}
/**
 * Resume event listener, listens for the app to be brought back into focus
 * @event resume - the app has been resumed in the lifecycle
 */
document.addEventListener("resume", onResume, false);
/**
 * Handles the on resume event in the lifecycle
 */
function onResume() {
    // Handle the resume event
    console.log('deviceResume');
}
/**
 * Checks the orientation and updates the GUI accordingly, landscape only
 */
function orientationLandscapeUpdate() {
    if (ons.orientation.isLandscape()) {
        $('.landscapeHide').addClass('hide');
        $('.landscapeShow').removeClass('hide');
    } else {
        console.log('portrait screen orientation');
    }
}
/**
 * For an orientation change this picks up both portrait and landscape
 */
function orientationUpdates() {
    if (ons.orientation.isLandscape()) {
        $('.landscapeHide').addClass('hide');
        $('.landscapeShow').removeClass('hide');
    } else {
        $('.landscapeShow').addClass('hide');
        $('.landscapeHide').removeClass('hide');
    }
}


/**
 * destroys basedb and opFounderAppDb
 */
function destroyPouchDBs() {
    var x = new PouchDB(baseDatabaseName).destroy().then(function () {
        ons.notification.alert(baseDatabaseName + '/basedb database destroyed');
    });
    var y = new PouchDB(appDatabaseName).destroy().then(function () {
        ons.notification.alert(appDatabaseName + '/opFounderAppDb database destroyed');
    });
    var y = new PouchDB(adminDatabaseName).destroy().then(function () {
        ons.notification.alert(adminDatabaseName + '/admindb database destroyed');
    });

}
/**
 *  a clear all function which is not currently available from the GUI
 */
function cleanAll() {
    ons.notification.prompt({
        title: 'Clean all databases',
        messageHTML: '<p>You are about to delete all items from the central database, this will propagate out to all other devices, are you sure you want to do this?</p><p>If yes please enter the admin passcode used to access the admin portion of the app</p>',
        cancelable: true,
        placeholder: 'Enter admin code here',
    }).then(function (input) {
        if (input.toLowerCase() === baseCodes[0]) {
            console.log('you have ended the world');
            admindb.allDocs().then(function (doc) {
                for (var i = 0, l = doc.total_rows; i < l; i++) {

                    var path = doc.rows[i];
                    var testForDesignDocs = '_design'
                    console.log(path.id + ' ' + path.value.rev);
                    if (testForDesignDocs.test(path.id)) {
                        var deletedRecord = {
                            _id: path.id,
                            _rev: path.value.rev,
                            _deleted: true
                        }

                        admindb.put(
                            deletedRecord,
                            options
                        ).catch(function (err) {
                            console.log(err);
                        });

                    }
                }
            }).then(function () {
                admindb.compact().then(function (doc) {
                    console.log(doc);
                }).catch(function (err) {
                    console.log(err);
                });
            });
        }

    });
}

/**
 * show map page
 */
function goToMap() {
    navi.bringPageTop('map.html', {
        animation: pageChangeAnimation
    }).then(function () {
        map.invalidateSize();
    }).catch(function (err) {
        createMap();
        setTimeout(function () {
            map.invalidateSize()
        }, 1000);
    });


    document.getElementById('menu').toggle();
    map.locate({
        setView: false,
        // maxZoom: map.getZoom(),
        watch: true,
        enableHighAccuracy: true
    });

}
/**
 * A function that runs on the map page when the map back button is pressed. This stops the map page being taken out of the page stack and therefore breaking leaflet
 */
function mapBackButton() {
    map.stopLocate();
    ons.enableDeviceBackButtonHandler();
    var index = getBaseNumber();
    switch (index) {
        case 0:
            return navi.bringPageTop('admin.html', {
                animation: pageChangeAnimation
            });
            break;
        default:
            if (index === 'logout') {
                throw navi.resetToPage('loginPage.html', {
                    animation: pageChangeAnimation
                }).then(function (doc) {;
                    ons.notification.alert({
                        title: 'error',
                        message: 'An error has occured and have returned to the login screen, please log in again',
                        cancelable: true
                    });
                });
            }
            return navi.bringPageTop('page1.html', {
                animation: pageChangeAnimation
            });
            break;
    }
}
/**
 * Creates the map on the map page behind the scenes
 */
function createMap() {
    if (!(mapMade)) {
        //map centred on Hadlow // pick up here   
        try {
            setTimeout(function () {
                map = L.map('map', {
                    center: [
                        51.22435656415686, 0.3305253983853618
                    ],
                    zoom: 16,
                    layers: [bingOS],
                    zoomControl: false
                });
                // Adds a marker to the centre of the map before the GPS changes it's location
                var currentLatLon = map.getCenter();
                var currentLat = currentLatLon.lat;
                var currentLng = currentLatLon.lng;
                var startRadius = 3;
                if (locationFoundCount == 0) {
                    accuracyCircle = L.circle(currentLatLon, {
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
                    locationFoundCount++;
                }
                var followGPS = false;


                /**
                 * On the success of the location function, this will locate you on the map and add a marker to show where you are
                 * @param {*} e - location passed by the location function
                 * @param {*} e.accuracy - the accuracy of the location
                 * @param {any[]} e.latlng - the lat lng array of the location
                 */
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
                /**
                 * 
                 * @param {*} e - error message passed by the location function
                 */
                function onLocationError(e) {
                    //alert(e.message);
                    $('#fabLocate').hide();

                    // Raven.captureException(e);
                }

                map.on('locationfound', onLocationFound);
                map.on('locationerror', onLocationError);

                /**
                 * This function controls the locate button's ability to follow the GPS marker or not - 2 = off 1 = on
                 * @param {number} press - value is either 1 or 2 depending on whether you wish to follow the gps locations as they are found or not
                 */
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
                            console.log('following marker');

                            break;

                        case 2:

                            /* This updates whether the map follows the marker's GPS movements */
                            followGPS = false;
                            /*This will change the styling of the fabLocate button*/
                            $('#fabLocateIcon').replaceWith("<ons-icon icon=\"md-gps\" class=\"locateAlign locateNotSelected\" id=\"fabLocateIcon\"><\/ons-icon>");
                            /* For testing */
                            console.log('I have cancelled movements due to toggling followGPS now =' + followGPS)

                            break;
                    }
                }


                /* On the click of the #fabLocate which is the location button in the bottom right the following actions will occur */
                if (!($('.locOn').hasClass('evtHandler'))) {
                    $('.locOn').addClass('evtHandler');
                    $('.locOn').on("click", function (e) {

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
                    /**
                     * On any movement of the map: - the follow GPS setting and locate button is turned off - the autocomplete options are updated
                     * utilised followGPS as a global variable
                     */
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
                }

            }, 500);

            mapMade = true;
        } catch (err) {
            console.log(err);
            createMap();
        }
    }
}
// GPS location
// function getGeolocation() {
//     var geolocationOptions = {
//         enableHighAccuracy: true,
//         maximumAge: 1000 * 20
//     }
//     navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError, geolocationOptions);
// }

// function geolocationSuccess(position) {
//     console.log('geolocationSuccess');
//     console.log(position);
//     console.log(position.coords.latitude)
//     location = {
//         lat: position.coords.latitude,
//         lon: position.coords.longitude
//         //acc: position.coords.accuracy
//     };
//     console.log(location);

// }

// function geolocationError(err) {
//     console.log('geolocationError');
//     console.log(err);
// }


/**
 * keeps track of which patrol entries have already been input
 * @param {string|number} id - id in the database
 * @param {boolean} offRoute - true or false, determines which list the record is added to as the same team can be off route multiple times
 * @param {boolean} admin - true or false, are you using the admin page(true) or the base page (false or not present)
 */
function patrolRecordUpdate(id, offRoute, admin) {
    if (admin) {
        if (!(offRoute)) {
            var index = patrolRecordAdmin.indexOf(id);
            //checks that it isn't an off route entry in which case we are happy to duplicate in the table
            if (index > -1) {
                console.log('record already exists')
                return true;
            } else {
                patrolRecordAdmin.push(id);
                return false;
            }
        } else {
            var index = offRouteIndexAdmin.indexOf(id);
            if (index > -1) {
                console.log('record already exists')
                return true;
            } else {
                offRouteIndexAdmin.push(id);
                return false;
            }
            //return false; // returns without adding to the overwrite table list
        }
    } else {
        if (!(offRoute)) { //checks that it isn't an off route entry in which case we are happy to duplicate in the table
            var index = patrolRecord.indexOf(id);
            if (index > -1) {
                return true;
            } else {
                patrolRecord.push(id);
                return false;
            }
        } else {
            var index = offRouteIndex.indexOf(id);
            if (index > -1) {
                console.log(id + 'record already exists')
                return true;
            } else {
                offRouteIndex.push(id);
                return false;
            }
            // return false; // returns without adding to the overwrite table list
        }
    }
}

// A function to remove a record from the patrol records list
/**
 *  A function to remove a record from the patrol records list
 * @param {string|number} id - database id required for removing from the list
 * @param {boolean} admin - admin page or base page to determine which array to edit
 * @return {boolean}
 */
function removePatrolRecord(id, admin) {

    switch (admin) {
        case true:
            var deleteIndex = patrolRecordAdmin.indexOf(id);
            var offRouteDeleteIndex = offRouteIndexAdmin.indexOf(id);
            if (deleteIndex > -1) {
                patrolRecordAdmin.splice(deleteIndex, 1);
                return true;
            } else if (offRouteDeleteIndex > -1) {
                offRouteIndexAdmin.splice(offRouteDeleteIndex, 1);
                return true;
            } else {
                console.log('record isnt in the admin array of logs');
                return false;
            }
            //  break; //removed as the returns make this unreachable
        case false:
            var deleteIndex = patrolRecord.indexOf(id);
            var offRouteDeleteIndex = offRouteIndex.indexOf(id);
            if (deleteIndex > -1) {
                patrolRecord.splice(deleteIndex, 1);
                return true;
            } else if (offRouteDeleteIndex > -1) {
                offRouteIndex.splice(offRouteDeleteIndex, 1);
                return true;
            } else {
                console.log('record isnt in the base logs');
                return false;
            }
            // break; //removed as the returns make this unreachable
    }

}
/**
 * Adds the editable or locked styling to the row in the table. This is important as that styling is used elsewhere in the code to allow editing or not.
 * @param {boolean} editable - true = can be edited, false = locked by HQ on admin page
 * @param {string} trId - #Id of the html to be edited - refers to a table record
 */
function editableStyling(editable, trId) {
    if (!(editable)) {
        $('#' + trId).addClass('lockedLog');
        $('#' + trId + ' > .lockImage').addClass('padlockLocked');

    } else {
        $('#' + trId).removeClass('lockedLog');
        $('#' + trId + ' > .lockImage').removeClass('padlockLocked');
    }
}


/**
 * a function to remove an exisiting record from a base
 * @param {string|number} id - database id
 * @param {boolean} admin - admin page or base page
 * @todo add delete functionality to the base page - this function is currently unused
 */
function removeExisiting(id, admin) {
    $('#' + id).remove();
}
/**
 * functions to update the table or row according to the update table function for the Base page's table
 * @param {string|number} dbId - _id in the database
 * @param {string|number} patrolNo - patrol number in the databse document
 * @param {string} timeIn - time the patrol came into the base
 * @param {string} timeOut - time the patrol left the baseCode
 * @param {string|number} wait - time the patrol waited, if they waited at all
 * @param {boolean} offRoute - if the patrol was meant to attend this base or was on the wrong route but recorded as being seen
 * @param {string|number} totalScore - score recorded on the base
 * @param {boolean} editable - can the record be edited by the base or not
 * @param {string} tableId - base table or admin table
 * @param {string} tableLogId - the class of the row(unused in this function)
 */
function updateExisting(dbId, patrolNo, timeIn, timeOut, wait, offRoute, totalScore, editable, tableId, tableLogId) {
    var trId = dbId;
    $('#' + trId).html("<td class='bold lockImage'>" + patrolNo + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow'>" + offRoute + "</td><td>" + totalScore + "</td><td class='hide landscapeShow editable'>" + editable + "</td>");

    //add editable styling
    editableStyling(editable, trId);
}
/**
 * functions to update the table or row according to the update table function for the Admin table
 * @param {string|number} dbId - _id in the database
 * @param {string|number} patrolNo - patrol number in the databse document
 * @param {string} timeIn - time the patrol came into the base
 * @param {string} timeOut - time the patrol left the baseCode
 * @param {string|number} wait - time the patrol waited, if they waited at all
 * @param {boolean} offRoute - if the patrol was meant to attend this base or was on the wrong route but recorded as being seen
 * @param {string|number} totalScore - score recorded on the base
 * @param {boolean} editable - can the record be edited by the base or not
 * @param {string} tableId - base table or admin table
 * @param {string} tableLogId - the class of the row (unused in this function)
 */
function updateAdminExisting(dbId, patrolNo, timeIn, timeOut, wait, offRoute, totalScore, editable, base, recordedBy, tableId, tableLogId) {
    var trId = dbId;
    //without checkboxes
    $('#' + trId).html("<td class='lockImage'>" + base + "</td><td class='bold'>" + patrolNo + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow'>" + offRoute + "</td><td class='hide landscapeShow'>" + totalScore + "</td><td class='hide landscapeShow'>" + recordedBy + "</td><td class='hide landscapeShow editable'>" + editable + "</td>");
    //with checkboxes
    //$('#' + tableLogId + patrolNo + '-' + base).html("<td class='hide landscapeShow'><ons-input type='checkbox'></ons-input></td><td class='bold'>" + patrolNo + "</td><td>" + base + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow'>" + offRoute + "</td><td class='hide landscapeShow'>" + totalScore + "</td><td class='hide landscapeShow'>" + recordedBy + "</td><td class='hide landscapeShow editable'>" + editable + "</td>");

    //add editable styling
    editableStyling(editable, trId);
}

/**
 * Function which initially adds a row to the base's table
 * @param {string|number} dbId - _id in the database
 * @param {string|number} patrolNo - patrol number in the databse document
 * @param {string} timeIn - time the patrol came into the base
 * @param {string} timeOut - time the patrol left the baseCode
 * @param {string|number} wait - time the patrol waited, if they waited at all
 * @param {boolean} offRoute - if the patrol was meant to attend this base or was on the wrong route but recorded as being seen
 * @param {string|number} totalScore - score recorded on the base
 * @param {boolean} editable - can the record be edited by the base or not
 * @param {string} tableId - base table or admin table
 * @param {string} tableLogId - the class of the row
 */
function updateTable(dbId, patrolNo, timeIn, timeOut, wait, offRoute, totalScore, editable, tableId, tableLogId) {
    // console.log(tableId + ' ' + tableLogId);
    var trId = dbId;
    $(tableId).prepend("<tr id='" + trId + "'class=" + tableLogId + "'><td class='bold lockImage'>" + patrolNo + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow'>" + offRoute + "</td><td>" + totalScore + "</td><td class='hide landscapeShow editable'>" + editable + "</td></tr>");
    $('#' + trId).data('databaseInfo', {
        dbId: dbId,
        trId: trId,
    });
    //add editable styling
    editableStyling(editable, trId);

}
/**
 * Function which initially adds a row to the admin's table
 * @param {string|number} dbId - _id in the database
 * @param {string|number} patrolNo - patrol number in the databse document
 * @param {string} timeIn - time the patrol came into the base
 * @param {string} timeOut - time the patrol left the baseCode
 * @param {string|number} wait - time the patrol waited, if they waited at all
 * @param {boolean} offRoute - if the patrol was meant to attend this base or was on the wrong route but recorded as being seen
 * @param {string|number} totalScore - score recorded on the base
 * @param {boolean} editable - can the record be edited by the base or not
 * @param {string} tableId - base table or admin table
 * @param {string} tableLogId - the class of the row
 */
function updateAdminTable(dbId, patrolNo, timeIn, timeOut, wait, offRoute, totalScore, editable, base, recordedBy, tableId, tableLogId) {
    console.log(dbId);
    var trId = dbId;
    // without checkboxes
    $(tableId).prepend("<tr id='" + trId + "' class='" + tableLogId + "'><td class='lockImage'>" + base + "</td><td class='bold'>" + patrolNo + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow'>" + offRoute + "</td><td class='hide landscapeShow'>" + totalScore + "</td><td class='hide landscapeShow'>" + recordedBy + "</td><td class='hide landscapeShow editable'>" + editable + "</td></tr>");
    //with checkboxes

    // $(tableId).prepend("<tr id='" + trId + "' class='" + tableLogId + "'><td class='hide landscapeShow'><ons-input type='checkbox'></ons-input></td><td class='bold'>" + patrolNo + "</td><td>" + base + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow'>" + offRoute + "</td><td class='hide landscapeShow'>" + totalScore + "</td><td class='hide landscapeShow'>" + recordedBy + "</td><td class='hide landscapeShow editable'>" + editable + "</td></tr>");
    $('#' + trId).data('databaseInfo', {
        dbId: dbId,
        trId: trId,
    });

    //add editable styling
    editableStyling(editable, trId);
}
/**
 * Standardised update table or update exisiting row calling function (was previously two functions)
 * @param {object} path - determines the route into the JSON database document to get to the documents values, this differs in an alldocs request and a find function or sync input
 * @param {boolean} admin - true or false whether the user is an admin and whether the table to be updated is the admin table or not
 */
function tableUpdateFunction(path, admin) {

    console.log(path.patrol + ' ' + path.base + ' ' + path._id);
    if (admin == true) {
        // tableId = '#adminLogsTable';
        tableLogId = 'ad-log-';
    } else {
        //tableId = '#logsTable'
        tableLogId = 'log-';
    }
    if (path.offRoute) { // stops off route logs being updated automatically
        tableLogId = tableLogId + '-or';
    }
    if (admin) {
        if (patrolRecordUpdate(path._id, path.offRoute, true)) {
            updateAdminExisting(path._id, path.patrol, path.timeIn, path.timeOut, path.timeWait, path.offRoute, path.totalScore, path.editable, path.base, path.username, '#adminLogsTable', tableLogId);
        } else {
            updateAdminTable(path._id, path.patrol, path.timeIn, path.timeOut, path.timeWait, path.offRoute, path.totalScore, path.editable, path.base, path.username, '#adminLogsTable', tableLogId);
        }

    } else if (path.base === getBaseNumber()) {
        if (patrolRecordUpdate(path._id, path.offRoute, false)) {
            updateExisting(path._id, path.patrol, path.timeIn, path.timeOut, path.timeWait, path.offRoute, path.totalScore, path.editable, '#logsTable', tableLogId);
        } else {
            updateTable(path._id, path.patrol, path.timeIn, path.timeOut, path.timeWait, path.offRoute, path.totalScore, path.editable, '#logsTable', tableLogId);
        }

    }
}
/**
 * updates the table at the bottom of the screen on page1.html and admin.html from a find query or any input with doc.rows
 * @param {object} doc - the document from the database
 * @param {boolean} admin - true or false whether the user is an admin and whether the table to be updated is the admin table or not
 */
function updateTableFromAllDocs(doc, admin) {
    console.log('updating from all docs on local db');
    for (var i = 0, l = doc.total_rows; i < l; i++) {

        var path = doc.rows[i].doc;
        tableUpdateFunction(path, admin);
    }
    orientationLandscapeUpdate();
}
/**
 * updates the table at the bottom of the screen on page1.html and admin.html from a find query or any input with doc.docs
 * @param {object} doc - the document from the database
 * @param {boolean} admin - true or false whether the user is an admin and whether the table to be updated is the admin table or not 
 */
function updateTableFromFindQuery(doc, admin, patrolToSearch) {

    console.log('updating from find query');
    //console.log(doc);
    for (var i = 0, l = doc.docs.length; i < l; i++) {

        var path = doc.docs[i];
        //console.log(path);
        try {
            if (path._deleted > 0) {


                console.log(path._id + ' has been set to deleted in remotedb');
                //if the record is the array of IDs in the table
                if (removePatrolRecord(path._id, admin)) {
                    //remove the row # + ID 
                    $('#' + path._id).remove();
                    console.log(path._id + ' removed');



                    if (deleteNotificationCleared) {
                        deleteNotificationCleared = false;
                        ons.notification.alert({
                            title: 'HQ deleted some logs',
                            messageHTML: 'For your awareness HQ have deleted logs and they will be removed from your log list',
                            cancelable: true
                        }).then(function (input) {
                            deleteNotificationCleared = true;

                        });
                    }
                }

            } else if (path.patrol != undefined) {
                if (path.patrol.length > 0) {
                    if (path.patrol === patrolToSearch || !patrolToSearch || patrolToSearch === undefined) {
                        tableUpdateFunction(path, admin);
                    }
                }
            } else if (path._id === 'eventDescription') {
                //console.log(path);
                console.log('event description update');
                ons.notification.alert({
                    title: 'Event Update',
                    messageHTML: '<p>This event has been updated by the event organisers.</p><p>Your device will update once this message closes.</p>',
                    cancelable: true
                }).then(function () {
                    navi.resetToPage('updatePage.html', {
                        animation: pageChangeAnimation,
                        data: {
                            eventInfo: path,
                            lastPage: navi.topPage.name
                        }
                    });

                }).catch(function (err) {
                    console.log(err);
                });
                //break;
            }
        } catch (err) {
            console.log(err);
        }
    }
    orientationLandscapeUpdate();

}


/**
 * clear inputs on page1.html
 */
function clearQuickAddInputs() {
    $('.quickAddInput').val('');
    $('#wait').val('0');
    $('#offRoute').prop('checked', false);
    $('#total').prop('disabled', false);

}
/**
 * User Edit function
 * @param {object[]} logs - array of logs selected by the user
 */
function editLog(logs) {
    var logsLength = logs.length;
    var timestamp = new Date().toISOString();

    for (var i = 0, l = logsLength; i < l; i++) {
        var id = logs[i].dbId;
        var trId = logs[i].trId;
        basedb.get(id)
            .then(function (doc) {
                switch (doc.editable) {
                    case false:
                        ons.notification.alert({
                            title: 'No longer editable',
                            message: 'This record has been locked by HQ and cannot be edited',
                            cancelable: true
                        });
                        break;
                    case true:
                        $('#patrolNo').val(doc.patrol);
                        $('#timeIn').val(doc.timeIn);
                        $('#timeOut').val(doc.timeOut);
                        $('#wait').val(doc.timeWait);
                        $('#total').val(doc.totalScore);
                        switch (doc.offRoute) {
                            case true:
                                console.log('should be checked');
                                $('#offRoute').prop('checked', true);
                                break;
                            case false:
                                $('#offRoute').prop('checked', false);
                        }
                        break;
                }
            });
    }

}

//--Admin functions

/**
 * Delete function ONLY FOR ADMINs as it only works on admindb
 * @param {object[]} deleteDocs - array of selected rows in the table to be deleted
 */
function deleteRecords(deleteDocs) {
    var deletedDocsLength = deleteDocs.length;
    var timestamp = new Date().toISOString();
    //deleteDocs should be an array of database _id values for updating to status deleted = true
    for (var i = 0, l = deletedDocsLength; i < l; i++) {
        var id = deleteDocs[i].dbId;
        var trId = deleteDocs[i].trId;

        /**
         * Will make 5 attempts to write the edit to the db in the case of conflicts occuring
         * @param {string} id - _id in the pouch database to be written
         */
        function writeUntilWritten(id) {

            admindb.get(id)

                .then(function (doc) {
                    var origRev = doc._rev;
                    admindb.put({
                        _id: id,
                        _rev: origRev,
                        username: name,
                        timestamp: timestamp,
                        _deleted: true
                    })
                }).catch(function (err) {
                    if (err.status === 404) {
                        admindb.put({
                            _id: id,
                            _rev: origRev,
                            username: name,
                            timestamp: timestamp,
                            _deleted: true
                        });
                    }
                    if (err.status === 409) {

                        if (attemptCount < 5) {
                            attemptCount++
                            return writeUntilWritten(id);
                        } else {
                            console.log('409 could not be written');
                        }
                    }

                    //else if (err.status == 404) {
                    //     ons.notification.alert({
                    //         title: '404 not found',
                    //         message: 'The record you are trying to delete was not found, this might be because someone else has just deleted it.'
                    //     })
                });
        }
        writeUntilWritten(id);
        $('#' + trId).remove();
    }

    ons.notification.alert({
        title: deletedDocsLength + ' logs deleted',
        message: 'You have set ' + deletedDocsLength + ' to deleted. This has updated the record to deleted but has not removed all previous records from the database. To undo the deletion will require database admin privaledges.',
        cancelable: true
    });

}




/**
 * Lock from editing any further function
 * @param {object[]} lockDocs - array of ids that have been user selected from the table to be locked
 * @param {boolean} lock - true = lock the document from edits, false = unlock the doc from edits
 */
function lockOrUnlockLogFromEdits(lockDocs, lock) {
    //lockDocs is an array of db Ids and ids from the table
    // lock defines if the log is locked or unlocked

    var lockDocsLength = lockDocs.length;
    var timestamp = new Date().toISOString();

    switch (lock) {
        case false:
            var message = 'unlocked';
            var message2 = 'allow';
            break;
        case true:
            var message = 'locked';
            var message2 = 'stop';
            break;
    }
    for (var i = 0, l = lockDocsLength; i < l; i++) {
        var id = lockDocs[i].dbId;
        var trId = lockDocs[i].trId;
        admindb.get(id)
            .then(function (doc) {
                console.log(doc);
                switch (lock) {
                    case true:
                        doc.editable = false;
                        break;
                    case false:
                        doc.editable = true;
                        break;
                }
                doc.timestamp = timestamp;
                tableUpdateFunction(doc, true)
                switch (lock) {
                    case true:
                        $('#' + trId).addClass('lockedLog');
                        break;
                    case false:
                        $('#' + trId).removeClass('lockedLog');
                        break;
                }

                return admindb.put(doc)
            }).then(function () {
                orientationLandscapeUpdate();
            })
            .catch(function (err) {
                console.log(err);
            })

    }

    //orientationUpdates();
    ons.notification.alert({
        title: lockDocsLength + ' logs ' + message,
        message: 'You have set ' + lockDocsLength + ' to ' + message + '. This will propagate to other users to ' + message2 + ' them the ability to update the log.',
        cancelable: true
    });
}



/**
 * Show on Map function //unfinished!!
 * @param {any[]} locations - array of user selected locations to be shown on map
 * @todo finish the function to add pins of the selected rows on the map
 */
function showOnMap(locations) {
    var locationsLength = locations.length;
    for (var i = 0, l = locationsLength; i < l; i++) {
        var id = locations[i].dbId;

    }

}

//show locked logs

/**
 * network connection information
 * @returns the type of connection currently in use i.e. WiFi or 4G
 */
function checkConnection() {
    var networkState = navigator.connection.type;
    return networkState;
}
/**
 * 
 * @param {string} email email to code from an @ sign
 */
function changeAtSymbol(email) {
    return email.replace('@', ',40,');
}
/**
 * changes the coded email symbol back to @
 * @param {string} email email address to decode
 */
function changeAtSymbolBack(email) {
    return email.replace(',40,', '@');
}
//-- log in and out functions
/**
 * Adds the current log in session to the appdb pouch database, utilises the base and name variables established via the log in process
 * @param {*} doc - the document previouts got via the db.get(<_id>) functionality
 */
function loginPut(doc) {
    var timestamp = new Date().toISOString();
    return appdb.put({
        _id: doc._id,
        _rev: doc._rev,
        base: base,
        name: name,
        timestamp: timestamp
    });
}
/**
 * Page change handled when log out is performed and resets the log in page except it keeps the name
 */
function logOutPageChange() {
    return navi.bringPageTop('loginPage.html', {
        animation: pageChangeAnimation
    }).then(function (doc) {
        $('#userName').val(name);
        //$('#baseCode').val(''); //testing turning this off as it breaks the dropdown select need to check it works with the basecode input
        $('.adminCleanAll').remove();
        deleteIndexes();
        return doc;
    }).catch(function (err) {
        console.log(err);
    });
}
/**
 * a function to delete some of the main indexes used in the app by the bases
 */
function deleteIndexes() {
    offRouteIndex = [];
    offRouteIndexAdmin = [];
    patrolRecord = [];
    patrolRecordAdmin = [];
    return true;

}
/**
 * function to stop the databases from syncing
 */
function closeDatabases() {
    if (basedbConnected && !syncBasedb.canceled) {
        syncBasedb.cancel();

        syncBasedb;
        basedbConnected = false;
        baseSyncInProgress = false;
    }
    if (admindbConnected && !adminSync.canceled) {
        adminSync.cancel();

        adminSync;
        admindbConnected = false;
        adminSyncInProgress = false;
    }
    if (evtUpdateCheck != undefined && !evtUpdateCheck.canceled) {
        evtUpdateCheck.cancel();
    }
    deleteIndexes();
}

/**
 * Function called to log out by emptying all of the tables and returning to the login page, also reset the current login information in the appdb
 */
function baseLogOut() {
    if (navi.topPage.data.firstPage) {
        var options = {
            animation: pageChangeAnimation,
            data: {
                eventInfo: navi.topPage.data.eventInfo
            }
        };
        navi.replacePage('loginPage.html', options);
    } else {
        var options = {
            animation: pageChangeAnimation,
        }
        navi.popPage(options);
    }

    closeDatabases();
    logOutPageChange();
    document.getElementById('menu').toggle();
    menuController();


    return appdb.get('login_' + username)
        .then(function (doc) {

            var timestamp = new Date().toISOString();
            doc.base = 'logOut';
            doc.timestamp = timestamp;
            return appdb.put(doc);
        })
        .catch(function (err) {
            console.log(err);
            throw err;
        });
}
/**
 * sign out of the session and return to the sign in screen
 */
function signOut() {
    //need to find out why this isn't doing anything on a pushpage event
    navi.resetToPage('signInPage.html', {
        animation: pageChangeAnimation
    });
    baseNames = [];
    baseCodes = [];
    document.getElementById('menu').toggle();
    closeDatabases();
    basedb = undefined;
    admindb = undefined;
    remotedb = undefined;
    remotedbConnected = false;
    localStorage.lastDb = 'false'; //{string} because localstorage would convert to a string anyway
    localStorage.verified = 'false';
    localStorage.evtOrganiser = 'false';
}
/**
 * go to the change event page
 */
function changeEvent() {
    document.getElementById('menu').toggle();
    baseNames = [];
    baseCodes = [];

    closeDatabases();
    basedb = undefined;
    admindb = undefined;
    remotedb = undefined;
    remotedbConnected = false;
    localStorage.lastDb = 'false'; //{string} because localstorage would convert to a string anyway
    var options = {
        animation: pageChangeAnimation
    };

    return navi.resetToPage('eventSelectionPage.html', options);
}
/**
 * A function to take you from the menu to the edit event page
 */
function editEvent() {
    document.getElementById('menu').toggle();
    closeDatabases();
    basedb;
    admindb;
    var options = {
        animation: pageChangeAnimation,
        data: {
            edit: true,
            eventInfo: navi.topPage.data.eventInfo
        }
    };

    return navi.bringPageTop('createEventPage.html', options);
}
/**
 * Function to ensure that the base number is up to date. Had some issues with the base number being worked out previously as code isn't always repeated so use this function to return the base number
 * @returns base variable (the current base number)
 */
function getBaseNumber() {
    return base;
}
/**
 * a function to interact with the server and post users and usernames
 * @param {string} apiAddress the api endpoint including the server address
 * @param {object} dataPackage the object to be sent in the body of the post
 */
function apiAjax(apiAddress, dataPackage) {

    return {
        "async": true,
        "crossDomain": true,
        "url": apiAddress,
        "method": "POST",
        "dataType": "json",
        "xhrFields": {
            "withCredentials": false
        },
        "headers": {
            "content-type": "application/x-www-form-urlencoded",

        },
        "data": dataPackage
    };

}

/**
 * A function to set the base code value when using the dropdown menu.
 * @param {*} value the value to be set as the base code's value
 */
function baseSelectValue(value) {
    document.getElementById('baseSelectDialog').hide();
    return $('#baseCode').val(value).text('Selected base: ' + baseNames[value]);
}
/**
 * The main function for the software, the base number defines which page is presented and what code is run
 * @param {number} base
 * @param {object} data the data object to be passed to the next page
 */
function loginAndRunFunction(base, data) {
    if (data != undefined) {
        var options = {
            animation: pageChangeAnimation,
            data: data
        }
    } else {
        var options = {
            animation: pageChangeAnimation
        }
    }
    switch (base) {
        case 'logOut':
            //-- logged out user --
            logOutPageChange();
            break; // end of logged out user code
        case -1:
            // --- incorrect login information
            alert('incorrect login information saved, please log in again');
            console.log(err);
            navi.bringPageTop('loginPage.html', options);
            break;
        case 0:
            // -- admin user --
            navi.bringPageTop('admin.html', options);
            break; // end of admin user code
        default:
            navi.bringPageTop('page1.html', options);
            break; // end of page 1 for bases code
    }
}

//deprecated solution
/* function createOrUpdateAppdbEventDescription(eventDescription) {
    console.log(eventDescription);
    return appdb.get(eventDescription.dbName + '_eventDescription')
        .then(function (doc) {
            eventDescription._id = doc._id;
            eventDescription._rev = doc._rev;
            return appdb.put(eventDescription);

        }).catch(function (err) {
            console.log(err);
            if (err.status === 404) {
                eventDescription._id = eventDescription.dbName + '_eventDescription';
                return appdb.put(eventDescription);
            } else {
                console.log(err);
                err.message = 'unable to save event description on device';
                throw err;
            }
        });
} */

function addAppdbLoginDb(dbName) {
    console.log(dbName);
    return appdb.get('login_' + username)
        .then(function (doc) {
            if (doc.db === undefined) {
                doc.db = [dbName];
            } else if (doc.db.indexOf(dbName) === -1) {
                doc.db.push(dbName);
            }
            doc.currentDb = dbName;
            doc.timestamp = new Date().toISOString();
            return appdb.put(doc);
        }).catch(function (err) {
            if (err.status === 404) {
                return appdb.put({
                    _id: 'login_' + username,
                    db: [dbName],
                    currentDb: dbName,
                    timestamp: new Date().toISOString()
                });
            }
            console.log(err);
            err.message = 'issue saving event to device';
            throw err;
        });

}
/**
 * Check two arrays are identical
 * @param {any[]} arr1 array 1 authorative must be sorted
 * @param {any[]} arr2 array 2 comparative must be sorted
 * @param {boolean} outputDifferences true will output an array of differences. Any in arr1 not in arr2. False will output true or false if the arrays are different
 * output true if the same, false if different or the differences if requested
 */
function compareTwoArrays(arr1, arr2, outputDifferences) {
    if (outputDifferences) {
        return $(arr1).not(arr2).get();
    } else {

        if (arr1.length != arr2.length) {
            return false;
        }
        for (var i = 0, l = arr1.length; i < l; i++) {

            if (arr1[i] != arr2[i]) {
                return false;
            }
        }
        return true;
    }

}
/**
 * Takes an image element and finds the average pixel value
 * @param {element} imgEl 
 */
function getAverageRGB(imgEl) {

    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {
            r: 0,
            g: 0,
            b: 0
        }, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {
            r: 0,
            g: 0,
            b: 0
        },
        count = 0;

    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch (e) {
        /* security error, img on diff domain */
        return defaultRGB;
    }

    length = data.data.length;

    while ((i += blockSize * 4) < length) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i + 1];
        rgb.b += data.data[i + 2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);

    return rgb;

}
const BW_TRESHOLD = Math.sqrt(1.05 * 0.05) - 0.05;
const RE_HEX = /^(?:[0-9a-f]{3}){1,2}$/i;

function padz(str, len) {
    len = len || 2;
    return (new Array(len).join('0') + str).slice(-len);
}

function toObj(c) {
    return {
        r: c[0],
        g: c[1],
        b: c[2]
    };
}

function hexToRGB(hex) {
    if (hex.slice(0, 1) === '#') hex = hex.slice(1);
    if (!RE_HEX.test(hex)) throw new Error('Invalid HEX color.');
    // normalize / convert 3-chars hex to 6-chars.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    return [
        parseInt(hex.slice(0, 2), 16), // r
        parseInt(hex.slice(2, 4), 16), // g
        parseInt(hex.slice(4, 6), 16) // b
    ];
}

// c = String (hex) | Array [r, g, b] | Object {r, g, b}
function toRGB(c) {
    if (Array.isArray(c)) return c;
    return typeof c === 'string' ? hexToRGB(c) : [c.r, c.g, c.b];
}


function getLuminance(c) {
    let i, x;
    const a = []; // so we don't mutate
    for (i = 0; i < c.length; i++) {
        x = c[i] / 255;
        a[i] = x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function invertToBW(color, asArr) {
    return getLuminance(color) > BW_TRESHOLD ?
        (asArr ? [0, 0, 0] : '#000000') :
        (asArr ? [255, 255, 255] : '#ffffff');
}

function invert(color, bw) {
    color = toRGB(color);
    if (bw) return invertToBW(color);
    return '#' + color.map(c => padz((255 - c).toString(16))).join('');
}

invert.asRgbArray = (color, bw) => {
    color = toRGB(color);
    return bw ? invertToBW(color, true) : color.map(c => 255 - c);
};

invert.asRgbObject = (color, bw) => {
    color = toRGB(color);
    return toObj(bw ? invertToBW(color, true) : color.map(c => 255 - c));
};

//invert.asRgbObject(getAverageRGB(document.getElementById('loginEventLogo')),true);

/**
 * ons.ready function is the start of the script and runs only when OnsenUI has loaded
 * @event onsenui is ready 
 */
ons.ready(function () {

    console.log('ons-ready function fired');
    //make every device and webpage android styled for familiarity
    ons.forcePlatformStyling('android');
    // if the user has their phone set landscape on starting
    orientationLandscapeUpdate();
    // orientation event listener
    ons.orientation.on('change', function () {
        orientationUpdates();
    });



    // --- MENU CONTROLS ---
    /**
     * Opens the menu and adds the shadow on the right edge
     */
    function openMenu() {
        document.getElementById('menu').toggle();
        $('#menu').addClass('menuShadow');
    }
    /**
     *  closes the menu
     */
    function closeMenu() {
        document.getElementById('menu').toggle();
    }
    $(document).on("click", '.menuButton', function () {
        openMenu();
    })
    //listens to onsenui event for the splitter menu closing line 22815 of onsenui.js
    //removes the shadow when the menu closes
    $('#menu').on('postclose', function () {
        console.log('menu closed');
        $('#menu').removeClass('menuShadow');
    });

    // --- End of Menu Controls ---

    /**
     * First page to load code
     */

    // --- login function ---
    if (appdbConnected === false) {
        appdb = new PouchDB(appDatabaseName);
        appdbConnected = true;
    }
    //the user has an event they previously signed into and were in a previous db
    if (localStorage.previousSignIn === 'true' && lastDb != 'false') {

        appdb.get('login_' + username)
            .then(function (doc) {
                base = doc.base; //last base used
                name = doc.name; //the name used for the logs
                appdbConnected = true;
                var signInUrl = appServer + '/api/signin';
                var dataPackage = {
                    username: username,
                    password: password
                };
                return $.ajax(apiAjax(signInUrl, dataPackage))
                    .then(function (user) {
                        if (compareTwoArrays(user.user.roles.sort(), doc.db.sort(), false) === false) {
                            //updated db array with the authorative source from couchdb
                            doc.db = user.user.roles;

                            // doc.currentDb = lastDb;
                            appdb.put(doc)
                                .then(function (info) {
                                    return appdb.compact();
                                })
                                .catch(function (err) {
                                    console.log(err);
                                });
                            localStorage.db = JSON.stringify(doc.db); //need to return this info to login
                            var index = doc.db.indexOf(lastDb);
                            if (index > -1) {
                                console.log('dbs updated and last exists');
                                return doc;
                            } else {
                                var error = {
                                    status: 307,
                                    message: "last database does not match current user's databases"
                                }
                                console.log(error.message);
                                throw error;
                            }
                        } else {
                            console.log('dbs were the same');
                            return doc;
                        }
                    })
                    .catch(function (err) {
                        if (err.status === 307) {
                            throw err;
                        } else if (err.status === 401 && err.error === 'unauthorized') {
                            throw err;
                        } else {
                            return doc;
                        }

                    });

                // return doc; //previous return before ajax implimentation
            }).then(function (login) {
                console.log(login);
                // return appdb.get(login.currentDb + '_eventDescription')
                var db = new PouchDB(lastDb);
                return db.get('eventDescription')
                    .then(function (doc) {
                        console.log(doc);
                        doc.lastBase = login.base;
                        return doc;
                    }).catch(function (err) {
                        console.log(err);
                        throw err;
                    });
            })
            .then(function (doc) {

                //TODO ARC 20/09/2017 consider loginandrun function here passing data on
                var data = {
                    eventInfo: doc,
                    firstPage: true
                };
                if (doc.lastBase != undefined && doc.lastBase !== '' && doc.lastBase !== 'logOut') {
                    if (doc.lastBase === 0) {
                        var pageDestination = 'admin.html';
                    } else {
                        var pageDestination = 'page1.html';
                    }
                } else {
                    var pageDestination = 'loginPage.html';
                }

                return navi.bringPageTop(pageDestination, {
                    animation: pageChangeAnimation,
                    data: data
                });
            }).catch(function (err) {
                //error go to sign in screen
                console.log('going to sign in screen');
                console.log(err);
                return navi.bringPageTop('signInPage.html', {
                    animation: pageChangeAnimation
                });
            });

        //user didn't verify or create an event
        /*  } else if (localStorage.previousSignIn === 'true' && localStorage.verified === 'false' && localStorage.evtOrganiser === 'true') {
             navi.bringPageTop('verificationPage.html', {
                 animation: pageChangeAnimation
             }); */
        //user didn't create an event
        /*  } else if (localStorage.previousSignIn === 'true' && localStorage.verified === 'true' && localStorage.evtOrganiser === 'true' && lastDb === 'false') {
             navi.bringPageTop('createEventPage.html', {
                 animation: pageChangeAnimation
              */
        //});
        //all other options
    } else {
        //TODO put in else if for not verified and for a verified account that didnt create an event
        console.log('no previous sign in information');
        navi.bringPageTop('signInPage.html', {
            animation: pageChangeAnimation
        });
    }





    if (ons.platform.isWebView()) {

        /**
         * Event listener for going offline
         *@event offline - when the device to go offline (webView only)
         */
        document.addEventListener("offline", onOffline, false);
        /**
         * Offline event callback function
         */
        function onOffline() {
            // Handle the offline event
            $('.logTable').before('<div class="offlineMessage"><ons-icon icon="md-refresh-sync-alert"></ons-icon> Offline - sync to HQ will resume when online<div>');
            $('.offlineMap').html('Local Map - Offline');
        }
        /**
         * Event listener for device going back online
         * @event online - the device goes online (webView only)
         */
        document.addEventListener("online", onOnline, false);
        /**
         * Event following the return to being online
         */
        function onOnline() {
            // Handle the online event
            $('.offlineMessage').remove();
            $('.offlineMap').html('Local Map');


            //alert('congrats you are online, connected via: ' + checkConnection());

        }
    }

    /**
     * A function to show or hide the progress bar
     * @param {boolean} trueOrFalse 
     */
    function showProgressBar(page, trueOrFalse) {
        switch (trueOrFalse) {
            case true:
                $('#' + page + ' .progressBar').removeClass('hide');
                break;
            case false:
                $('#' + page + ' .progressBar').addClass('hide');
                break;
        }
    }
    /**
     * Checks that the doc is up to date and will update if required
     * @param {string} event the name of the local and remote db to update
     * @param {string[]} doc_ids the doc to update
     * @param {boolean} replicateToRemote defines whether the replication is to the remote (true) or from the remote db (false)
     * @returns {boolean} true for an update, false already up to date
     */
    function replicateOnce(event, doc_ids, replicateToRemote) {
        if (!replicateToRemote) {
            //replicating to local event db
            var db2 = new PouchDB(event); //local
            var db1 = new PouchDB(http + username + ':' + password + '@' + couchdb + '/' + event); //remote
        } else {
            //replicating to remote event db
            var db1 = new PouchDB(event); //local
            var db2 = new PouchDB(http + username + ':' + password + '@' + couchdb + '/' + event); //remote
        }
        var options = {
            doc_ids: doc_ids
        };

        return db1.replicate.to(db2, options)
            .then(function (info) {
                console.log(info)
                if (info.docs_written > 0) {
                    console.log('event Description for ' + event + ' updated');
                    return true;
                } else {
                    console.log('event Description for ' + event + ' was up to date');
                    return false;
                }
            }).catch(function (err) {
                console.log('there was an error');
                console.log(err);
                throw err;
            });
    }
    /**
     * Gets the event logo and updates the image container with that src
     * @param {object} eventInfo the page's eventInfo object 
     * @param {string} url 
     */
    function eventLogoGetter(eventInfo, url) {
        console.log(url);
        if (url != undefined) {
            return url;
        }
        if (eventInfo._attachments != undefined) {
            //code below required to get attachments and create url for img
            if (eventInfo._attachments.evtLogo != undefined) {
                console.log('getting attachment');
                var tempdb = new PouchDB(eventInfo.dbName);
                return tempdb.getAttachment('eventDescription', 'evtLogo')
                    .then(function (blob) {
                        console.log(blob);
                        return URL.createObjectURL(blob);
                    }).catch(function (err) {
                        console.log('issue loading evtLogo image');
                        console.log(err);
                        return undefined;
                    });
            }
        }

    }



    //commented out for dev
    /*navi.insertPage(0, 'map.html').then(function () {
        createMap();
    });*/


    // ---  page change code ---
    /**
     * Very important section as this defines what happens when a page changes and when certain pages are loaded
     * @event postpush - when a page is changed or pushed
     */
    document.addEventListener('postpush', function (event) {
        console.log('page pushed ' + navi.topPage.name);
        console.log(navi.pages);
        switch (navi.topPage.name) {
            //--- Create Event Page ---
            case 'signInPage.html':
                if (username != undefined) {
                    $('#signInUserName').val(changeAtSymbolBack(username));
                }

                if (!$('.signUpButton').hasClass('evtHandler')) {
                    $('.signUpButton').addClass('evtHandler').on('click', function () {
                        navi.bringPageTop('signUpPage.html', {
                            animation: pageChangeAnimation
                        });
                    });
                }
                if (!$('#signInPassword').hasClass('evtHandler')) {
                    $('#signInPassword').addClass('evtHandler').on('keyup', function (e) {
                        var key = e.which;
                        // enter key is 13
                        if (key === 13) {
                            e.preventDefault();
                            $('.signInButton').click();

                        }
                    });
                }

                //TODO this button Needs lots of work ARC 20/09/2017
                if (!$('.signInButton').hasClass('evtHandler')) {
                    $('.signInButton').addClass('evtHandler').on('click', function () {
                        showProgressBar('signInPage', true);
                        username = changeAtSymbol($('#signInUserName').val().trim());
                        password = $('#signInPassword').val().trim();

                        //TODO sign in via server
                        var signInUrl = appServer + '/api/signin';
                        var dataPackage = {
                            username: username,
                            password: password
                        };
                        $.ajax(apiAjax(signInUrl, dataPackage))
                            .then(function (doc) {
                                console.log('sign in sent back status: ' + doc.status);
                                if (doc.status === 200) {
                                    console.log(doc);
                                    if (typeof (localStorage) !== undefined) {
                                        localStorage.couchdb = doc.couchdb;
                                        localStorage.http = doc.http;
                                        localStorage.username = username;
                                        localStorage.password = password;
                                        localStorage.db = JSON.stringify(doc.user.roles);
                                        localStorage.previousSignIn = true;
                                        if (doc.user.metadata !== undefined) {
                                            localStorage.evtOrganiser = doc.user.metadata.evtOrganiser;
                                            if (doc.user.metadata.verification != undefined) {
                                                localStorage.verified = doc.user.metadata.verification.verified;
                                            }
                                        }
                                    }

                                    couchdb = doc.couchdb;
                                    http = doc.http;
                                    //var db is the authority on which databases the user should have event descriptions for
                                    db = doc.user.roles;
                                    console.log(db);
                                    //TODO pick up here Adam 12/09/2017 need to draw user path to when they connect to the databases via the different user paths
                                    //need to do the whole getting of the event information
                                    var timestamp = new Date().toISOString();
                                    return appdb.get('login_' + username)
                                        .then(function (login) {
                                            login.db = db;
                                            login.timestamp = timestamp;
                                            login.http = http;
                                            login.couchdb = couchdb;
                                            //update 'login' info
                                            return appdb.put(login)
                                                .then(function (info) {
                                                    return doc;
                                                })
                                                .catch(function (err) {
                                                    console.log(err);
                                                    throw err;
                                                });
                                        })
                                        .catch(function (err) {
                                            console.log(err);
                                            //if no 'login' doc
                                            if (err.status === 404) {
                                                console.log('no login doc, creating one');
                                                var putDoc = {
                                                    _id: 'login_' + username,
                                                    db: db,
                                                    timestamp: timestamp,
                                                    http: http,
                                                    couchdb: couchdb
                                                };
                                                //create a 'login' doc
                                                return appdb.put(putDoc)
                                                    .then(function (info) {
                                                        if (info.ok) {
                                                            return doc;
                                                        }
                                                    }).catch(function (err) {
                                                        console.log(err);
                                                    });
                                            } else {
                                                throw err;
                                            }
                                        });
                                } else {
                                    throw doc;
                                }
                            }).then(function (doc) {
                                console.log(doc);
                                return Promise.all(db.map(function (event) {
                                    return replicateOnce(event, ['eventDescription'], false);

                                })).then(function (info) {
                                    console.log(info);
                                    return doc.user.metadata;
                                }).catch(function (err) {
                                    throw err;
                                });



                                //05/10/2017 pick up here, need to test this works for 2 or more databases and then feed information through to the other pages
                                //NEED TO DEFINE THE INFORMATION PASSED TO EACH PAGE, MIGHT NEED TO MAKE A FUNCTION OF THE INITIAL LOG IN
                            }).then(function (doc) {
                                console.log('got down to here');
                                console.log(doc);
                                var page;
                                Promise.resolve().then(function () {
                                    if (doc.evtOrganiser && doc.verification.verified || !doc.evtOrganiser) {
                                        switch (db.length) {
                                            case 1:
                                                page = 'loginPage.html';
                                                var tempdb = new PouchDB(db[0]);
                                                return tempdb.get('eventDescription')
                                                    .then(function (event) {

                                                        localStorage.lastDb = event.dbName;
                                                        lastDb = event.dbName;
                                                        remotedbURL = http + username + ':' + password + '@' + couchdb + '/' + lastDb;
                                                        return {
                                                            eventInfo: event
                                                        };

                                                    })
                                                    .catch(function (err) {
                                                        console.log(err);
                                                        throw err;
                                                    });

                                                break;
                                            case 0:
                                                if (doc.evtOrganiser) {
                                                    page = 'createEventPage.html';
                                                    return false;
                                                } else {
                                                    ons.notification.alert({
                                                        title: 'This event has finished',
                                                        message: 'The events associated with these log in details have finished',
                                                        cancelable: true
                                                    });
                                                    page = 'signInPage.html';
                                                    return false;

                                                }
                                                break;

                                            default:
                                                if (lastDb != 'false' && lastDb != undefined) {
                                                    page = 'loginPage.html';
                                                    var event = db.indexOf(lastDb);
                                                    if (event > -1) {
                                                        var tempdb = new PouchDB(db[event]);
                                                        return tempdb.get('eventDescription')
                                                            .then(function (event) {

                                                                lastDb = event.dbName;
                                                                remotedbURL = http + username + ':' + password + '@' + couchdb + '/' + lastDb;
                                                                return {
                                                                    eventInfo: event
                                                                };

                                                            })
                                                            .catch(function (err) {
                                                                console.log(err);
                                                                throw err;
                                                            });
                                                    }
                                                } else {
                                                    page = 'eventSelectionPage.html';
                                                    return {
                                                        db: db
                                                    };
                                                }
                                                break;
                                        }
                                    } else {
                                        page = 'verificationPage.html';
                                        return false;
                                    }
                                }).then(function (data) {
                                    console.log(data);
                                    if (data === false) {
                                        var options = {
                                            animation: pageChangeAnimation
                                        }
                                    } else {
                                        var options = {
                                            animation: pageChangeAnimation,
                                            data: data
                                        }
                                        return navi.resetToPage(page, options);
                                    }
                                    return navi.bringPageTop(page, options);
                                }).catch(function (err) {
                                    console.log(err);
                                    throw err;
                                });
                            })
                            .catch(function (err) {
                                $('#signInPage .progressBar').addClass('hide');
                                console.log(err);
                                if (err.status === 401) {
                                    return ons.notification.alert({
                                        title: err.error,
                                        messageHTML: "<p>" + err.message + "</p><p>Be aware that both your username and password are case sensitive.</p>",
                                        cancelable: true
                                    });
                                } else {
                                    console.log('no response from sign in');
                                }
                                if (err.status === 404 & err.title === 'Event information not found on server') {
                                    //Not sure whether it needs to remove the db so it can move on might need to check if it is an event organiser or not
                                    //will need to remove databases from roles when databases are deleted
                                    /* return ons.notification.alert({
                                         title: 'Event information not found on server',
                                         message: 'Please contact the event organiser or support',
                                         cancelable: true
                                     }); */
                                    return false;
                                }

                                var connection;
                                if (ons.platform.isWebView()) {
                                    connection = checkConnection();
                                }
                                console.log("current connection: " + connection);
                                switch (connection) {
                                    case "none":
                                        console.log(connection);
                                        return ons.notification.alert({
                                            title: 'Error',
                                            message: "Couldn't connect to server because this device is offline.",
                                            cancelable: true
                                        });
                                        break;
                                    default:
                                        return ons.notification.alert({
                                            title: 'Error',
                                            message: "Couldn't connect to server, please try again later.",
                                            cancelable: true
                                        });
                                }


                            });
                    });
                }


                break;

                // --- sign up page ---
            case 'signUpPage.html':
                var errorMessageOpen = false;
                var emailSignUp = false;
                var emailSignUpValid = false;
                var passwordSignUp = false;
                var confirmPassSignUp = false;

                if (!$('#signUpEmail').hasClass('evtHandler')) {
                    var lastUsername = '';
                    $('#signUpEmail').addClass('evtHandler').on('blur', function () {
                        // finds the input from within the ons-input element
                        var inpObj = document.getElementById('signUpEmail').getElementsByTagName('input');
                        //checks if the input is currently valid before checking if it is unique in the db
                        if ($(inpObj)[0].checkValidity()) {
                            var checkUsernameApi = appServer + '/api/user/checkusername';
                            var usernameToTest = changeAtSymbol($('#signUpEmail').val().trim());
                            var usernameDataPackage = {
                                "username": usernameToTest
                            };
                            if (usernameToTest != lastUsername && usernameToTest != "") {
                                $.ajax(apiAjax(checkUsernameApi, usernameDataPackage))
                                    .then(function (response) {
                                        switch (response.status) {
                                            case 200:
                                                emailSignUp = usernameToTest;
                                                emailSignUpValid = true;
                                                break;
                                            case 409:
                                                if (!errorMessageOpen) {
                                                    errorMessageOpen = true;
                                                    ons.notification.alert({
                                                        title: response.message,
                                                        message: response.reason,
                                                        cancelable: true
                                                    }).then(function () {
                                                        errorMessageOpen = false;
                                                    });
                                                }
                                                break;
                                            case 500:
                                            default:
                                                if (!errorMessageOpen) {
                                                    errorMessageOpen = true;
                                                    ons.notification.alert({
                                                        title: 'error',
                                                        message: 'issue validating email address is unique',
                                                        cancelable: true
                                                    }).then(function () {
                                                        errorMessageOpen = false;
                                                    });
                                                }
                                        }
                                    }).catch(function (err) {
                                        console.log(err);
                                        if (!errorMessageOpen) {
                                            errorMessageOpen = true;
                                            ons.notification.alert({
                                                title: 'Error connecting to server',
                                                message: 'We are very sorry there was an error connecting to the server to validate your email address is unique please try submitting your sign up or come back later.',
                                                cancelable: true
                                            }).then(function () {
                                                errorMessageOpen = false;
                                            });
                                        }
                                    });
                            }
                            lastUsername = usernameToTest;
                        } else {
                            if (!errorMessageOpen) {
                                errorMessageOpen = true;
                                emailSignUpValid = false;
                                ons.notification.alert({
                                    title: 'Invalid email',
                                    message: 'Please enter a valid email address like: event@hikemanager.com',
                                    cancelable: true
                                }).then(function () {
                                    errorMessageOpen = false;
                                });
                            }
                        }
                    });

                }
                if (!$('#signUpPassword').hasClass('evtHandler')) {
                    $('#signUpPassword').addClass('evtHandler').on('blur', function () {
                        var pass = $(this).val().trim();
                        if (pass.length >= 6) {
                            //valid
                            if (passwordSignUp != pass) {
                                passwordSignUp = pass;
                                if (pass === $('#signUpPasswordConfirm').val()) {
                                    confirmPassSignUp = true;
                                } else {
                                    confirmPassSignUp = false;
                                }
                            }

                        } else {
                            //invalid
                            passwordSignUp = pass;
                            if (!errorMessageOpen) {
                                errorMessageOpen = true;
                                ons.notification.alert({
                                    title: 'Longer password required',
                                    message: 'Minimum of 6 characters',
                                    cancelable: true
                                }).then(function () {
                                    errorMessageOpen = false;
                                });
                            }
                        }
                    });
                }
                if (!$('#signUpPasswordConfirm').hasClass('evtHandler')) {
                    $('#signUpPasswordConfirm').addClass('evtHandler').on('blur', function () {
                        var confirmP = $(this).val().trim();
                        if (confirmP === passwordSignUp && passwordSignUp != '') {
                            //valid
                            if (passwordSignUp.length >= 6) {
                                confirmPassSignUp = true;
                            } else {
                                if (!errorMessageOpen) {
                                    errorMessageOpen = true;
                                    ons.notification.alert({
                                        title: 'Longer password required',
                                        message: 'Minimum of 6 characters',
                                        cancelable: true
                                    }).then(function () {
                                        errorMessageOpen = false;
                                    });
                                }
                            }
                        } else {
                            //invalid
                            if (confirmP === '' && passwordSignUp === false) {
                                errorMessageOpen = true;
                                ons.notification.alert({
                                    title: 'Please enter a password',
                                    messageHTML: 'Please enter a password to confirm',
                                    cancelable: true
                                }).then(function () {
                                    errorMessageOpen = false;
                                });
                            } else {
                                confirmPassSignUp = false;
                                if (!errorMessageOpen) {
                                    errorMessageOpen = true;
                                    ons.notification.alert({
                                        title: 'Password does not match',
                                        messageHTML: 'Your passwords do not match',
                                        cancelable: true
                                    }).then(function () {
                                        errorMessageOpen = false;
                                    });
                                }
                            }
                        }
                    }).on('keyup', function (e) {
                        var key = e.which;
                        // enter key is 13
                        if (key === 13) {
                            e.preventDefault();
                            $('.signUpInputButton').click();
                        }
                    });
                }
                if (!$('.signUpInputButton').hasClass('evtHandler')) {
                    $('.signUpInputButton').addClass('evtHandler').on('click', function () {
                        switch (emailSignUpValid && confirmPassSignUp) {
                            case true:
                                var apiAddress = appServer + '/api/user/new';
                                var createUserDataPackage = {
                                    "username": emailSignUp,
                                    "password": passwordSignUp,
                                    "evtOrganiser": true
                                };
                                $.ajax(apiAjax(apiAddress, createUserDataPackage))
                                    .then(function (doc) {
                                        console.log(doc);
                                        switch (doc.status) {
                                            case 200:
                                                navi.replacePage('verificationPage.html');
                                                //store username & password as accessable variables
                                                username = emailSignUp;
                                                password = passwordSignUp;
                                                if (typeof (localStorage) !== undefined) {
                                                    //localstorage available save username and password for next time
                                                    localStorage.username = emailSignUp;
                                                    localStorage.password = passwordSignUp;
                                                    localStorage.verified = false;
                                                    localStorage.evtOrganiser = true;
                                                    localStorage.previousSignIn = true;
                                                }
                                                break;

                                            default:
                                                ons.notification.alert({
                                                    title: 'error',
                                                    message: "Something has gone wrong that isn't your fault please contact support",
                                                    cancelable: true
                                                });
                                        }

                                    }).catch(function (err) {
                                        console.log(err);
                                        ons.notification.alert({
                                            title: 'error',
                                            message: 'error: ' + err.toString(),
                                            cancelable: true
                                        });
                                    });
                                break;
                            case false:
                                var signUpErrorMessage = '<p>Please complete the following:</p>';
                                if (emailSignUpValid === false) {
                                    signUpErrorMessage = signUpErrorMessage + '<p>Enter a email</p>';
                                }
                                if (confirmPassSignUp === false) {
                                    signUpErrorMessage = signUpErrorMessage + '<p>Enter and confirm your password</p>';
                                }
                                ons.notification.alert({
                                    title: 'Missing fields',
                                    messageHTML: signUpErrorMessage,
                                    cancelable: true
                                });
                                break;

                        }
                    });
                }
                break;
            case 'verificationPage.html':
                if (!($('#verificationCode').hasClass('evtHandler'))) {
                    $('#verificationCode').addClass('evtHandler').on('keyup', function (e) {
                        var key = e.which;
                        // enter key is 13
                        if (key === 13) {
                            e.preventDefault();
                            $('#verifyAccountButton').click();
                        }
                    });
                }
                if (!($('#verifyAccountButton').hasClass('evtHandler'))) {
                    $('#verifyAccountButton').addClass('evtHandler').on('click', function () {
                        var verificationCheckAPI = appServer + '/api/user/verify';
                        var verificationDataPackage = {
                            username: localStorage.username,
                            token: $('#verificationCode').val().trim()
                        }
                        if (verificationDataPackage.token != '') {
                            $.ajax(apiAjax(verificationCheckAPI, verificationDataPackage))
                                .then(function (doc) {
                                    switch (doc.status) {
                                        case 200:
                                            navi.replacePage('createEventPage.html');
                                            if (typeof (localStorage) !== undefined) {
                                                //localstorage available save username and password for next time
                                                localStorage.verified = true;
                                            }
                                            break;
                                        case 401:
                                            ons.notification.alert({
                                                title: 'Incorrect code',
                                                message: "This code does not match your user account, please check you entered it correctly.",
                                                cancelable: true
                                            });
                                            break;
                                        case 500:
                                            ons.notification.alert({
                                                title: 'Error',
                                                message: doc.err.toString(),
                                                cancelable: true
                                            });
                                            break;
                                    }
                                })
                                .catch(function (err) {
                                    console.log(err);
                                    ons.notification.alert({
                                        title: 'Error sending verification code',
                                        message: 'failed to send verification code because of: ' + err.toString(),
                                        cancelable: true
                                    });
                                });
                        }
                    });
                }
                if (!($('#resendVerificationCode').hasClass('evtHandler'))) {
                    $('#resendVerificationCode').addClass('evtHandler').on('click', function () {
                        var url = appServer + '/api/user/resendverification';
                        var dataPackage = {
                            username: username
                        };
                        $.ajax(apiAjax(url, dataPackage))
                            .then(function (doc) {
                                ons.notification.alert({
                                    title: 'Email sent',
                                    message: 'Your new verification email has been sent',
                                    cancelable: true
                                });
                            }).catch(function (err) {
                                ons.notification.alert({
                                    title: 'Error',
                                    message: 'There was an issue re-sending your verification email, please try again',
                                    cancelable: true
                                });
                            });
                    });
                }
                //need to add a resend email function
                break;
            case 'createEventPage.html':

                //variables
                var evtUsernameUnique = false;
                var passwordObject = {};
                var passwordArray = [];
                var editEvent = false;
                var baseCount = 1;
                var pageData = navi.topPage.data;
                var getFile = false;
                var passwordsOk;
                var url;

                //functions
                /**
                 * function to check if the password is unique
                 * @param {*} thisPass 
                 */
                function passwordCheck(thisPass) {
                    //variables
                    var passElement = $(thisPass);
                    var pass = $(thisPass).val();
                    var index;
                    var error;
                    //function code
                    //check the password has a value
                    if (pass != '') {
                        //check if password is in the array of passwords
                        index = passwordArray.indexOf(pass);
                        if (index > -1) {
                            error = false;
                            //need to check if the password is being used by the current base in which case there is no issue otherwise it is an error
                            if (passwordObject[thisPass.id] != undefined) {

                                // if it has changed there is an issue otherwise do nothing
                                if (passwordObject[thisPass.id] != pass) {
                                    error = true;
                                    var basePassIndex = passwordArray.indexOf(passwordObject[thisPass.id]);
                                    passwordArray.splice(basePassIndex, 1);
                                    delete passwordObject[thisPass.id];
                                }
                            } else {
                                // error trying to use the same password for two bases
                                error = true;
                            }
                            if (error) {
                                ons.notification.alert({
                                    title: 'Password Error',
                                    message: 'The admin and base passwords must be unique.',
                                    cancelable: true
                                }).then(function () {
                                    passElement.val('');

                                });
                            }
                        } else {
                            if (passwordObject[thisPass.id] != undefined) {

                                // if it has changed, remove old password and update with new
                                if (passwordObject[thisPass.id] != pass) {
                                    var basePassIndex = passwordArray.indexOf(passwordObject[thisPass.id]);
                                    passwordArray.splice(basePassIndex, 1);
                                    passwordObject[thisPass.id] = pass;
                                    passwordArray.push(pass);
                                }
                            } else {
                                //no previous password for the base or usage of the password.
                                //update the password array and object
                                passwordArray.push(pass);
                                passwordObject[thisPass.id] = pass;
                            }
                        }
                    } else {
                        if (passwordObject[thisPass.id] != undefined) {
                            console.log('6');
                            // if it has changed there is an issue otherwise do nothing
                            if (passwordObject[thisPass.id] != pass) {
                                var basePassIndex = passwordArray.indexOf(passwordObject[thisPass.id]);
                                passwordArray.splice(basePassIndex, 1);
                                delete passwordObject[thisPass.id];
                            }
                        }
                    }
                    console.log(passwordArray);
                    console.log(passwordObject);
                }
                /**
                 * a function to update the event banner based upon a file upload
                 * @param {object} inputFile needs to be found using plain js
                 * @returns {string} returns a url promise
                 */
                function fileUpload(inputFile) {
                    return new Promise(function (resolve, reject) {
                        //make file into a blob
                        getFile = inputFile.files[0]; //getFile is a blob
                        url = URL.createObjectURL(getFile); //create URL from the blob
                        console.log(url);
                        resolve(url);
                    });
                }
                /**
                 * a function to downscale an image
                 * @param {object} imgEl img element if JQuery must be JQuery[0] or other value in the array if using classes
                 * @param {number} maxWidth the maximum width the image can be
                 * @param {number} maxHeight the maximum height the image can be
                 * @returns {object | boolean} returns false if the image is already small enough, else it will return the dimensions the image will be downscaled to
                 */

                /**
                 * Downscales an image in steps so that the quality is maintained
                 * https://stackoverflow.com/questions/19262141/resize-image-with-javascript-canvas-smoothly
                 * http://jsfiddle.net/180nssw2/
                 * @param {object} img javascript object (not JQuery) that contains a single image best using an #id
                 * @param {*} width target width
                 * @param {*} step how much to scale down default = 0.5
                 */

                /**
                 * function to add a base before the add base button
                 * @param {number|string} baseCount 
                 */
                function addBase(baseCount) {
                    return $('.addBaseButton').before(
                        `
                                        <div>
                                            <p class="txtLeft bold marginTop">Base ` + baseCount + `</p>
                                            <ons-input id="base` + baseCount + `Name" modifier="underbar" placeholder="Base name or location" float type="text" class="fullWidthInput"></ons-input>
                                            <div class="flex flexRow flexSpaceBetween marginTop">
                                                <div class="caption"><span class="bold">Maximum score available</span>
                                                    <span class="caption marginLeft">(blank = no score input)</span>
                                                </div>
                                            <ons-input id="base` + baseCount + `MaxScore" modifier="underbar" placeholder="Max score" float type="number" class="baseMaxScore" required></ons-input>
                                            </div>
                                            <div class="flex flexRow flexSpaceBetween marginTop basePasswordShowHide">
                                                <div class="caption bold">Base password *</div>
                                                    <ons-input id="base` + baseCount + `Password" modifier="underbar" placeholder="Password" float type="text" class="basePassword eventPassword" required></ons-input>
                                                </div>
                                            <textarea class="textarea marginTop" id="base` + baseCount + `Instructions" placeholder="Base specific instructions" style="width: 100%; height:45px;"></textarea>
                                        </div>
                                    `
                    );
                }
                /**
                 * a function to show or hide the password inputs
                 * @param {Bool} trueOrFalse 
                 */
                function hidePasswordEntry(trueOrFalse) {
                    switch (trueOrFalse) {
                        //hides the password input
                        case true:
                            $('.basePasswordShowHide').addClass('hide');
                            break;
                        case false:
                            $('.basePasswordShowHide').removeClass('hide');
                            break;
                    }
                }
                /**
                 * creates the eventDescription variable in the higher scope
                 */
                function createEventDescription() {
                    eventDescription = {
                        _id: 'eventDescription',
                        eventName: $('#eventName').val().trim(),
                        dateStart: $('#eventStartDate').val(),
                        dateEnd: $('#eventEndDate').val(),
                        eventDescription: $('#eventDescription').val().trim(),
                        passwordProtectLogs: $('#passwordSwitch').prop("checked"),
                        logOffRoute: $('#offRouteLogsSwitch').prop("checked"),
                        adminPassword: $('#adminPassword').val(),
                        evtUsername: $('#evtUsername').val(),
                        bases: [{
                            baseNo: 0,
                            baseName: 'admin HQ',
                            basePassword: $('#adminPassword').val().trim()
                        }]
                    };
                }
                /**
                 * Adds the bases to the general event description
                 * @param {number} baseCount the number of bases to loop over
                 * @param {boolean} passwordProtectLogs true or false whether the bases will have a password upon entry
                 * @param {object} eventDescription event description to add the base information to
                 */
                function addBasesToEvtDescription(baseCount, passwordProtectLogs, eventDescription) {
                    for (var i = 1, l = baseCount + 1; i < l; i++) {

                        var baseInfo = {
                            baseNo: i,
                            baseMaxScore: $('#base' + i + 'MaxScore').val(),
                            basePassword: $('#base' + i + 'Password').val().trim(),
                            baseInstructions: $('#base' + i + 'Instructions').val().trim()
                        };
                        var bName = $('#base' + i + 'Name').val().trim();
                        if (bName === '' || bName === undefined) {
                            bName = i;
                        }
                        baseInfo.baseName = bName;
                        passwordsOk = false;
                        //Check if password protection is on, then if a base password is not set bring up the error messaging and stop saving the event
                        if (passwordProtectLogs && baseInfo.basePassword === '') {
                            return ons.notification.alert({
                                title: 'Missing Password',
                                message: "Check each base has a password and that the admin password is set, else if passwords are not required turn off the 'Password protect base logs' switch.",
                                cancelable: true
                            }).then(function () {
                                showProgressBar('createEventPage', false);
                                return false;
                            });

                            break;
                            console.log('shouldnt see me');
                        } else {
                            eventDescription.bases.push(baseInfo);
                            passwordsOk = true;
                        }
                    }
                    return passwordsOk;
                }


                //Normal code to run
                if (pageData.edit === true) {
                    if (pageData.eventInfo != undefined) {
                        editEvent = true;
                        $('#createEventPage .center').html('Edit Event');
                        var eventInfo = pageData.eventInfo;
                        $('#eventName').val(eventInfo.eventName);
                        $('#eventStartDate').val(eventInfo.dateStart);
                        $('#eventEndDate').val(eventInfo.dateEnd);
                        $('#eventDescription').val(eventInfo.eventDescription);
                        $('#passwordSwitch').prop("checked", eventInfo.passwordProtectLogs);
                        $('#offRouteLogsSwitch').prop("checked", eventInfo.logOffRoute);
                        $('#adminPassword').val(eventInfo.adminPassword);
                        $('#evtUsername').val(eventInfo.evtUsername).prop('disabled', true);
                        //base handling
                        eventInfo.bases.forEach(function (base) {
                            var password = base.basePassword;
                            var id = 'base' + base.baseNo;
                            var baseNo = base.baseNo;
                            if (password != '') {
                                //add password to password array for checking against
                                passwordArray.push(password);
                            }
                            if (baseNo > 0) {
                                //normal base                               
                                if (baseNo > 1) {
                                    //first add base if not already included
                                    addBase(baseNo);
                                    baseCount = baseNo;
                                }
                                if (password != '') {
                                    passwordObject[id + 'Password'] = password;
                                    $('#' + id + 'Password').val(password);
                                }
                                $('#' + id + 'Name').val(base.baseName);
                                $('#' + id + 'MaxScore').val(base.baseMaxScore);
                                $('#' + id + 'Instructions').val(base.baseInstructions);

                            } else {
                                //admin base
                                passwordObject.adminPassword = password;
                            }
                        });
                        console.log(baseCount);
                        var imageContainer = $('#eventBannerImage');
                        Promise.resolve().then(function () {
                            return eventLogoGetter(eventInfo, url);
                        }).then(function (src) {
                            if (src != undefined) {
                                imageContainer.hide().attr('src', src).fadeIn(1500);
                                url = src;
                            } else {
                                imageContainer.hide().fadeIn(1500);
                            }
                        }).catch(function (err) {
                            console.log(err);
                        });
                        //lastly update whether password entries show or not
                        hidePasswordEntry(!eventInfo.passwordProtectLogs);
                    }
                }
                //Other Event Handlers
                //Change image
                if (!$('#eventBanner').hasClass('evtHandler')) {
                    var inputFile = document.querySelector('#eventBanner');
                    $('#eventBanner').addClass('evtHandler')
                        .on('change', function () {
                            var imgEl = $('#eventBannerImage');
                            Promise.resolve().then(function () {
                                console.log('file upload');
                                return fileUpload(inputFile);
                            }).then(function (url) {
                                return imgEl.attr('src', url);
                            }).catch(function (err) {
                                console.log(err);
                            });
                        });
                }

                // Password Protect Logs switch
                if (!($('.passwordProtectLogs').hasClass('evtHandler'))) {
                    $('.passwordProtectLogs').addClass('evtHandler').on('click', function () {
                        var passwordSwitch = $('#passwordSwitch');
                        switch (passwordSwitch.prop("checked")) {
                            //changes the switch and hides the password input
                            case true:
                                passwordSwitch.prop('checked', false);
                                $('.basePasswordShowHide').addClass('hide');
                                break;
                            case false:
                                passwordSwitch.prop('checked', true);
                                $('.basePasswordShowHide').removeClass('hide');
                                break;
                        }
                    });
                }

                if (!($('#passwordSwitch').hasClass('evtHandler'))) {
                    $('#passwordSwitch').addClass('evtHandler').on('change', function () {
                        hidePasswordEntry(!$('#passwordSwitch').prop("checked"));
                    });
                }

                if (!($('#createEventForm').hasClass('evtHandlerPassword'))) {
                    $('#createEventForm').addClass('evtHandlerPassword').find('.eventPassword').on('blur', function () {
                        passwordCheck(this);
                    });

                }
                if (!($('#offRouteLogs').hasClass('evtHandler'))) {
                    $('#offRouteLogs').addClass('evtHandler');
                    $('.offRouteLogs').on('click', function () {
                        switch ($('#offRouteLogsSwitch').prop("checked")) {
                            case true:
                                $('#offRouteLogsSwitch').prop('checked', false);
                                break;
                            case false:
                                $('#offRouteLogsSwitch').prop('checked', true);
                        }
                    });
                }
                if (!($('#evtUsername').hasClass('evtHandler'))) {
                    $('#evtUsername').addClass('evtHandler').on('blur', function () {

                        var evtUsername = $('#evtUsername').val().trim();
                        if (evtUsername != '') {
                            var apiAddress = appServer + '/api/user/checkusername';
                            var evtUsernameToTest = {
                                username: evtUsername
                            }
                            $.ajax(apiAjax(apiAddress, evtUsernameToTest))
                                .then(function (doc) {
                                    switch (doc.status) {
                                        case 200:
                                            evtUsernameUnique = true;
                                            break;
                                        case 409:

                                            ons.notification.alert({
                                                title: doc.message,
                                                message: doc.reason,
                                                cancelable: true
                                            });

                                            break;
                                        case 500:
                                        default:

                                            ons.notification.alert({
                                                title: 'error',
                                                message: 'issue checking username is unique',
                                                cancelable: true
                                            });

                                    }
                                }).catch(function (err) {
                                    console.log(err);

                                    ons.notification.alert({
                                        title: 'error',
                                        message: 'issue checking username is unique',
                                        cancelable: true
                                    });

                                });
                        }
                    });
                }
                var addBaseButton = $('.addBaseButton');
                if (!(addBaseButton.hasClass('evtHandler'))) {
                    addBaseButton.addClass('evtHandler')
                        .on('click', function () {
                            baseCount++;
                            addBase(baseCount);
                            //hides the password input if the password switch is deselected
                            if (!$('#passwordSwitch').prop("checked")) {
                                $('.basePasswordShowHide').addClass('hide');

                            }
                            //scrolls to the bottom of the page
                            var offset = 1370 + baseCount * (181);
                            var page = $('#createEventPage .page__content');
                            page.animate({
                                scrollTop: offset
                            }, 1000);
                            //adds the password check event handler to the added base
                            $('#base' + baseCount + 'Password').on('blur', function () {
                                passwordCheck(this);
                            });
                        });
                }

                if (!$('#saveEvent').hasClass('evtHandler')) {
                    $('#saveEvent').addClass('evtHandler').on('click', function () {
                        //TODO add checking and uploading event message
                        //TODO add loading bar
                        if (!editEvent) {
                            showProgressBar('createEventPage', true);
                            createEventDescription();
                            if (getFile != false) {

                                var logo = document.getElementById('eventBannerImage');
                                Promise.resolve().then(function () {
                                    return downscaleImg(logo, 1922, 240);
                                }).then(function (doc) {
                                    console.log(doc);
                                    if (doc != false) {
                                        return stepped_scale(logo, doc.width, 0.5);
                                    }
                                    return false;
                                }).then(function (doc) {
                                    if (doc != false) {
                                        return getFile = doc;
                                    }
                                    return getFile;
                                }).then(function (img) {
                                    return eventDescription._attachments = {
                                        evtLogo: {
                                            data: img,
                                            content_type: img.type
                                        }
                                    };

                                }).catch(function (err) {
                                    console.log(err);
                                });
                            }

                            switch (eventDescription.eventName === '' || eventDescription.dateStart === '' || eventDescription.dateEnd === '' || eventDescription.adminPassword === '' || eventDescription.evtUsername === '') {
                                case true:
                                    ons.notification.alert({
                                        title: 'Missing attributes',
                                        messageHTML: '<p>An event requires the following information:</p><p>A name</p></p><p>Start and end date</p></p><p>An admin password</p><p>An event username</p>'
                                    }).then(function () {
                                        return showProgressBar('createEventPage', false);
                                    });
                                    console.log(eventDescription);
                                    break;
                                case false:
                                    if (evtUsernameUnique) {
                                        if (addBasesToEvtDescription(baseCount, eventDescription.passwordProtectLogs, eventDescription)) {
                                            var apiAddress = appServer + '/api/event/new';
                                            var eventCreationData = {
                                                username: username,
                                                password: password,
                                                eventName: eventDescription.eventName,
                                                evtUsername: eventDescription.evtUsername
                                            };
                                            //TODO add done and fail and authentication to the request
                                            $.ajax(apiAjax(apiAddress, eventCreationData))
                                                .then(function (doc) {
                                                    console.log(doc);
                                                    if (localStorage.db !== undefined) {
                                                        var dbs = JSON.parse(localStorage.db);
                                                        dbs.push(doc.dbName);
                                                        localStorage.db = JSON.stringify(dbs);
                                                    } else {
                                                        localStorage.db = doc.dbName;
                                                    }

                                                    localStorage.lastDb = doc.dbName;
                                                    localStorage.couchdb = doc.url;
                                                    localStorage.http = doc.http;
                                                    eventDescription.evtUserPass = doc.evtUserPass;
                                                    eventDescription.dbName = doc.dbName;
                                                    var newRemotedbURL = doc.http + username + ':' + password + '@' + doc.url + '/' + doc.dbName;
                                                    if (remotedbURL === newRemotedbURL) {
                                                        //this returns true
                                                        return true;
                                                    } else {
                                                        remotedbURL = newRemotedbURL;
                                                        if (remotedbConnected) {

                                                            return remotedb.close().then(function (doc) {
                                                                return remotedbConnected = false;
                                                            }).catch(function (err) {
                                                                console.log(err);
                                                                throw err;
                                                            });
                                                        } else {
                                                            //this should return false
                                                            return remotedbConnected;
                                                        }
                                                    }
                                                }).then(function (doc) {
                                                    //checking if remotedb was already defined or not, most likely not
                                                    if (doc === false) {
                                                        console.log('creating new remotedb connection with new characteristics');

                                                        //new remotedb location as defined from the server
                                                        return remotedb = new PouchDB(remotedbURL);
                                                    } else {
                                                        //remotedb has not changed
                                                        return remotedb;
                                                    }

                                                }).then(function (db) {
                                                    //db is remoteDb but via the function not the var
                                                    console.log(db);
                                                    return db.get('eventDescription')
                                                        .then(function (doc) {
                                                            eventDescription._rev = doc._rev;
                                                            return db.put(eventDescription);
                                                        }).catch(function (err) {
                                                            console.log(err);
                                                            if (err.status === 404) {
                                                                return db.put(eventDescription);
                                                            } else {
                                                                console.log(err);
                                                                err.message = 'unable to upload event description to the database';
                                                                throw err;
                                                            }
                                                        });
                                                }).then(function (doc) {
                                                    return replicateOnce(eventDescription.dbName, ['eventDescription'], false);
                                                }).then(function (doc) {
                                                    //adds a reference to the event description by adding the db to the list of the user's dbs
                                                    return addAppdbLoginDb(eventDescription.dbName);
                                                }).then(function (doc) {
                                                    console.log(doc);
                                                    var options = {
                                                        animation: pageChangeAnimation,
                                                        data: {
                                                            eventName: eventDescription.eventName,
                                                            url: url,
                                                            eventInfo: eventDescription
                                                        }
                                                    };
                                                    return navi.resetToPage('eventSummaryPage.html', options);
                                                }).catch(function (err) {
                                                    console.warn(err);
                                                    if (err.message === undefined) {
                                                        err.message = 'issue saving the event';
                                                    }
                                                    return ons.notification.alert({
                                                        title: 'error',
                                                        message: err.message,
                                                        cancelable: true
                                                    }).then(function () {
                                                        return showProgressBar('createEventPage', false);
                                                    });
                                                });
                                        }
                                    } else {
                                        ons.notification.alert({
                                            title: 'error',
                                            message: 'username is not unique, please try a different username',
                                            cancelable: true
                                        }).then(function () {
                                            return showProgressBar('createEventPage', false);
                                        });
                                    }
                            }
                        } else if (editEvent) {
                            //update rather than save
                            //variables required outside the promises
                            var tempdb = new PouchDB(eventInfo.dbName);
                            var logo = document.getElementById('eventBannerImage');
                            ons.notification.confirm({
                                title: 'Update Event',
                                message: 'Are you sure you want to update ' + eventInfo.eventName,
                                cancelable: true
                            }).then(function (index) {
                                if (!index === 1) {
                                    throw index;
                                }
                                showProgressBar('createEventPage', true);
                                if (getFile != false) {
                                    // return downscaleImg(logo, 1922, 240);
                                    return Promise.resolve().then(function () {
                                        return downscaleImg(logo, 1922, 240);
                                    }).then(function (doc) {
                                        console.log(doc);
                                        if (doc != false) {
                                            return stepped_scale(logo, doc.width, 0.5);
                                        }
                                        return false;
                                    }).then(function (doc) {
                                        if (doc != false) {
                                            return getFile = doc;
                                        }
                                        return;
                                    });
                                }
                                return false; //no file upload took place
                            }).then(function (doc) {
                                console.log(doc);
                                return tempdb.get('eventDescription');
                            }).then(function (doc) {
                                var changeMade = false;
                                createEventDescription();

                                if (!addBasesToEvtDescription(baseCount, eventDescription.passwordProtectLogs, eventDescription)) {
                                    throw 'password not set';
                                }

                                //look for changes
                                $.each(eventDescription, function (key, value) {
                                    console.log('key: ' + key + ' value: ' + value);
                                    if (key != 'bases') {
                                        if (value === eventInfo[key]) {
                                            return true;
                                        }
                                    } else {
                                        return value.forEach(function (base) {
                                            if (eventInfo.bases[base.baseNo] === undefined) {
                                                console.log('new base added');
                                                changeMade = true;
                                                return false;
                                            }
                                            var testAgainst = eventInfo.bases[base.baseNo];
                                            console.log(testAgainst);
                                            return $.each(base, function (key2, value2) {
                                                if (value2 === testAgainst[key2]) {
                                                    console.log('SAME key: ' + key2 + ' value: ' + value2);
                                                    return true;
                                                }
                                                console.log('DIFF key: ' + key2 + ' value: ' + value2);
                                                changeMade = true;
                                                return false;
                                            });
                                        });
                                    }
                                    console.log('change made');
                                    changeMade = true;
                                    return false;
                                });
                                if (getFile !== false) {
                                    //adds an image to the description
                                    eventDescription._attachments = {
                                        evtLogo: {
                                            data: getFile,
                                            content_type: getFile.type
                                        }
                                    };
                                    changeMade = true;
                                } else if (eventInfo._attachments != undefined) {
                                    eventDescription._attachments = eventInfo._attachments;
                                }
                                if (!changeMade) {

                                    return {
                                        ok: false
                                    }; //no change made so cancel out
                                }
                                eventDescription._rev = doc._rev;
                                eventDescription.dbName = eventInfo.dbName;
                                eventDescription.evtUserPass = eventInfo.evtUserPass;

                                return tempdb.put(eventDescription);
                            }).then(function (doc) {
                                console.log(doc);
                                if (doc.ok) {
                                    return replicateOnce(eventInfo.dbName, ['eventDescription'], true);
                                } else {
                                    return ons.notification.alert({
                                        title: 'No change found',
                                        message: 'No change has been detected from previous event information. A new version has not been saved.',
                                        cancelable: true
                                    }).then(function () {
                                        throw navi.popPage();
                                    });
                                }
                            }).then(function (doc) {
                                console.log(doc);
                                var options = {
                                    animation: pageChangeAnimation,
                                    data: {
                                        eventName: eventDescription.eventName,
                                        url: url,
                                        eventInfo: eventDescription
                                    }
                                };

                                return navi.resetToPage('eventSummaryPage.html', options);
                            }).then(function (doc) {
                                var tempRemotedb = new PouchDB(http + username + ':' + password + '@' + couchdb + '/' + eventInfo.dbName);
                                tempRemotedb.compact();
                                return closeDatabases();
                            }).catch(function (err) {
                                console.log(err);
                            });
                        }
                    });
                }
                //end of create event page
                break;
            case 'eventSummaryPage.html':
                var eventName = navi.topPage.data.eventName;
                var url = navi.topPage.data.url;
                if (navi.topPage.data.eventInfo != undefined) {
                    var eventInfo = navi.topPage.data.eventInfo
                } else {
                    var eventInfo = eventDescription;
                }
                console.log(eventInfo);

                console.log(url);
                if (!($('#eventSummaryPage').hasClass('evtLoaded'))) {
                    $('#eventSummaryPage').addClass('evtLoaded');
                    console.log(eventInfo);
                    $('#evtSummaryTitle').html(eventName);
                    var evtStart = new Date(eventInfo.dateStart);
                    var evtEnd = new Date(eventInfo.dateEnd)

                    $('#evtSummaryStartDate').append(evtStart.toDateString() + ' at ' + evtStart.toLocaleTimeString());
                    $('#evtSummaryEndDate').append(evtEnd.toDateString() + ' at ' + evtEnd.toLocaleTimeString());
                    $('#evtSummaryBaseCount').append(eventInfo.bases.length);
                    $('#evtSummaryUsername').append(eventInfo.evtUsername);
                    $('#evtSummaryPassword').append(eventInfo.evtUserPass);
                    if (eventInfo.eventDescription !== '') {
                        $('#evtSummaryDescription').append(eventInfo.eventDescription.replace(/\n/g, "<br>"));
                    }
                    $('#evtSummaryAdminPass').append(eventInfo.bases[0].basePassword);

                    eventInfo.bases.forEach(function (base) {

                        $('#evtSummaryBases').append('<h2 class="bold evtSummaryBasesTitle">Base ' + base.baseNo + ': ' + base.baseName + '<h2>');
                        if (base.baseMaxScore === undefined || base.baseMaxScore === '') {
                            message = 'no score available at this location';
                        } else {
                            message = base.baseMaxScore;
                        }

                        $('#evtSummaryBases').append('<p><span class="bold sentanceCase">Max Score Available: </span>' + message + '<p>');
                        if (eventInfo.passwordProtectLogs) {
                            $('#evtSummaryBases').append('<p><span class="bold sentanceCase">Base code: </span>' + base.basePassword + '<p>');
                        }
                        if (base.baseInstructions != undefined && base.baseInstructions != "") {
                            $('#evtSummaryBases').append('<p><span class="bold sentanceCase">Base instructions: </span>' + base.baseInstructions.replace(/\n/g, "<br>") + '<p>');
                        }
                    });

                    //eventLogo update
                    Promise.resolve().then(function () {
                        return eventLogoGetter(eventInfo, url);
                    }).then(function (src) {
                        console.log(src);
                        if (src != undefined) {
                            $('#evtSummaryBanner').append('<img src="' + src + '" class="loginLogo marginTop" id="eventSummaryBannerImage">');
                            url = src;
                        }
                    }).catch(function (err) {
                        console.log(err);
                    });
                    $('#goToEvent').on('click', function () {
                        lastDb = eventInfo.dbName;
                        console.warn(lastDb);
                        localStorage.lastDb = lastDb;
                        remotedbURL = http + username + ':' + password + '@' + couchdb + '/' + lastDb;
                        var options = {
                            animation: pageChangeAnimation,
                            data: {
                                eventInfo: eventInfo,
                                url: url
                            }
                        };
                        navi.resetToPage('loginPage.html', options);
                    });
                }

                break;

                // --- Log in Page ---

            case 'loginPage.html':
                //loginPage.html
                // ons.disableDeviceBackButtonHandler();
                var db, tempRemotedb, options, messageOpen;
                if (name != undefined && name != 'undefined') {
                    $('#userName').val(name);
                }
                if (navi.topPage.data.eventInfo !== undefined) {
                    var eventInfo = navi.topPage.data.eventInfo;
                    //get the data from the page and update the page
                    // if (navi.topPage.data.firstPage === true) {
                    if (!evtUpdateCheckConnected) {
                        evtUpdateCheckConnected = true;
                        var db = new PouchDB(eventInfo.dbName);
                        var tempRemotedb = new PouchDB(http + username + ':' + password + '@' + couchdb + '/' + eventInfo.dbName);
                        var options = {
                            doc_ids: ['eventDescription'],
                            live: true,
                            retry: true
                        };
                        var messageOpen = false;
                        evtUpdateCheck = db.replicate.from(tempRemotedb, options)
                            .on('change', function (doc) {
                                if (!messageOpen) {
                                    messageOpen = true;
                                    ons.notification.alert({
                                        title: 'Event Updated',
                                        messageHTML: '<p>This event has been updated by the event organisers.</p><p>Your device will update once this message closes.</p>',
                                        cancelable: true
                                    }).then(function (input) {
                                        var options = {
                                            animation: pageChangeAnimation,
                                            data: {
                                                event: eventInfo.dbName,
                                                lastPage: 'loginPage.html'
                                            }
                                        };
                                        navi.resetToPage('updatePage.html', options);
                                        evtUpdateCheck.cancel();
                                        messageOpen = false;
                                        //to stop any further code from taking place

                                    });
                                }
                            }).on('paused active denied error', function (info) {
                                console.log(info);
                            }).on('complete', function (info) {
                                console.log('evtUpdateCheck complete');
                                evtUpdateCheckConnected = false;
                            });

                    }
                    //Event Description update
                    $('#loginEventDescription').html(eventInfo.eventDescription.replace(/\n/g, "<br>"));
                    var evtStart = new Date(eventInfo.dateStart);
                    var evtEnd = new Date(eventInfo.dateEnd);
                    $('#loginEventDescriptionTitle').after('<p><span class="bold">Start</span>: ' + evtStart.toDateString() + ' at ' + evtStart.toLocaleTimeString() + '<br><span class="bold">End</span>: ' + evtEnd.toDateString() + ' at ' + evtEnd.toLocaleTimeString() + '</p>');


                    //Event Logo update
                    var url = navi.topPage.data.url;
                    var imageContainer = $('#loginEventLogo')
                    Promise.resolve().then(function () {
                        return eventLogoGetter(eventInfo, url);
                    }).then(function (src) {
                        if (src != undefined) {
                            imageContainer.hide().attr('src', src).removeClass('hide').fadeIn(1500);
                            url = src;
                        } else {
                            imageContainer.hide().removeClass('hide').fadeIn(1500);
                        }
                    }).catch(function (err) {
                        console.log(err);
                    });


                    //Base Password put into array and checks if base passwords are required or a dropdown is added
                    if (eventInfo.passwordProtectLogs) {


                        //if bases have a password
                        eventInfo.bases.forEach(function (base) {
                            var baseCode = base.basePassword;
                            if (baseCode === '') {
                                baseCode = base.baseNo.toString();
                            }
                            baseCodes.push(baseCode);
                            //base names are put into array
                            baseNames.push(base.baseName);
                        });
                        //change error message
                        var noBaseSelectedErrorMessage = 'Please enter both your name and your base code provided by the event organisers.';
                        //change welcome text
                        var welcomeMessage = 'Welcome to ' + eventInfo.eventName + ' please enter your name and base code below:';
                        var baseCodeInput = $('#baseCode');
                        if (!(baseCodeInput.hasClass('evtHandler'))) {
                            baseCodeInput.addClass('evtHandler').on('keyup', function (e) {
                                var key = e.which;
                                // enter key is 13
                                if (key === 13) {
                                    e.preventDefault();
                                    $('.loginButton').click();
                                }
                            });
                        }

                    } else {
                        // bases do not have a password

                        var noBaseSelectedErrorMessage = 'Please enter both your name and select a base.';
                        //change welcome text
                        var welcomeMessage = 'Welcome to ' + eventInfo.eventName + ' please enter your name and select a base below:';
                        //change the code input to a button and select
                        $('#baseCode').replaceWith('<ons-button modifier="large" id="baseCode">Select a base</ons-button>');
                        var baseCodeInput = $('#baseCode');
                        if (!(baseCodeInput.hasClass('evtHandler'))) {
                            baseCodeInput.addClass('evtHandler').on('click', function () {
                                var baseSelectDialog = document.getElementById('baseSelectDialog');
                                if (baseSelectDialog === null) {

                                    ons.createDialog('baseSelectDialog.html')
                                        .then(function (dialog) {
                                            dialog.addEventListener('preshow', function (event) {
                                                var selectBase = navi.topPage.data.eventInfo.bases;
                                                baseCodes = [];
                                                baseNames = [];
                                                var loginSelect = $('#loginBaseSelect');
                                                loginSelect.empty();
                                                selectBase.forEach(function (base) {
                                                    var baseCode = base.baseNo.toString();
                                                    var baseName = base.baseName;
                                                    baseCodes.push(baseCode);
                                                    //base names are put into array
                                                    baseNames.push(baseName);
                                                    //adds an option in the dropdown
                                                    loginSelect.append('<ons-list-item onClick="baseSelectValue(' + baseCode + ')" class="baseSelectItem"  id="baseSelect_' + baseCode + '" value ="' + baseCode + '"><label class="left"><ons-input name="color" type="radio" input-id="radio-' + baseCode + '"></ons-input></label><label for = "radio-' + baseCode + '"class = "center" >' + baseName + '</label></ons-list-item>')
                                                });
                                            });
                                            dialog.show();
                                        }).catch(function (err) {
                                            console.log(err);
                                        });

                                } else {
                                    baseSelectDialog.show();
                                }



                            });
                        }
                        $('#betweenNameAndBase').html('Select your base by pressing the button below:');
                        $('#loginCodeCaption').remove();

                    }
                    //add a welcome message
                    $('#loginWelcome').html(welcomeMessage);
                    //Title update
                    console.log('event called ' + eventInfo.eventName);
                    $('#loginTitle').html(eventInfo.eventName);
                }

                /*  if (localStorage.evtOrganiser) {
                     $('ons-toolbar .right').append('<ons-toolbar-button><ons-icon icon="md-repeat" id="selectEvent"></ons-icon></ons-toolbar-button>');

                 } */

                //event handlers
                if (!($('.loginButton').hasClass('evtHandler'))) {
                    $('.loginButton').addClass('evtHandler');
                    $('.loginButton').on('click', function () {
                        if ($('#baseCode').val != '' && $('#userName').val() != '') {
                            var baseCodeInput = $('#baseCode').val().toLowerCase();
                            name = $('#userName').val();
                            base = baseCodes.indexOf(baseCodeInput);
                            var timestamp = new Date().toISOString();
                            if (base > -1) {
                                //  code is in the list
                                ons.enableDeviceBackButtonHandler();
                                if (base === 0) {
                                    //admin message
                                    var welcomeMessage = 'Welcome to the ' + eventInfo.eventName + ' admin app, here you can view all team scores as they come in. If you are using a mobile device, rotate your screen to see more information.';
                                } else {
                                    var welcomeMessage = 'Welcome to the ' + eventInfo.eventName + ' base app, here you can enter team scores and log their details. This will instantaniously update in HQ but please do still write down on paper too. If you rotate your device you will see only the log table but in more detail.';
                                }
                                appdb.get('login_' + username).then(function (doc) {
                                        doc.base = base;
                                        doc.name = name;
                                        doc.currentDb = eventInfo.dbName;
                                        doc.timestamp = timestamp;
                                        return appdb.put(doc);
                                    })
                                    .catch(function (err) {
                                        //TODO check once the db stuff is sorted
                                        return appdb.put({
                                            _id: 'login_' + username,
                                            base: base,
                                            name: name,
                                            currentDb: eventInfo.dbName,
                                            timestamp: timestamp
                                        }).then(function () {
                                            ons.notification.alert({
                                                title: 'Welcome ' + name,
                                                message: welcomeMessage,
                                                cancelable: true
                                            });
                                        }).catch(function () {
                                            ons.notification.alert({
                                                title: 'Error saving user',
                                                message: 'You have logged in but there was an error saving your user credentials, the app will require you to log in again if you close it.',
                                                cancelable: true
                                            });
                                        });


                                    });
                                loginAndRunFunction(base, {
                                    eventInfo: eventInfo
                                });
                                evtUpdateCheck.cancel();
                                // } else if (base == 7) {
                                //     // roaming page 

                            } else {
                                //  bad
                                ons.notification.alert({
                                    message: 'Please try re-entering your base code or contact the event organisers',
                                    title: 'Incorrect Base Code',
                                    cancelable: true
                                });
                            }

                        } else {
                            ons.notification.alert({
                                message: noBaseSelectedErrorMessage,
                                title: 'Missing inputs',
                                cancelable: true
                            });

                        }
                    });
                }
                menuController('loginPage.html');
                // end of loginPage.html
                break;

            case 'eventSelectionPage.html':
                var ongoingEvents = $('#ongoingEvents');
                var todaysEvents = $('todaysEvents');
                var upcomingEvents = $('#upcomingEvents');
                var pastEvents = $('#pastEvents');
                var databases = JSON.parse(localStorage.db);
                console.log(databases);


                Promise.all(databases.map(function (event) {
                    var tempdb = new PouchDB(event);
                    return tempdb.get('eventDescription')
                        .then(function (doc) {
                            var dateNow = new Date();
                            var today = dateNow.getDay();
                            var month = dateNow.getMonth();
                            var year = dateNow.getFullYear();
                            var dateStart = new Date(doc.dateStart);
                            var dSDay = dateStart.getDay();
                            var dSMonth = dateStart.getMonth();
                            var dSYear = dateStart.getFullYear();
                            var dateEnd = new Date(doc.dateEnd);
                            var eventTimeline;
                            if (dateStart < dateNow && dateNow < dateEnd) {
                                //ongoing
                                eventTimeline = ongoingEvents;
                            } else if (dSYear === year && dSMonth === month && dSDay === today && dateNow < dateStart) {
                                //today but not started
                                eventTimeline = todaysEvents;
                            } else if (dateNow < dateStart) {
                                //upcoming but not today as that is already worked out
                                eventTimeline = upcomingEvents;
                            } else if (dateNow > dateEnd) {
                                //past event
                                eventTimeline = pastEvents;
                            } else {
                                //just in case
                                eventTimeline = upcomingEvents;
                            }


                            eventTimeline.append(
                                `
                                    <div class="card mdl-shadow--2dp" id="` + event + `">
                                    <div class="cardMediaDiv"></div>
                                        <div class="mdl-card__title">` + doc.eventName + `</div>
                                        <div class="mdl-card__actions mdl-card--border">
                                            <ons-button modifier="quiet" class="goToEventButton secondaryColor">Enter event</ons-button><ons-button modifier="quiet" class="goToSummary secondaryColor">Info</ons-button> <ons-button modifier="quiet" ripple class="cardIconButton rotate270 baseInstructionsShow"><i class="zmdi zmdi-chevron-left"></i></ons-button>
                                        </div>
                                        <div class="mdl-card__supporting-text hide">` + doc.eventDescription.replace(/\n/g, "<br>") + `</div>
                                        <div class="cardTRButton">
                                            <ons-button modifier="quiet" ripple class="cardIconButton"><i class="zmdi zmdi-share"></i></ons-button>
                                        </div>
                                    </div>
                                    <br>
                                `
                            );
                            //shows the title of the event timeline grouping
                            eventTimeline.find('.eventTitle').removeClass('hide');
                            //eventInfo
                            var eventId = $('#' + event);
                            eventId.data('eventInfo', doc);
                            //go to event, event handler
                            var goToEvents = $('#' + event + ' .goToEventButton');
                            goToEvents.on('click', function () {
                                var eventInfo = eventId.data('eventInfo');
                                console.log(eventInfo);
                                lastDb = eventInfo.dbName;
                                localStorage.lastDb = lastDb;
                                remotedbURL = http + username + ':' + password + '@' + couchdb + '/' + lastDb;
                                var options = {
                                    animation: pageChangeAnimation,
                                    data: {
                                        eventInfo: eventInfo
                                    }
                                };
                                navi.resetToPage('loginPage.html', options);
                            });
                            //event description show hide
                            var edShowHide = $('#' + event + ' .baseInstructionsShow');
                            edShowHide.on('click', function () {
                                edShowHide.toggleClass('rotate90');
                                $('#' + event + ' .mdl-card__supporting-text').slideToggle(500);
                            });
                            var goToSummary = $('#' + event + ' .goToSummary');
                            goToSummary.on('click', function () {
                                var eventInfo = eventId.data('eventInfo');
                                //TODO pick up here
                                var img = eventId.find()
                                var options = {
                                    animation: pageChangeAnimation,
                                    data: {
                                        eventInfo: eventInfo
                                    }
                                };
                                navi.bringPageTop('eventSummaryPage.html', options);
                            });
                            //return for the logo
                            return eventLogoGetter(doc);
                        }).then(function (url) {
                            if (url != undefined) {

                                //$('#' + event + ' .mdl-card__title').before('<div class="cardMediaDiv"><img class="cardMedia" src="' + url + '" ></div>');
                                $('#' + event + ' .cardMediaDiv').css({

                                    'background-image': 'url("' + url + '")',
                                    'background-repeat': 'no-repeat',
                                    'background-position': 'center top',
                                    'background-size': 'cover',
                                    'height': 240,
                                    'min-height': 100
                                });
                                return true;
                            } else {
                                console.log('no url');
                            }

                        }).catch(function (err) {
                            console.log(err);
                        });
                }));
                /*  var goToEvents = $('.goToEventButton');
                 goToEvents.on('click', function () {
                     console.log($(this).parents('.card').data('eventInfo'));
                 }); */
                var createEventButton = $('#createNewEventButton');
                if (!(createEventButton.hasClass('evtHandler'))) {
                    createEventButton.addClass('evtHandler').on('click', function () {
                        var options = {
                            animation: pageChangeAnimation,
                            data: {
                                edit: false
                            }
                        }
                        navi.bringPageTop('createEventPage.html', options);
                    });
                }
                menuController('eventSelectionPage.html');
                break;

            case 'page1.html':
                menuController('page1.html');
                //passing through information about the event and the base

                if (navi.topPage.data.eventInfo !== undefined) {
                    var eventInfo = navi.topPage.data.eventInfo;
                    var eventInfoBase = eventInfo.bases[getBaseNumber()];
                    if (eventInfoBase.baseInstructions != '') {
                        console.log('there are base instructions');
                        $('.topHalf').prepend('<div id="instructions"><ons-list><ons-list-item tappable><div class="left">Base instructions</div><div class="right"><ons-icon id="instructionChevron" icon="md-chevron-left" class="secondaryColor rotate270"></ons-icon></div></ons-list-item></div>');
                        $('#instructions').append('<div id="baseInstructions" class="marginLeft marginRight hide">' + eventInfo.bases[getBaseNumber()].baseInstructions.replace(/\n/g, "<br>") + '</div>')
                        $('#instructions').on('click', function () {
                            $('#instructionChevron').toggleClass('rotate90');
                            $('#baseInstructions').slideToggle(500);
                        });
                    }
                    //hides score entry if there is no maximum base score
                    if (eventInfoBase.baseMaxScore === '' || eventInfoBase.baseMaxScore === undefined) {
                        $('#page1TotalScore').hide();
                    } else {
                        $('#total').attr('placeholder', 'Total score (max ' + eventInfoBase.baseMaxScore + ')');
                    }

                    baseDatabaseName = eventInfo.dbName;
                }
                //TODO 3/10/2017
                //Also send the user straight through to the base if they had a previous base selected
                //Also work out how to filter the data sent on sync
                //Also work out how to downscale the images saved
                // --- Page 1 for normal bases ---
                if (base > 0) {
                    $('.pageTitle').html('Base ' + base + ' @ ' + eventInfo.bases[getBaseNumber()].baseName);
                    $('.quickAddTitle').html('Add new log from base ' + base);

                } else if (base === 'noBase') {
                    $('.pageTitle').html('On the look out');
                    $('.quickAddTitle').html('Record the teams you see');
                    $('#tableTitle').html('Teams seen')

                }
                $('#logsTable').empty();

                if (basedbConnected === false) {
                    basedb = new PouchDB(baseDatabaseName);
                    basedbConnected = true;
                }
                //create timeOut index
                basedb.createIndex({
                    index: {
                        fields: ['timeOut'],
                        name: 'timeOutIndex',
                        ddoc: 'timeOutIndexDDoc',
                        type: 'json'
                    }
                }).then(function (doc) {
                    console.log(doc);
                    return basedb.createIndex({
                        index: {
                            fields: ['base', 'timeOut'],
                            name: 'baseTimeOutIndex',
                            ddoc: 'baseTimeOutIndexDDoc',
                            type: 'json'
                        }
                    })
                }).then(function (doc) {
                    return basedb.createIndex({
                        index: {
                            fields: ['patrol'],
                            name: 'patrolIndex',
                            ddoc: 'patrolIndexDDoc',
                            type: 'json'
                        }
                    });

                }).then(function (doc) {
                    console.log(doc);
                    //returns just this base' records
                    return basedb.find({
                        selector: {
                            timeOut: {
                                $gt: null
                            },
                            base: {
                                $eq: base
                            }
                        },
                        sort: ['timeOut']
                    });
                }).then(function (doc) {
                    console.log(doc);
                    return updateTableFromFindQuery(doc, false);
                }).then(function (doc) {
                    return basedb.createIndex({
                        index: {
                            fields: ['base'],
                            name: 'baseIndex',
                            ddoc: 'baseIndexDDoc',
                            type: 'json'
                        }
                    });

                }).then(function (doc) {
                    if (remotedbConnected === false) {
                        remotedb = new PouchDB(remotedbURL);
                        remotedbConnected = true;
                    }

                    // var syncOptions = {
                    //     live: true,
                    //     retry: true,
                    //     filter: 'baseFilter1/by_base'

                    // }
                    if (baseSyncInProgress === false) {
                        var syncOptions = {
                            live: true,
                            retry: true
                        }
                        baseSyncInProgress = true;
                        return syncBasedb = basedb.sync(remotedb, syncOptions)
                            .on('change', function (doc) {
                                // yo, something changed!

                                console.log(doc);
                                if (doc.direction === 'pull') {
                                    console.log('change occured in remote updating basedb');
                                    var change = doc.change;
                                    updateTableFromFindQuery(change, false); // fixme needs to add to table before sync as it might not sync
                                } else {
                                    console.log('updating remotedb');
                                    //the comment below would update the table only if they sync action occurs - left only in case another solution is not found
                                    // var change = doc.change;
                                    // updateTableFromFindQuery(change, false);
                                }
                            }).on('paused', function (info) {
                                // replication was paused, usually because of a lost connection
                            }).on('active', function (info) {
                                // replication was resumed
                            }).on('error', function (err) {
                                // totally unhandled error (shouldn't happen)
                                console.log(err);
                                ons.notification.alert({
                                    title: 'Error',
                                    messageHTML: '<p>An error has occured with the following message</p><p>' + err.message + '</p>',
                                    cancelable: true
                                });
                                if (err.status === 409) {
                                    console.log('conflict in doc upload');
                                }
                            }).on('complete', function (info) {
                                console.log('sync between remotedb and basedb has been cancelled');
                                baseSyncInProgress = false;
                            });
                    }
                }).catch(function (err) {
                    return console.log(err);
                });






                // -- QuickAdd --

                // Control for the on or off route button
                if ((!($('#offRouteCheckbox').hasClass('evtHandler'))) && eventInfo.logOffRoute) {
                    $('#offRouteCheckbox').addClass('evtHandler').removeClass('logOffRouteFalse');
                    $('.checkbox').on('click', '.checkbox__input', function () {
                        if ($('#offRoute.checkbox__input').is('.checkbox__input:checked')) {
                            $('#total').prop('disabled', true);
                        } else {
                            $('#total').prop('disabled', false);
                        }
                    });
                } else if (!eventInfo.logOffRoute) {
                    //hides the log off route option
                    $('#offRouteCheckbox').addClass('logOffRouteFalse');
                }
                //stops the FAB button showing before a table element is selected
                //TODO 3/10/2017 make fulledit fab have multiple options including removing the log
                var editFab = document.getElementById('fullEditFab');
                editFab.hide();
                userCurrentlySelected = [];
                $('#fullEditFab').removeClass('hide');

                if (!($('#logsTable').hasClass('evtHandler'))) {
                    $('#logsTable').addClass('evtHandler');
                    $('#logsTable').on('click', 'tr', function (e) {
                        if (!($(this).hasClass('lockedLog'))) {
                            if ($(this).hasClass('tableSelected')) {
                                $(this).removeClass('tableSelected');

                                var dataInfo = $(this).data('databaseInfo');
                                var index = userCurrentlySelected.indexOf(dataInfo);
                                if (index > -1) {
                                    userCurrentlySelected.splice(index, 1);
                                }
                                console.log(userCurrentlySelected);
                                if (!($('tr').hasClass('tableSelected'))) {
                                    editFab.hide();
                                }
                                // } else if (e.shiftKey == true) {
                                //     $(this).addClass('tableSelected');
                                //     // $('#adminSpeedDial').removeClass('hide');
                                //     editFab.show();
                                //     var dataInfo = $(this).data('databaseInfo');
                                //     userCurrentlySelected.push(dataInfo);
                                //     console.log(userCurrentlySelected);

                            } else {
                                $('tr').removeClass('tableSelected');
                                $(this).addClass('tableSelected');
                                // $('#adminSpeedDial').removeClass('hide');
                                editFab.show();
                                //clear all previously selected items from the array
                                userCurrentlySelected = [];
                                // to get the dbId's off the element
                                var dataInfo = $(this).data('databaseInfo');
                                userCurrentlySelected.push(dataInfo);
                                console.log(userCurrentlySelected);
                            }
                        } else {
                            ons.notification.alert({
                                title: 'No longer editable',
                                message: 'This record has been locked by HQ and cannot be edited',
                                cancelable: true
                            });
                        }
                    });
                }
                if (!($('#fullEditFab').hasClass('evtHandler'))) {
                    $('#fullEditFab').addClass('evtHandler');
                    $('#fullEditFab').on('click', function () {
                        editLog(userCurrentlySelected);
                    });
                }
                // Clear quick submit entries
                if (!($('#cancelSubmitQuick').hasClass('evtHandler'))) {
                    // Add the event handler only once when the page is first loaded.
                    $('#cancelSubmitQuick').addClass('evtHandler');
                    console.log('got to here');
                    $('#cancelSubmitQuick').on('click', function () {
                        ons.notification.confirm({
                            message: 'Are you sure you want to clear this entry?',
                            cancelable: true
                        }).then(function (input) {
                            if (input == 1) {
                                clearQuickAddInputs();
                            }
                        });
                    });
                }
                // Quick submit code
                if (!($('#submitQuick').hasClass('evtHandler'))) {
                    // Add the event handler only once when the page is first loaded.
                    $('#submitQuick').addClass('evtHandler');
                    $('#submitQuick').on('click', function () {
                        base = getBaseNumber();
                        //currentLocation = getGeolocation();
                        // set variables to the input values
                        sqPatrol = $('#patrolNo').val();
                        sqTimeIn = $('#timeIn').val();
                        sqTimeOut = $('#timeOut').val();
                        sqWait = $('#wait').val();
                        sqOffRoute = $('#offRoute').prop('checked');
                        sqTotalScore = $('#total').val();
                        var missingInformationMessage = "";
                        var now = Date.now();
                        var time = new Date();
                        var timestamp = time.toISOString();

                        if (sqPatrol === "") {
                            missingInformationMessage = '<p>Patrol number</p>';
                        }
                        if (sqTotalScore === "" && sqOffRoute === false && eventInfoBase.baseMaxScore != '') {
                            missingInformationMessage = missingInformationMessage + '<p>Total score for the patrol</p>';
                        }
                        if (missingInformationMessage != "") {
                            ons.notification.alert({
                                title: 'Missing fields',
                                messageHTML: '<p>This log entry is missing the following fields:</p>' + missingInformationMessage,
                                cancelable: true
                            });
                        } else if (parseInt(sqTotalScore) > parseInt(eventInfoBase.baseMaxScore)) {
                            ons.notification.alert({
                                title: 'Total score',
                                message: 'the total score entered is greater than the maximum points available at a base',
                                cancelable: true
                            });
                        } else if (sqTotalScore != "" && sqOffRoute) {

                            ons.notification.confirm({
                                    title: 'Confirm off route or log score',
                                    messageHTML: '<p>You have entered a score of ' + sqTotalScore + ' and that the team was off route.</p><p>Select whether you wish to submit an off route log with no score or an on route log with a score of ' + sqTotalScore + '.</p>',
                                    cancelable: true,
                                    buttonLabels: ['Off route - no score', 'On route - score of ' + sqTotalScore]
                                }).then(function (input) {
                                    //button index
                                    console.log(input);
                                    switch (input) {
                                        case 0:
                                            $('#total').val('');
                                            $('#submitQuick').click();
                                            break;
                                        case 1:
                                            $('#offRoute').prop('checked', false);
                                            $('#submitQuick').click();
                                            break;
                                    }
                                })
                                .catch(function (err) {
                                    console.log(err);
                                });

                        }
                        //else if (Date.parse(sqTimeOut) > Date.parse(sqTimeIn)) {
                        //     ons.notification.alert({
                        //         title: 'Incorrect times',
                        //         message: 'this log entry has the patrol leaving before they arrived',
                        //         cancelable: true
                        //     });
                        // } 
                        else {
                            // if (sqPatrol < 10) {
                            //     sqPatrol = '0' + sqPatrol;
                            // }
                            if (sqTimeIn === "") {
                                var date = new Date();
                                sqTimeIn = date.toLocaleTimeString();
                            } else if (sqTimeIn.length == 5) {
                                sqTimeIn = sqTimeIn + ':00';
                            }
                            if (sqTimeOut === "") {
                                var date = new Date();
                                sqTimeOut = date.toLocaleTimeString();
                            } else if (sqTimeOut.length == 5) {
                                sqTimeOut = sqTimeOut + ':00';
                            }
                            if (sqWait == "") {
                                sqWait = 0;
                            }
                            if (sqTotalScore != "" && sqOffRoute || base === 'noBase') {
                                sqTotalScore = '';
                            }
                            //if logging off route is not enabled
                            if (!eventInfo.logOffRoute) {
                                sqOffRoute = 'n/a';
                            }

                            var patrolLog = {
                                _id: sqPatrol + '_base_' + base,
                                patrol: sqPatrol,
                                base: base,
                                username: name,
                                timeIn: sqTimeIn,
                                timeOut: sqTimeOut,
                                timeWait: sqWait,
                                offRoute: '',
                                totalScore: sqTotalScore,
                                editable: true,
                                timestamp: timestamp
                            }

                            // -- important if off route it is just added to the db

                            switch (sqOffRoute) {
                                case true:
                                    console.log(base);
                                    var offRoutePatrolLog = {
                                        _id: sqPatrol + '_base_' + base + '_offRoute_' + now,
                                        patrol: sqPatrol,
                                        base: base,
                                        username: name,
                                        timeIn: sqTimeIn,
                                        timeOut: sqTimeOut,
                                        timeWait: sqWait,
                                        offRoute: sqOffRoute,
                                        totalScore: sqTotalScore,
                                        editable: true,
                                        timestamp: timestamp
                                    }

                                    tableUpdateFunction(offRoutePatrolLog, false);
                                    orientationLandscapeUpdate();
                                    clearQuickAddInputs();
                                    basedb.put(offRoutePatrolLog);
                                    break;
                                default:
                                    basedb.get(patrolLog._id)
                                        .then(function (doc) {
                                            switch (doc.editable) {
                                                case true:
                                                    ons.notification.confirm({
                                                        title: 'Update',
                                                        message: 'Are you sure you want to update patrol number ' + sqPatrol,
                                                        cancelable: true
                                                    }).then(function (input) {
                                                        if (input === 1) {
                                                            clearQuickAddInputs();
                                                            var patrolLogUpdate = {
                                                                _id: doc._id,
                                                                _rev: doc._rev,
                                                                patrol: sqPatrol,
                                                                base: base,
                                                                username: name,
                                                                timeIn: sqTimeIn,
                                                                timeOut: sqTimeOut,
                                                                timeWait: sqWait,
                                                                offRoute: '',
                                                                totalScore: sqTotalScore,
                                                                editable: true,
                                                                timestamp: timestamp
                                                            }
                                                            return basedb.put(patrolLogUpdate)
                                                                .then(function (doc) {
                                                                    tableUpdateFunction(patrolLogUpdate, false);
                                                                    return orientationLandscapeUpdate();
                                                                });
                                                        }
                                                    }).catch(function (err) {
                                                        console.log(err);
                                                    });
                                                    break;
                                                case false:
                                                    ons.notification.alert({
                                                        title: 'No longer editable',
                                                        message: 'This record has been updated by HQ and cannot be edited',
                                                        cancelable: true
                                                    });
                                                    clearQuickAddInputs();
                                                    break;
                                            }


                                        }).catch(function (err) {

                                            if (err.status == 404) {
                                                console.log('404 no prior record putting a new record');
                                                tableUpdateFunction(patrolLog, false);
                                                orientationLandscapeUpdate();
                                                clearQuickAddInputs();
                                                return basedb.put(patrolLog);

                                            } else if (err.status == 409) {
                                                switch (doc.editable) {
                                                    case true:
                                                        console.log('409 putting anyway');
                                                        clearQuickAddInputs();
                                                        var patrolLogUpdate = {
                                                            _id: doc._id,
                                                            _rev: doc._rev,
                                                            patrol: sqPatrol,
                                                            base: base,
                                                            username: name,
                                                            timeIn: sqTimeIn,
                                                            timeOut: sqTimeOut,
                                                            timeWait: sqWait,
                                                            offRoute: '',
                                                            totalScore: sqTotalScore,
                                                            editable: true,
                                                            timestamp: timestamp
                                                        }
                                                        basedb.put(patrolLogUpdate).then(function () {
                                                            tableUpdateFunction(patrolLogUpdate, false);
                                                            orientationLandscapeUpdate();
                                                        });
                                                        break;
                                                    case false:
                                                        console.log('409 alert message');
                                                        ons.notification.alert({
                                                            title: 'No longer editable',
                                                            message: 'This record has been recorded by HQ and cannot be edited, please contact HQ to unlock',
                                                            cancelable: true
                                                        });
                                                        clearQuickAddInputs();
                                                        break;
                                                }
                                            }
                                        });
                                    break;
                            }
                        }
                    });
                }
                break;

                // --- map page ---
            case 'map.html':

                ons.disableDeviceBackButtonHandler();
                if (!$('#mapBackButton').hasClass('evtHandler')) {
                    $('#mapBackButton').addClass('evtHandler');
                    $('#mapBackButton').on('click', function () {
                        mapBackButton();
                    });
                }
                break;

                // --- Admin page ---
                // these look similar but are seperate for admin and base users
            case 'admin.html':
                //declarations
                var patrolToSearch;

                menuController('admin.html');
                // ons.disableDeviceBackButtonHandler();
                // $('#opFounderMenu').append('<ons-list-item onclick="cleanAll()" tappable class= "adminCleanAll">Clean All Databases</ons-list-item>');
                if (navi.topPage.data.eventInfo != undefined) {
                    var eventInfo = navi.topPage.data.eventInfo;
                    adminDatabaseName = eventInfo.dbName;
                }


                // -- table selection and actions --
                var adminSpeedDial = document.getElementById('adminSpeedDial');
                adminSpeedDial.hide();
                adminCurrentlySelected = [];
                // from loginandrunfunction
                var teams = {};
                var admin = true;
                if (admindbConnected == false) {
                    admindb = new PouchDB(adminDatabaseName);
                    admindbConnected = true;
                }

                admindb.createIndex({
                    index: {
                        fields: ['timeOut'],
                        name: 'timeOutIndex',
                        ddoc: 'timeOutIndexDDoc',
                        type: 'json'
                    }
                }).then(function (doc) {
                    console.log(doc);
                    return admindb.createIndex({
                        index: {
                            fields: ['base', 'timeOut'],
                            name: 'baseTimeOutIndex',
                            ddoc: 'baseTimeOutIndexDDoc',
                            type: 'json'
                        }
                    });
                }).then(function (doc) {
                    return admindb.createIndex({
                        index: {
                            fields: ['patrol'],
                            name: 'patrolIndex',
                            ddoc: 'patrolIndexDDoc',
                            type: 'json'
                        }
                    });
                }).then(function (doc) {
                    return admindb.createIndex({
                        index: {
                            fields: ['base'],
                            name: 'baseIndex',
                            ddoc: 'baseIndexDDoc',
                            type: 'json'
                        }
                    });
                }).then(function (doc) {
                    return admindb.find({
                        selector: {
                            timeOut: {
                                $gt: null
                            }
                        },
                        sort: ['timeOut']
                    });
                }).then(function (doc) {
                    console.log(doc);
                    return updateTableFromFindQuery(doc, true);

                }).then(function (doc) {
                    if (remotedbConnected === false) {
                        remotedb = new PouchDB(remotedbURL);
                        remotedbConnected = true;
                    }
                    if (adminSyncInProgress === false) {
                        var syncOptions = {
                            live: true,
                            retry: true
                        };
                        adminSyncInProgress = true;
                        return adminSync = admindb.sync(remotedb, syncOptions)
                            .on('change', function (doc) {
                                // yo, something changed!

                                console.log(doc);
                                if (doc.direction == 'pull') {
                                    console.log('change occured in remote updating admindb');
                                    var change = doc.change;

                                    updateTableFromFindQuery(change, true, patrolToSearch);
                                } else {
                                    console.log('updating remotedb'); //fixme needs to do something with pushes
                                }
                            }).on('paused', function (info) {
                                // replication was paused, usually because of a lost connection
                                console.log('replication paused because of: ' + info);

                            }).on('active', function (info) {
                                // replication was resumed
                                console.log('replication resumed. Info: ' + info);

                            }).on('error', function (err) {
                                // totally unhandled error (shouldn't happen)
                                console.log('Replication Error: ' + err);
                            }).on('complete', function (info) {
                                console.log('sync disconected from admin database.');
                                adminSyncInProgress = false;
                            });
                    }
                }).catch(function (err) {
                    console.log(err);
                });
                // end of longinandrunfunction

                $('#adminSpeedDial').removeClass('hide');
                if (!($('#adminLogsTable').hasClass('evtHandler'))) {
                    $('#adminLogsTable').addClass('evtHandler').on('click', 'tr', function (e) {
                        if ($(this).hasClass('tableSelected')) {
                            $(this).removeClass('tableSelected');

                            var dataInfo = $(this).data('databaseInfo');
                            var index = adminCurrentlySelected.indexOf(dataInfo);
                            if (index > -1) {
                                adminCurrentlySelected.splice(index, 1);
                            }
                            console.log(adminCurrentlySelected);
                            if (!($('tr').hasClass('tableSelected'))) {
                                adminSpeedDial.hide();
                            }
                        } else if (e.shiftKey == true) {
                            $(this).addClass('tableSelected');
                            // $('#adminSpeedDial').removeClass('hide');
                            adminSpeedDial.show();
                            var dataInfo = $(this).data('databaseInfo');
                            adminCurrentlySelected.push(dataInfo);
                            console.log(adminCurrentlySelected);

                        } else {
                            $('tr').removeClass('tableSelected');
                            $(this).addClass('tableSelected');
                            // $('#adminSpeedDial').removeClass('hide');
                            adminSpeedDial.show();
                            //clear all previously selected items from the array
                            adminCurrentlySelected = [];
                            // to get the dbId's off the element
                            var dataInfo = $(this).data('databaseInfo');
                            console.log(dataInfo);
                            adminCurrentlySelected.push(dataInfo);
                            console.log(adminCurrentlySelected);
                        }
                    });
                }
                // button for deleting logs
                if (!($('#adminDelete').hasClass('evtHandler'))) {
                    $('#adminDelete').addClass('evtHandler');
                    /**
                     * Deletes the selected rows
                     * @event adminDelete clicked
                     */
                    $('#adminDelete').on('click', function () {
                        ons.notification.confirm({
                            title: 'Are you sure?',
                            message: 'Are you sure you wish to delete these ' + adminCurrentlySelected.length + ' logs',
                            cancelable: true
                        }).then(function (input) {
                            if (input == 1) {
                                deleteRecords(adminCurrentlySelected);
                            }
                        })
                    });
                }
                //button for locking logs as no longer editable
                if (!($('#adminLock').hasClass('evtHandler'))) {
                    /**
                     * Locks the selected rows
                     * @event adminLock clicked
                     */
                    $('#adminLock').addClass('evtHandler').on('click', function () {
                        lockOrUnlockLogFromEdits(adminCurrentlySelected, true);
                    });
                }
                if (!($('#adminUnlock').hasClass('evtHandler'))) {
                    $('#adminUnlock').addClass('evtHandler').on('click', function () {
                        lockOrUnlockLogFromEdits(adminCurrentlySelected, false);

                    });
                }

                if (!($('#adminCopyTable').hasClass('evtHandler'))) {
                    /**
                     * Copys the admin table to the clipboard as a full HTML table, this can be imported into MS Excel
                     * @event adminCopyTable clicked
                     */
                    $('#adminCopyTable').addClass('evtHandler').on('click', function () {
                        //console.log($('#adminLogsTable').html());
                        function copyToClipboard(element) {
                            var $temp = $("<input>");
                            $("body").append($temp);
                            $temp.val($('.copyMe').html()).select();
                            document.execCommand("copy");
                            $temp.remove();
                        }
                        copyToClipboard();
                        ons.notification.alert({
                            title: 'Admin logs table added to clipboard',
                            message: 'You have just added the whole admin logs table to your clipboard, paste into Microsoft Excel to view',
                            cancelable: true
                        })

                    });

                }
                if (!($('#patrolSearch').hasClass('evtHandler'))) {
                    $('#patrolSearch').addClass('evtHandler');
                    var appended = false;
                    var hidden = false;
                    /**
                     * Event handler for the patrol search bar being clicked on the admin page
                     * @event patrolSearch clicked
                     */
                    $('#patrolSearch').on('click', function () {
                        if (!(appended)) {
                            $(this).append('<ons-input id="patrolSearchInput" type="text" modifier="underbar" placeholder="Patrol No." float class="patrolSearchInput">');
                            appended = true;
                            $(document).ready(function () {
                                $('#patrolSearchInput').focus()
                                    .blur(function () {
                                        if ($(this).val() === '') {
                                            $(this).toggleClass('hide');
                                            hidden = true;
                                            admindb.find({
                                                selector: {
                                                    timeOut: {
                                                        $gt: null
                                                    }

                                                },

                                                sort: ['timeOut']
                                            }).then(function (doc) {
                                                console.log(doc);
                                                patrolToSearch = false;
                                                $('#adminLogsTable').empty();
                                                patrolRecordAdmin = [];
                                                offRouteIndexAdmin = [];
                                                updateTableFromFindQuery(doc, true);

                                            });

                                        }
                                    });
                            });

                            $('#patrolSearchInput').on('keydown', function (e) {
                                if (e.which === 13) {
                                    patrolToSearch = $(this).val();
                                    admindb.find({
                                        selector: {
                                            timeOut: {
                                                $gt: null
                                            },
                                            patrol: {
                                                $eq: patrolToSearch
                                            }
                                        },

                                        sort: ['timeOut']
                                    }).then(function (doc) {
                                        //TODO add a pause variable in here to only update this patrol's records
                                        console.log(doc);
                                        $('#adminLogsTable').empty();
                                        patrolRecordAdmin = [];
                                        offRouteIndexAdmin = [];
                                        updateTableFromFindQuery(doc, true);
                                    });
                                }
                            });
                        } else if (hidden) {
                            $('#patrolSearchInput').removeClass('hide');
                        }
                    });
                }


                // -- end of admin.html --
                break;

            case 'updatePage.html':
                // -- start of updatePage.html --
                var updateInfo, pageChange, options, updateInfo;
                //update the event and reset to last page using the data

                var updateInfo = navi.topPage.data;
                console.log(updateInfo);
                options = {
                    animation: pageChangeAnimation,
                    data: {
                        firstPage: true
                    }

                };
                closeDatabases();
                Promise.resolve().then(function () {
                    if (updateInfo.lastPage === undefined) {
                        throw 'no last page defined';
                    }
                    pageChange = navi.topPage.data.lastPage;
                    if (updateInfo.eventInfo != undefined) {
                        //information to update is already present just pass it to the page
                        return options.data.eventInfo = updateInfo.eventInfo;
                    } else if (updateInfo.event != undefined) {
                        var tempdb = new PouchDB(updateInfo.event);
                        return tempdb.get('eventDescription')
                            .then(function (doc) {
                                options.data.eventInfo = doc;
                            }).catch(function (err) {
                                throw err;
                            });
                    }
                }).then(function (info) {
                    navi.resetToPage(pageChange, options);
                }).catch(function (err) {
                    console.log(err);
                    ons.notification.alert({
                        title: 'Issue Updating',
                        message: 'There was an issue updating, please sign in again to fix',
                        cancelable: true
                    }).then(function () {
                        pageChange = 'signInPage.html';
                        navi.resetToPage(pageChange, options);
                    });
                });

                //-- end of updatePage.html --
                break;

                //to help debug issues
            default:
                console.log('the following page has been pushed and has no reference in the push page switch ' + navi.topPage.name);
                break;
        }
        // end of pushpage switch
    });

});

function downscaleImg(imgEl, maxWidth, maxHeight) {
    //needs work
    var stats = imgStats(imgEl);
    if (stats.width < maxWidth && stats.height < maxHeight) {
        console.log('img already small enough');
        return false; //img already small enough
    }
    var maxWidthForHeight = (maxHeight / stats.height) * stats.width;
    if (maxWidthForHeight < maxWidth) {
        console.log('height restricted');
        maxWidth = maxWidthForHeight;
    } else {
        console.log('width restricted');
        maxHeight = (maxWidth / stats.width) * stats.height;
    }
    var dimensions = {
        width: Math.floor(maxWidth),
        height: Math.floor(maxHeight)
    }
    return dimensions;
}
/**
 * Checks the dimensions of an image and returns the height width and ratio of the image
 * @param {object} imgEl image element (not JQuery or JQuery[0])
 * @returns {object} returns the height, width, ratio between height and width as well as whether the image is landscape or not
 */
function imgStats(imgEl) {
    var imgStats;
    try {
        var imgHeight = imgEl.naturalHeight,
            imgWidth = imgEl.naturalWidth,
            imgRatio = imgWidth / imgHeight,
            imgLandscape = true;

    } catch (err) {
        console.log(err);
    }
    if (imgHeight > imgWidth) {
        imgLandscape = false;
    }
    imgStats = {
        height: imgHeight,
        width: imgWidth,
        ratio: imgRatio,
        landscape: imgLandscape
    };
    return imgStats;
}

function stepped_scale(img, width, step) {
    if (step === undefined) {
        var step = 0.5;
    }
    return Promise.resolve().then(function () {
        var canvas = document.createElement('canvas'), //canvas the result ends up on
            ctx = canvas.getContext("2d");
        var oc = document.createElement('canvas'), //canvas used for intermedary steps
            octx = oc.getContext('2d');

        // -- stepped scaling --
        //var start = window.performance.now();

        canvas.width = width; // destination canvas size
        canvas.height = canvas.width * img.naturalHeight / img.naturalWidth; //width * ratio between image height and width

        if (img.width * step > width) { // For performance avoid unnecessary drawing
            var mul = 1 / step;
            var cur = {
                width: Math.floor(img.width * step),
                height: Math.floor(img.height * step)
            }

            oc.width = cur.width;
            oc.height = cur.height;

            octx.drawImage(img, 0, 0, cur.width, cur.height);

            while (cur.width * step > width) {
                cur = {
                    width: Math.floor(cur.width * step),
                    height: Math.floor(cur.height * step)
                };
                octx.drawImage(oc, 0, 0, cur.width * mul, cur.height * mul, 0, 0, cur.width, cur.height);
            }

            ctx.drawImage(oc, 0, 0, cur.width, cur.height, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        return canvas;
    }).then(function (canvas) {
        //document.getElementById("time-stepped").innerHTML = time_diff(start) + ' ms';
        // img.src = canvas.toDataURL();
        console.log('getting blob');
        return getCanvasBlob(canvas);


    }).then(function (blob) {
        console.log(blob);
        //getFile = blob;
        return blob;
    }).catch(function (err) {
        console.log(err);
    });
    // -- display canvas used for scaling --
    // document.getElementById("scale-canvas").src = oc.toDataURL();


}
/**
 * A function to turn canvas.toBlob as a promise
 * @param {object} canvas a canvas object
 * @returns {object} returns a blob from the canvas as a promise 
 */
function getCanvasBlob(canvas) {
    return new Promise(function (resolve, reject) {
        return canvas.toBlob(function (blob) {
            return resolve(blob);
        });
    });
}

function menuController() {
    switch (navi.topPage.name) {
        case 'page1.html':
            //allow for baseLogOut to be shown in the menu
            $('#baseLogOut').removeClass('hide').find('div.center').html('Leave Base');
            $('#goToMap').removeClass('hide');
            break;
        case 'admin.html':
            $('#baseLogOut').removeClass('hide').find('div.center').html('Leave Admin');
            $('#goToMap').removeClass('hide');
            break;
        case 'loginPage.html':
            menuEvtOrganiser();
            $('#baseLogOut').addClass('hide');
            $('#goToMap').removeClass('hide');
            break;
        case 'eventSelectionPage.html':
            $('#baseLogOut , #eventChanger , #eventEditor, #goToMap').addClass('hide');
            break;
        default:
            menuEvtOrganiser();
            $('#baseLogOut , #goToMap').addClass('hide');
            break;
    }
    console.log(navi.topPage.name + ' menu controller run');
}
/**
 * shows and hides the event editor option in the side menu
 */
function menuEvtOrganiser() {
    //allow the eventOrganisers to edit their current event
    if (localStorage.evtOrganiser === 'true') {
        console.log(localStorage.evtOrganiser);
        $('#eventEditor , #eventChanger').removeClass('hide');

    } else {
        $('#eventEditor , #eventChanger').addClass('hide');
    }
}