/*
This is the javascript for the operationFounder app
*/

// global variables
var baseCodes = ['vikings', 'petal', 'peter', 'witch', 'homes', 'trees', 'horse', 'roaming']; // MUST BE LOWER CASE
var baseNames = ['HQ', 'Rose Revived', 'Hookwood', 'Dunks Green', 'Oxon Hoath', 'Beech Farm', 'Hope Farm', 'Roaming/Check Point']
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
var adminCurrentlySelected;
var userCurrentlySelected;



//database names
var adminDatabaseName = 'adminDB1';
var baseDatabaseName = 'baseDB1';
var appDatabaseName = 'oppFounderLoginDb';
var remotedbURL = 'http://central:vikings@vps358200.ovh.net:5984/founderhq_LIVE';

// map variables
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

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    // Now safe to use device APIs
    console.log('deviceready');
    if (cordova.platformId == 'android') {
        StatusBar.backgroundColorByHexString("#283593"); //#333 grey #00796B is 700 color for teal

    }

}
document.addEventListener("pause", onPause, false);

function onPause() {
    // Handle the pause event
    console.log('devicePaused');


}
document.addEventListener("resume", onResume, false);

function onResume() {
    // Handle the resume event
    console.log('deviceResume');


}



// destroys basedb and opFounderAppDb
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
// a clear all function which is not currently available from the GUI
function cleanAll() {
    ons.notification.prompt({
        title: 'Clean all databases',
        messageHTML: '<p>You are about to delete all items from the central database, this will propagate out to all other devices, are you sure you want to do this?</p><p>If yes please enter the admin passcode used to access the admin portion of the app</p>',
        cancelable: true,
        placeholder: 'Enter admin code here',
    }).then(function (input) {
        if (input.toLowerCase() == baseCodes[0]) {
            console.log('you have ended the world');
            admindb.allDocs().then(function (doc) {
                for (var i = 0, l = doc.total_rows; i < l; i++) {

                    var path = doc.rows[i];
                    var testForDesignDocs = '_design'
                    console.log(path.id + ' ' + path.value.rev);
                    if (testForDesignDocs.test(path.id)) {
                        var deletedRecord = {
                            _id: path.id,
                            _rev: path.value.rev
                        }
                        var options = {
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

//show map page
function goToMap() {
    navi.bringPageTop('map.html', {
        animation: 'none'
    }).then(function () {
        map.invalidateSize();
    });
    // setTimeout(function () {
    //     map.invalidateSize()
    // }, 200);

    document.getElementById('menu').toggle();
    map.locate({
        setView: false,
        // maxZoom: map.getZoom(),
        watch: true,
        enableHighAccuracy: true
    });

}

function mapBackButton() {
    map.stopLocate();

    switch (getBaseNumber()) {
        case 0:
            navi.bringPageTop('admin.html', {
                animation: 'fade'
            });
            break;
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
            navi.bringPageTop('page1.html', {
                animation: 'fade'
            });
            break;
        default:

            navi.bringPageTop('loginPage.html', {
                animation: 'fade'
            });
            ons.notification.alert({
                title: 'error',
                message: 'An error has occured and have returned to the login screen, please log again',
                cancelable: true
            });
    }
}

function createMap() {
    if (!(mapMade)) {
        //map centred on Hadlow // pick up here   
        // setTimeout(function () {
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


        // }, 1000);

        mapMade = true;

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

// keeps track of which patrol entries have already been input
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
            return false; // returns without adding to the overwrite table list
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
            return false; // returns without adding to the overwrite table list
        }
    }



}
// functions to update the table or row according to the update table function
function updateExisting(dbId, patrolNo, timeIn, timeOut, wait, offRoute, totalScore, editable, tableId, tableLogId) {
    var trId = dbId;
    $('#' + trId).html("<td class='bold'>" + patrolNo + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow'>" + offRoute + "</td><td>" + totalScore + "</td><td class='hide landscapeShow editable'>" + editable + "</td>");
}

function updateAdminExisting(dbId, patrolNo, timeIn, timeOut, wait, offRoute, totalScore, editable, base, recordedBy, tableId, tableLogId) {
    var trId = dbId;
    //without checkboxes
    $('#' + trId).html("<td class='bold'>" + patrolNo + "</td><td>" + base + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow'>" + offRoute + "</td><td class='hide landscapeShow'>" + totalScore + "</td><td class='hide landscapeShow'>" + recordedBy + "</td><td class='hide landscapeShow editable'>" + editable + "</td>");
    //with checkboxes
    //$('#' + tableLogId + patrolNo + '-' + base).html("<td class='hide landscapeShow'><ons-input type='checkbox'></ons-input></td><td class='bold'>" + patrolNo + "</td><td>" + base + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow'>" + offRoute + "</td><td class='hide landscapeShow'>" + totalScore + "</td><td class='hide landscapeShow'>" + recordedBy + "</td><td class='hide landscapeShow editable'>" + editable + "</td>");

}

function updateTable(dbId, patrolNo, timeIn, timeOut, wait, offRoute, totalScore, editable, tableId, tableLogId) {
    // console.log(tableId + ' ' + tableLogId);
    var trId = dbId;
    $(tableId).prepend("<tr id='" + trId + "'class=" + tableLogId + "'><td class='bold '>" + patrolNo + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow'>" + offRoute + "</td><td>" + totalScore + "</td><td class='hide landscapeShow editable'>" + editable + "</td></tr>");
    $('#' + trId).data('databaseInfo', {
        dbId: dbId,
        trId: trId,
    });
}

function updateAdminTable(dbId, patrolNo, timeIn, timeOut, wait, offRoute, totalScore, editable, base, recordedBy, tableId, tableLogId) {
    console.log(dbId);
    var trId = dbId;
    // without checkboxes
    $(tableId).prepend("<tr id='" + trId + "' class='" + tableLogId + "'><td class='bold'>" + patrolNo + "</td><td>" + base + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow'>" + offRoute + "</td><td class='hide landscapeShow'>" + totalScore + "</td><td class='hide landscapeShow'>" + recordedBy + "</td><td class='hide landscapeShow editable'>" + editable + "</td></tr>");
    //with checkboxes

    // $(tableId).prepend("<tr id='" + trId + "' class='" + tableLogId + "'><td class='hide landscapeShow'><ons-input type='checkbox'></ons-input></td><td class='bold'>" + patrolNo + "</td><td>" + base + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow'>" + offRoute + "</td><td class='hide landscapeShow'>" + totalScore + "</td><td class='hide landscapeShow'>" + recordedBy + "</td><td class='hide landscapeShow editable'>" + editable + "</td></tr>");
    $('#' + trId).data('databaseInfo', {
        dbId: dbId,
        trId: trId,
    });

}
//standard update table or update exisiting row calling function
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

    } else {
        if (patrolRecordUpdate(path._id, path.offRoute, false)) {
            updateExisting(path._id, path.patrol, path.timeIn, path.timeOut, path.timeWait, path.offRoute, path.totalScore, path.editable, '#logsTable', tableLogId);
        } else {
            updateTable(path._id, path.patrol, path.timeIn, path.timeOut, path.timeWait, path.offRoute, path.totalScore, path.editable, '#logsTable', tableLogId);
        }

    }
}
// updates the table at the bottom of the screen on page1.html and admin.html from a find query or any input with doc.rows
function updateTableFromAllDocs(doc, admin) {

    for (var i = 0, l = doc.total_rows; i < l; i++) {

        var path = doc.rows[i].doc;
        tableUpdateFunction(path, admin);
    }
    orientationLandscapeUpdate();
}
// updates the table at the bottom of the screen on page1.html and admin.html from a find query or any input with doc.docs
function updateTableFromFindQuery(doc, admin) {

    console.log('updating from find query');
    for (var i = 0, l = doc.docs.length; i < l; i++) {

        if (doc.docs[i].patrol.length > 0) {

            var path = doc.docs[i];
            tableUpdateFunction(path, admin);
        }
    }
    orientationLandscapeUpdate();

}
//checks the orientation and updates the GUI accordingly, landscape only
function orientationLandscapeUpdate() {
    if (ons.orientation.isLandscape()) {
        $('.landscapeHide').addClass('hide');
        $('.landscapeShow').removeClass('hide');
    }
}
//for an orientation change this picks up both portrait and landscape
function orientationUpdates() {
    if (ons.orientation.isLandscape()) {
        $('.landscapeHide').addClass('hide');
        $('.landscapeShow').removeClass('hide');
    } else {
        $('.landscapeShow').addClass('hide');
        $('.landscapeHide').removeClass('hide');
    }
}
// clear inputs on page1.html
function clearQuickAddInputs() {
    $('.quickAddInput').val('');
    $('#wait').val('0');
    $('#offRoute').removeProp('checked');
    $('#total').prop('disabled', false);

}
// User Edit function
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
                            message: 'This record has been updated by HQ and cannot be edited',
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

//Delete function ONLY FOR ADMINs as it only works on admindb
function deleteRecords(deleteDocs) {
    var deletedDocsLength = deleteDocs.length;
    var timestamp = new Date().toISOString();
    //deleteDocs should be an array of database _id values for updating to status deleted = true
    for (var i = 0, l = deletedDocsLength; i < l; i++) {
        var id = deleteDocs[i].dbId;
        var trId = deleteDocs[i].trId;

        admindb.get(id)
            .then(function (doc) {
                admindb.put({
                    _id: id,
                    _rev: doc._rev,
                    username: name,
                    timestamp: timestamp,
                    _deleted: true
                })
            }).catch(function (err) {
                if (err.status != 404) {
                    admindb.put({
                        _id: id,
                        _rev: doc._rev,
                        username: name,
                        timestamp: timestamp,
                        _deleted: true
                    });
                }
                //else if (err.status == 404) {
                //     ons.notification.alert({
                //         title: '404 not found',
                //         message: 'The record you are trying to delete was not found, this might be because someone else has just deleted it.'
                //     })
            });
        $('#' + trId).remove();
    }

    ons.notification.alert({
        title: deletedDocsLength + ' logs deleted',
        message: 'You have set ' + deletedDocsLength + ' to deleted. This has updated the record to deleted but has not removed all previous records from the database. To undo the deletion will require database admin privaledges.',
        cancelable: true
    });

}




//Lock from editing any further function
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



//Show on Map function //unfinished!!
function showOnMap(locations) {
    var locationsLength = locations.length;
    for (var i = 0, l = locationsLength; i < l; i++) {
        var id = lockDocs[i].dbId;

    }

}

//show locked logs

//network connection
function checkConnection() {
    var networkState = navigator.connection.type;
    return networkState;

}
//-- log in and out functions
function loginPut(doc) {
    var timestamp = new Date().toISOString();
    appdb.put({
        _id: doc._id,
        _rev: doc._rev,
        base: base,
        name: name,
        timestamp: timestamp
    });
}

function logOutPageChange() {
    navi.bringPageTop('loginPage.html', {
        animation: 'none'
    });
    $('#userName').val(name);
    $('#baseCode').val('');
    $('.adminCleanAll').remove();

}

function logOut() {
    $('#logsTable').empty();
    logOutPageChange();
    document.getElementById('menu').toggle();
    offRouteIndex = [];
    offRouteIndexAdmin = [];
    patrolRecord = [];
    patrolRecordAdmin = [];

    appdb.get('login')
        .then(function (doc) {
            base = 999;
            var timestamp = new Date().toISOString();
            appdb.put({
                _id: doc._id,
                _rev: doc._rev,
                base: base,
                name: name,
                timestamp: timestamp
            });
        })
        .catch(function (err) {
            console.log(err);
        });
}

function getBaseNumber() {
    return base;
}

function loginAndRunFunction(base) {
    switch (base) {
        case 999:
            //-- logged out user --
            logOutPageChange();
            break; // end of logged out user code
        case 0:
            // -- admin user --
            navi.bringPageTop('admin.html', {
                animation: 'none'
            });


            var admin = true;
            if (admindbConnected == false) {
                admindb = new PouchDB(adminDatabaseName);
                admindbConnected = true;
            }

            admindb.createIndex({
                index: {
                    fields: ['timeOut'],
                    name: 'admintimeOutIndex',
                    ddoc: 'admintimeOutIndexDDoc',
                    type: 'json'
                }
            }).then(function (doc) {
                console.log(doc);
                admindb.createIndex({
                    index: {
                        fields: ['base', 'timeOut'],
                        name: 'adminbaseTimeOutIndex',
                        ddoc: 'adminbaseTimeOutIndexDDoc',
                        type: 'json'
                    }
                }).then(function () {
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
                    updateTableFromFindQuery(doc, true);
                });;
            }).then(function () {
                if (remotedbConnected == false) {
                    remotedb = new PouchDB(remotedbURL);
                    remotedbConnected = true;
                }
                if (adminSyncInProgress == false) {
                    var syncOptions = {
                        live: true,
                        retry: true
                    }
                    syncInProgress = true;
                    admindb.sync(remotedb, syncOptions)
                        .on('change', function (doc) {
                            // yo, something changed!

                            console.log(doc);
                            if (doc.direction == 'pull') {
                                console.log('change occured in remote updating basedb');
                                var change = doc.change;
                                updateTableFromFindQuery(change, true);
                            } else {
                                console.log('updating remotedb'); //fixme needs to do something with pushes
                            }
                        }).on('paused', function (info) {
                            // replication was paused, usually because of a lost connection
                            console.log(info);
                        }).on('active', function (info) {
                            // replication was resumed
                            console.log(info);
                        }).on('error', function (err) {
                            // totally unhandled error (shouldn't happen)
                            console.log(err);
                        });
                }
            }).catch(function (err) {
                console.log(err);
            });

            break; // end of admin user code


        case 1: // -- base user --
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
            navi.bringPageTop('page1.html', {
                animation: 'fade'
            });

            if (!(base == 7)) {
                $('.pageTitle').html('Base ' + base + ' @ ' + baseNames[base]);
                $('.quickAddTitle').html('Add new log from base ' + base);

            } else {
                $('.pageTitle').html(baseNames[base]);
                $('.quickAddTitle').html('Record the teams you see');
                $('#tableTitle').html('Teams seen')

            }
            $('#logsTable').empty();

            if (basedbConnected == false) {
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
                basedb.createIndex({
                    index: {
                        fields: ['base', 'timeOut'],
                        name: 'baseTimeOutIndex',
                        ddoc: 'baseTimeOutIndexDDoc',
                        type: 'json'
                    }
                })
            }).then(function (doc) {
                basedb.createIndex({
                    index: {
                        fields: ['patrol'],
                        name: 'patrolIndex',
                        ddoc: 'patrolIndexDDoc',
                        type: 'json'
                    }
                });

            }).then(function (doc) {
                console.log(doc);
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
                updateTableFromFindQuery(doc, false);
            }).then(function () {
                basedb.createIndex({
                    index: {
                        fields: ['base']
                    }
                });

            }).then(function () {
                if (remotedbConnected == false) {
                    remotedb = new PouchDB(remotedbURL);
                    remotedbConnected = true;
                }

                // var syncOptions = {
                //     live: true,
                //     retry: true,
                //     filter: 'baseFilter1/by_base'

                // }
                if (baseSyncInProgress == false) {
                    var syncOptions = {
                        live: true,
                        retry: true
                    }
                    basedb.sync(remotedb, syncOptions)
                        .on('change', function (doc) {
                            // yo, something changed!

                            console.log(doc);
                            if (doc.direction == 'pull') {
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
                        });
                }
            }).catch(function (err) {
                console.log(err);
            });






            // -- QuickAdd --

            // Control for the on or off route button
            if (!($('#offRouteCheckbox').hasClass('evtHandler'))) {
                $('#offRouteCheckbox').addClass('evtHandler');
                $('.checkbox').on('click', '.checkbox__input', function () {
                    if ($('#offRoute.checkbox__input').is('.checkbox__input:checked')) {
                        $('#total').prop('disabled', true);
                    } else {
                        $('#total').prop('disabled', false);
                    }
                });
            }
            var editFab = document.getElementById('fullEditFab');
            editFab.hide();
            userCurrentlySelected = [];
            $('#fullEditFab').removeClass('hide');
            if (!($('#logsTable').hasClass('evtHandler'))) {
                $('#logsTable').addClass('evtHandler');
                $('#logsTable').on('click', 'tr', function (e) {
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
                        adminCurrentlySelected = [];
                        // to get the dbId's off the element
                        var dataInfo = $(this).data('databaseInfo');
                        userCurrentlySelected.push(dataInfo);
                        console.log(userCurrentlySelected);
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

                    if (sqPatrol == "") {
                        missingInformationMessage = '<p>Patrol number</p>';
                    }
                    if (sqTotalScore == "" && sqOffRoute == false && base != 7) {
                        missingInformationMessage = missingInformationMessage + '<p>Total score for the patrol</p>';
                    }
                    if (missingInformationMessage != "") {
                        ons.notification.alert({
                            title: 'Missing fields',
                            messageHTML: '<p>This log entry is missing the following fields:</p>' + missingInformationMessage,
                            cancelable: true
                        });
                    } else if (sqTotalScore > 25) {
                        ons.notification.alert({
                            title: 'Total score',
                            message: 'the total score entered is greater than the maximum points available at a base',
                            cancelable: true
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
                        if (sqTimeIn == "") {
                            var date = new Date();
                            sqTimeIn = date.toLocaleTimeString();
                        } else if (sqTimeIn.length == 5) {
                            sqTimeIn = sqTimeIn + ':00';
                        }
                        if (sqTimeOut == "") {
                            var date = new Date();
                            sqTimeOut = date.toLocaleTimeString();
                        } else if (sqTimeOut.length == 5) {
                            sqTimeOut = sqTimeOut + ':00';
                        }
                        if (sqWait == "") {
                            sqWait = 0;
                        }
                        if (sqTotalScore != "" && sqOffRoute || base == 7) {
                            sqTotalScore = '';
                        }

                        var patrolLog = {
                            _id: sqPatrol + '_base_' + base,
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
                                clearQuickAddInputs();
                                basedb.put(offRoutePatrolLog);
                                break;
                            case false:
                                basedb.get(patrolLog._id)
                                    .then(function (doc) {
                                        switch (doc.editable) {
                                            case true:
                                                ons.notification.confirm({
                                                    title: 'Update',
                                                    message: 'Are you sure you want to update patrol number ' + sqPatrol,
                                                    cancelable: true
                                                }).then(function (input) {
                                                    if (input == 1) {
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
                                                            offRoute: sqOffRoute,
                                                            totalScore: sqTotalScore,
                                                            editable: true,
                                                            timestamp: timestamp
                                                        }
                                                        basedb.put(patrolLogUpdate).then(function () {
                                                            tableUpdateFunction(patrolLogUpdate, false);
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
                                                        offRoute: sqOffRoute,
                                                        totalScore: sqTotalScore,
                                                        editable: true,
                                                        timestamp: timestamp
                                                    }
                                                    basedb.put(patrolLogUpdate).then(function () {
                                                        tableUpdateFunction(patrolLogUpdate, false);
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
            break; // end of page 1 for bases code

        default:
            // --- incorrect login information
            alert('incorrect login information saved, please log in again');
            console.log(err);
            navi.bringPageTop('loginPage.html', {
                animation: 'none'
            });
            break;
    }

}
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
    // Opens the menu and adds the shadow on the right edge
    function openMenu() {
        document.getElementById('menu').toggle();
        $('#menu').addClass('menuShadow');
    }
    // closes the menu
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

    // --- login function ---
    if (appdbConnected == false) {
        appdb = new PouchDB(appDatabaseName);
        appdbConnected = true;
    }
    appdb.get('login').then(function (doc) { //this part next
            base = doc.base;
            name = doc.name;
            appdbConnected = true;
            loginAndRunFunction(base);
        })
        .catch(function (err) {
            // no log in info at all.. show log in screen
            console.log('no log in info at all.. show log in screen');
            console.log(err);
            navi.bringPageTop('loginPage.html', {
                animation: 'none'
            });

        });

    if (ons.platform.isWebView()) {


        document.addEventListener("offline", onOffline, false);

        function onOffline() {
            // Handle the offline event
            $('.logTable').before('<div class="offlineMessage"><ons-icon icon="md-refresh-sync-alert"></ons-icon> Offline - sync to HQ will resume when online<div>');
        }

        document.addEventListener("online", onOnline, false);

        function onOnline() {
            // Handle the online event
            $('.offlineMessage').remove();

            //alert('congrats you are online, connected via: ' + checkConnection());

        }
    }
    navi.insertPage(0, 'map.html').then(function () {
        createMap();
    });



    // ---  page change code ---

    document.addEventListener('postpush', function (event) {
        console.log('page pushed');

        // --- Log in Page ---

        if ($('#loginPage').length) {
            //loginPage.html
            ons.disableDeviceBackButtonHandler();
            if (!($('.loginButton').hasClass('evtHandler'))) {
                $('.loginButton').addClass('evtHandler');
                $('.loginButton').on('click', function () {
                    if ($('#baseCode').val != '' && $('#userName').val() != '') {
                        var baseCodeInput = $('#baseCode').val().toLowerCase();
                        name = $('#userName').val();
                        base = baseCodes.indexOf(baseCodeInput);
                        var timestamp = new Date().toISOString();
                        if (base > -1) {
                            //  good
                            ons.enableDeviceBackButtonHandler();
                            if (base == 0) {
                                // navi.bringPageTop('admin.html', {
                                //     animation: 'fade'
                                // });

                                appdb.get('login').then(function (doc) {
                                        appdb.put({
                                            _id: doc._id,
                                            _rev: doc._rev,
                                            base: base,
                                            name: name,
                                            timestamp: timestamp

                                        })
                                    })
                                    .catch(function (err) {
                                        appdb.put({
                                            _id: 'login',
                                            base: base,
                                            name: name,
                                            timestamp: timestamp
                                        }).then(function () {
                                            ons.notification.alert({
                                                title: 'Welcome ' + name,
                                                message: 'Welcome to the Operation Founder admin app, here you can view all team scores as they come in. If you are using a mobile device, rotate your screen to see more information.',
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
                                loginAndRunFunction(base);
                                // } else if (base == 7) {
                                //     // roaming page 
                            } else {
                                console.log('pass your base is ' + base);
                                // navi.bringPageTop('page1.html', {
                                //     animation: 'fade'
                                // });
                                appdb.get('login').then(function (doc) {
                                        loginPut(doc);
                                    })
                                    .catch(function () {
                                        appdb.put({
                                            _id: 'login',
                                            base: base,
                                            name: name,
                                            timestamp: timestamp
                                        }).then(function () {
                                            ons.notification.alert({
                                                title: 'Welcome ' + name,
                                                message: 'Welcome to the Operation Founder base app, here you can enter team scores and log their details. This will instantaniously update in HQ but please do still write down on paper too. If you rotate your device you will see only the log table but in more detail.',
                                                cancelable: true
                                            });
                                        }).catch(function (err) {
                                            console.log(err);
                                            ons.notification.alert({
                                                title: 'Error saving user',
                                                message: 'You have logged in but there was an error saving your user credentials, the app will require you to log in again if you close it.',
                                                cancelable: true
                                            });
                                        });

                                    });
                                loginAndRunFunction(base);
                            }
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
                            message: 'Please enter both your name and your base code provided by the event organisers',
                            title: 'Missing inputs',
                            cancelable: true
                        });

                    }
                });
            }
        } // end of loginPage.html

        // --- Page 1 for normal bases ---
        if ($('#page1').length) {
            $('.pageTitle').html('Base ' + base + ' @ ' + baseNames[base]);
            $('.quickAddTitle').html('Add new log from base ' + base);



        }

        // these look similar but are seperate for admin and base users
        if ($('#adminPage').length) {

            // $('#opFounderMenu').append('<ons-list-item onclick="cleanAll()" tappable class= "adminCleanAll">Clean All Databases</ons-list-item>');
            // -- table selection and actions --
            var adminSpeedDial = document.getElementById('adminSpeedDial');
            adminSpeedDial.hide();
            adminCurrentlySelected = [];
            $('#adminSpeedDial').removeClass('hide');
            if (!($('#adminLogsTable').hasClass('evtHandler'))) {
                $('#adminLogsTable').addClass('evtHandler');
                $('#adminLogsTable').on('click', 'tr', function (e) {
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
                        adminCurrentlySelected.push(dataInfo);
                        console.log(adminCurrentlySelected);
                    }
                });
            }
            // button for deleting logs
            if (!($('#adminDelete').hasClass('evtHandler'))) {
                $('#adminDelete').addClass('evtHandler');
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
                $('#adminLock').addClass('evtHandler');
                $('#adminLock').on('click', function () {
                    lockOrUnlockLogFromEdits(adminCurrentlySelected, true);
                });
            }
            if (!($('#adminUnlock').hasClass('evtHandler'))) {
                $('#adminUnlock').addClass('evtHandler');
                $('#adminUnlock').on('click', function () {
                    lockOrUnlockLogFromEdits(adminCurrentlySelected, false);
                });
            }
            if (!($('#patrolSearch').hasClass('evtHandler'))) {
                $('#patrolSearch').addClass('evtHandler');
                var appended = false;
                var hidden = false;
                $('#patrolSearch').on('click', function () {
                    if (!(appended)) {
                        $(this).append('<ons-input id="patrolSearchInput" type="number" modifier="underbar" placeholder="Patrol No." float class="patrolSearchInput">');
                        appended = true;
                        $(document).ready(function () {
                            $('#patrolSearchInput').focus();
                            $('#patrolSearchInput').blur(function () {
                                if ($(this).val() == '') {
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
                                        $('#adminLogsTable').empty();
                                        patrolRecordAdmin = [];
                                        offRouteIndexAdmin = [];
                                        updateTableFromFindQuery(doc, true);
                                    });

                                }
                            });
                        });

                        $('#patrolSearchInput').on('keydown', function (e) {
                            if (e.which == 13) {
                                var patrolToSearch = $(this).val();
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



        }



    });

});