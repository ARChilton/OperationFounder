/*
This is the javascript for the operationFounder app
*/

// global variables
var baseCodes = ['opfounder123', 'adam', 'martin', '3', '4', '5', '6', 'roaming']; // MUST BE LOWER CASE
var appdb;
var basedb;
var remotedb;
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

function patrolRecordUpdate(patrol, offRoute, admin) {
    if (admin) {
        var index = patrolRecordAdmin.indexOf(patrol);
    } else {
        var index = patrolRecord.indexOf(patrol);
    }
    if (!(offRoute)) { //checks that it isn't an off route entry in which case we are happy to duplicate in the table
        if (index > -1) {
            return true;
        } else {
            patrolRecord.push(patrol);
            return false;
        }
    } else {
        return false; // returns without adding to the overwrite table list
    }


}


function destroyBasedb() {
    var x = new PouchDB('basedb').destroy().then(function () {
        ons.notification.alert('basedb database destroyed');
    });
    var y = new PouchDB('opFounderAppDb').destroy().then(function () {
        ons.notification.alert('opFounderAppDb database destroyed');
    });

}

function updateExisting(patrolNo, timeIn, timeOut, wait, offRoute, totalScore, editable, tableId, tableLogId) {

    $(tableLogId + patrolNo).html("<td class='bold'>" + patrolNo + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow'>" + offRoute + "</td><td>" + totalScore + "</td><td>" + editable + "</td>");

}

function updateAdminExisting(patrolNo, timeIn, timeOut, wait, offRoute, totalScore, editable, base, recordedBy, tableId, tableLogId) {

    $(tableLogId + patrolNo).html("<td class='bold'>" + patrolNo + "</td><td>" + base + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow'>" + offRoute + "</td><td class='hide landscapeShow'>" + totalScore + "</td><td class='hide landscapeShow'>" + recordedBy + "</td><td class='hide landscapeShow'>" + editable + "</td>");
}

function updateTable(patrolNo, timeIn, timeOut, wait, offRoute, totalScore, editable, tableId, tableLogId) {
    console.log(tableId + ' ' + tableLogId);
    $(tableId).prepend("<tr id='" + tableLogId + patrolNo + "'class=" + tableLogId + "'><td class='bold '>" + patrolNo + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow '>" + offRoute + "</td><td>" + totalScore + "</td><td>" + editable + "</td></tr>");

}

function updateAdminTable(patrolNo, timeIn, timeOut, wait, offRoute, totalScore, editable, base, recordedBy, tableId, tableLogId) {
    console.log(tableId + ' ' + tableLogId);
    $(tableId).prepend("<tr id='" + tableLogId + patrolNo + "' class='" + tableLogId + "'><td class='bold'>" + patrolNo + "</td><td>" + base + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow'>" + offRoute + "</td><td class='hide landscapeShow'>" + totalScore + "</td><td class='hide landscapeShow'>" + recordedBy + "</td><td class='hide landscapeShow'>" + editable + "</td></tr>");
}

function updateTableFromAllDocs(doc, admin) {

    for (var i = 0, l = doc.total_rows; i < l; i++) {
        console.log(doc.rows[i].doc.patrol);
        var path = doc.rows[i].doc;
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
            if (patrolRecordUpdate(path.patrol, path.offRoute, true)) {
                updateAdminExisting(path.patrol, path.timeIn, path.timeOut, path.wait, path.offRoute, path.totalScore, path.editable, path.base, path.username, '#adminLogsTable', tableLogId);
            } else {
                updateAdminTable(path.patrol, path.timeIn, path.timeOut, path.timeWait, path.offRoute, path.totalScore, path.editable, path.base, path.username, '#adminLogsTable', tableLogId);
            }

        } else {
            if (patrolRecordUpdate(path.patrol, path.offRoute, false)) {
                updateExisting(path.patrol, path.timeIn, path.timeOut, path.wait, path.offRoute, path.totalScore, path.editable, '#logsTable', tableLogId);
            } else {
                updateTable(path.patrol, path.timeIn, path.timeOut, path.timeWait, path.offRoute, path.totalScore, path.editable, '#logsTable', tableLogId);
            }

        }
    }
    orientationLandscapeUpdate();
}

function updateTableFromFindQuery(doc, admin) {

    console.log(tableId + ' ' + tableLogId);
    console.log('updating from find query');
    for (var i = 0, l = doc.docs.length; i < l; i++) {

        if (doc.docs[i].patrol.length > 0) {
            console.log(doc.docs[i].patrol);
            var path = doc.docs[i];
            if (admin || path.base === baseNumber) {
                if (admin == true) {
                    // tableId = '#adminLogsTable';
                    tableLogId = 'ad-log-';
                } else {
                    // tableId = '#logsTable'
                    tableLogId = 'log-';
                }
                if (path.offRoute) { // stops off route logs being updated automatically
                    tableLogId = tableLogId + '-or';
                }
                if (admin) {
                    if (patrolRecordUpdate(path.patrol, path.offRoute, true)) {
                        updateAdminExisting(path.patrol, path.timeIn, path.timeOut, path.wait, path.offRoute, path.totalScore, path.editable, path.base, path.username, '#adminLogsTable', tableLogId);
                    } else {
                        updateAdminTable(path.patrol, path.timeIn, path.timeOut, path.timeWait, path.offRoute, path.totalScore, path.editable, path.base, path.username, '#adminLogsTable', tableLogId);
                    }
                    orientationLandscapeUpdate();
                } else {
                    if (patrolRecordUpdate(path.patrol, path.offRoute, false)) {
                        updateExisting(path.patrol, path.timeIn, path.timeOut, path.wait, path.offRoute, path.totalScore, path.editable, '#logsTable', tableLogId);
                    } else {
                        updateTable(path.patrol, path.timeIn, path.timeOut, path.timeWait, path.offRoute, path.totalScore, path.editable, '#logsTable', tableLogId);
                    }
                }
            }
        }
    }
    orientationLandscapeUpdate();

}

function orientationLandscapeUpdate() {
    if (ons.orientation.isLandscape()) {
        $('.landscapeHide').addClass('hide');
        $('.landscapeShow').removeClass('hide');
    }
}

function orientationUpdates() {
    if (ons.orientation.isLandscape()) {
        $('.landscapeHide').addClass('hide');
        $('.landscapeShow').removeClass('hide');
    } else {
        $('.landscapeShow').addClass('hide');
        $('.landscapeHide').removeClass('hide');
    }
}

function clearQuickAddInputs() {
    $('.quickAddInput').val('');
    $('#wait').val('0');
    $('#offRoute').removeProp('checked');
}

function loginPut(doc) {
    appdb.put({
        _id: doc._id,
        _rev: doc._rev,
        base: base,
        name: name
    });
}

function logOutPageChange() {
    navi.bringPageTop('loginPage.html', {
        animation: 'none'
    });
    $('#userName').val(name);

}

function logOut() {
    // $('#logsTable').html('');
    logOutPageChange();
    document.getElementById('menu').toggle();

    appdb.get('login')
        .then(function (doc) {
            base = 999;

            appdb.put({
                _id: doc._id,
                _rev: doc._rev,
                base: base,
                name: name
            });
        })
        .catch(function (err) {
            console.log(err);
        });
}

/*function createIndex(db, index) {
    console.log('creating index');
    return db.createIndex({
        index: {
            fields: [index],
            name: index + 'Index',
            ddoc: index + 'designdoc',
            type: 'json'
        }
    }).then(function (result) {
        // yo, a result
        console.log('index:');
        console.log(result);
    }).catch(function (err) {
        // ouch, an error
        console.log('index:');
        console.log(err);
    });



}

function createBaseFilter(db) {
    // filter for bases
    console.log('creating base filter');
    return db.get('_design/basefilter').catch(function (err) {
        if (err.status == 404) {
            console.log('no base filter found, putting in db');
            basedb.put({
                _id: '_design/basefilter',
                filters: {
                    myfilter: function (doc, req) {
                        return doc.base === req.query.base || doc._id === '_design/basefilter' || doc._id === '_design/basedesigndoc';
                    }.toString()
                }

            }).then(function (response) {
                console.log(response);
            }).catch(function (err) {
                console.log(err);
            });
        }
    });
}

function dbFind(db, queryField, queryType, value, sortedBy) {
    console.log('trying to find');
    return db.find({
            selector: {
                query: {
                    queryType: value
                }
            },
            sort: [sortedBy]
        })
        .then(function (doc) {
            console.log(doc);
            updateTableFromFindQuery(doc);
        })
        .catch(function (err) {
            console.log(err);
        });
}*/

// Start of script here:
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
            var admindb = new PouchDB('admindb');
            remotedb = new PouchDB('http://central:vikings@vps358200.ovh.net:5984/founderhq');

            var syncOptions = {
                live: true,
                retry: true
            }
            admindb.sync(remotedb, syncOptions)
                .on('change', function (doc) {
                    // yo, something changed!

                    console.log(doc);
                    if (doc.direction == 'pull') {
                        console.log('change occured in remote updating basedb');
                        var change = doc.change;
                        updateTableFromFindQuery(change, true);
                    } else {
                        console.log('updating remotedb');
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
            admindb.createIndex({
                index: {
                    fields: ['timeOut']
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

            break; // end of admin user code
        case 7:
            // -- roaming user --
            navi.bringPageTop('roaming.html', {
                animation: 'none'
            });
            break; // end of roaming user code

        case 1: // -- base user --
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
            navi.bringPageTop('page1.html', {
                animation: 'fade'
            });

            $('.pageTitle').html('Base ' + base);
            $('.quickAddTitle').html('Add new log from base ' + base);
            baseNumber = base;
            basedb = new PouchDB('basedb');

            //create timeOut index
            basedb.createIndex({
                index: {
                    fields: ['timeOut']
                }
            }).then(function () {
                return basedb.find({
                    selector: {
                        timeOut: {
                            $gt: null
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
            });
            //.then(function () {
            //     basedb.get('_design/baseFilter')
            //         .catch(function (err) {
            //             if (err == 404) {
            //                 basedb.put({
            //                     "_id": "_design/baseFilter",
            //                     "filters": {
            //                         "by_base": function (doc, req) {
            //                             return doc.base === req.query.base || doc._id === "_design/baseFilter";
            //                         }.toString()
            //                     }
            //                 })
            //             }
            //         });
            // }).catch(function (err) {
            //     console.log(err);
            // });

            // find all docs sorted by timeOut

            // createIndex(basedb, timeOut);
            // dbFind(basedb, timeOut, $gt, null, timeOut);

            // basedb.allDocs({
            //         include_docs: true
            //     })
            //     .then(function (doc) {
            //         console.log(doc);
            //         updateTableFromAllDocs(doc, false);

            //     })
            //     .catch();

            //remotedb = new PouchDB('http://admin:f80caba00b47@couchdb-335dec.smileupps.com/founderhq');
            //remotedb = new PouchDB('http://localhost:5984/founderhq');
            remotedb = new PouchDB('http://central:vikings@vps358200.ovh.net:5984/founderhq');


            var syncOptions = {
                live: true,
                retry: true,
                filter: function (doc) {
                    return doc.base === baseNumber;
                }

            }
            /*var syncOptions = {
                   live: true,
                   retry: true
               }*/
            basedb.sync(remotedb, syncOptions)
                .on('change', function (doc) {
                    // yo, something changed!

                    console.log(doc);
                    if (doc.direction == 'pull') {
                        console.log('change occured in remote updating basedb');
                        var change = doc.change;
                        updateTableFromFindQuery(change, false);
                    } else {
                        console.log('updating remotedb');
                    }
                }).on('paused', function (info) {
                    // replication was paused, usually because of a lost connection
                }).on('active', function (info) {
                    // replication was resumed
                }).on('error', function (err) {
                    // totally unhandled error (shouldn't happen)
                    console.log(err);
                });




            // -- QuickAdd --

            // Control for the on or off route button
            $('.checkbox').on('click', '.checkbox__input', function () {

                if ($(this).is('.checkbox__input:checked')) {
                    $('#total').prop('disabled', true);
                } else {
                    $('#total').prop('disabled', false);
                }
            });

            // Clear quick submit entries
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

            // Quick submit code
            $('#submitQuick').on('click', function () {
                // set variables to the input values
                sqPatrol = $('#patrolNo').val();
                sqTimeIn = $('#timeIn').val();
                sqTimeOut = $('#timeOut').val();
                sqWait = $('#wait').val();
                sqOffRoute = $('#offRoute').prop('checked');
                sqTotalScore = $('#total').val();
                var missingInformationMessage = "";
                if (sqPatrol == "") {
                    missingInformationMessage = '<p>Patrol number</p>';
                }
                if (sqTotalScore == "" && sqOffRoute == false) {
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
                    if (sqTimeIn == "") {
                        var date = new Date();
                        sqTimeIn = date.toLocaleTimeString();
                    } else {
                        sqTimeIn = sqTimeIn + ':00';
                    }
                    if (sqTimeOut == "") {
                        var date = new Date();
                        sqTimeOut = date.toLocaleTimeString();
                    } else {
                        sqTimeOut = sqTimeOut + ':00';
                    }
                    if (sqWait == "") {
                        sqWait = 0;
                    }
                    if (sqTotalScore != "" && sqOffRoute) {
                        sqTotalScore = '';
                    }
                    var patrolLog = {
                        _id: sqPatrol + ' base ' + base,
                        patrol: sqPatrol,
                        base: base,
                        username: name,
                        timeIn: sqTimeIn,
                        timeOut: sqTimeOut,
                        timeWait: sqWait,
                        offRoute: sqOffRoute,
                        totalScore: sqTotalScore,
                        editable: true
                    }
                    // -- important if off route it is just added to the db
                    switch (sqOffRoute) {
                        case true:

                            var offRoutePatrolLog = {
                                _id: sqPatrol + ' base ' + base + ' offRoute@ ' + sqTimeOut,
                                patrol: sqPatrol,
                                base: base,
                                username: name,
                                timeIn: sqTimeIn,
                                timeOut: sqTimeOut,
                                timeWait: sqWait,
                                offRoute: sqOffRoute,
                                totalScore: sqTotalScore,
                                editable: true
                            }
                            updateTable(sqPatrol, sqTimeIn, sqTimeOut, sqWait, sqOffRoute, sqTotalScore, true);
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
                                                    basedb.put({
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
                                                        editable: true
                                                    }).then(function () {
                                                        updateExisting(sqPatrol, sqTimeIn, sqTimeOut, sqWait, sqOffRoute, sqTotalScore, true);
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
                                        updateTable(sqPatrol, sqTimeIn, sqTimeOut, sqWait, sqOffRoute, sqTotalScore, true);
                                        clearQuickAddInputs();
                                        return basedb.put(patrolLog);

                                    } else if (err.status == 409) {
                                        switch (doc.editable) {
                                            case true:
                                                console.log('409 putting anyway');
                                                clearQuickAddInputs();
                                                basedb.put({
                                                    _id: doc._id,
                                                    _rev: doc._rev,
                                                    base: base,
                                                    name: name,
                                                    timeIn: sqTimeIn,
                                                    timeOut: sqTimeOut,
                                                    timeWait: sqWait,
                                                    offRoute: sqOffRoute,
                                                    totalScore: sqTotalScore,
                                                    editable: true
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
    appdb = new PouchDB('opFounderAppDb');
    appdb.get('login').then(function (doc) { //this part next
            base = doc.base;
            name = doc.name;
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



    // ---  page change code ---

    document.addEventListener('postpush', function (event) {
        console.log('page pushed');

        // --- Log in Page ---

        if ($('#loginPage').length) {
            //loginPage.html
            ons.disableDeviceBackButtonHandler();
            $('.loginButton').on('click', function () {
                if ($('#baseCode').val != '' && $('#userName').val() != '') {
                    var baseCodeInput = $('#baseCode').val().toLowerCase();
                    name = $('#userName').val();
                    base = baseCodes.indexOf(baseCodeInput);

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
                                        name: name
                                    })
                                })
                                .catch(function (err) {
                                    appdb.put({
                                        _id: 'login',
                                        base: base,
                                        name: name
                                    }).then(function () {
                                        ons.notification.alert({
                                            title: 'Welcome ' + name,
                                            message: 'Welcome to the Operation Founder admin app, here you can view all team scores as they come in.',
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
                        } else if (base == 7) {
                            // roaming page 
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
                                        name: name
                                    }).then(function () {
                                        ons.notification.alert({
                                            title: 'Welcome ' + name,
                                            message: 'Welcome to the Operation Founder base app, here you can enter team scores and log their details. This will instantaniously update in HQ but please do still write down on paper too.',
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
        } // end of loginPage.html

        // --- Page 1 for normal bases ---
        if ($('#page1').length) {
            $('.pageTitle').html('Base ' + base);
            $('.quickAddTitle').html('Add new log from base ' + base);
        }

    });

});