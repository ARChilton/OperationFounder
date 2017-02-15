/*
This is the javascript for the operationFounder app
*/

// global variables
var baseCodes = ['opFounder123', 'adam', 'martin'];
var appdb;
var basedb;
var remotedb;
// login variables
var base;
var name;
// Quick submit variables
var sqPatrol;
var sqTimeIn;
var sqTimeOut;
var sqWait;
var sqOffRoute;
var sqTotalScore;

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

function updateExisting(patrolNo, timeIn, timeOut, wait, offRoute, totalScore, editable) {
    $('#log-' + patrolNo).html("<td>" + patrolNo + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow mdl-data-table__cell--non-numeric'>" + offRoute + "</td><td>" + totalScore + "</td>");
}

function updateTable(patrolNo, timeIn, timeOut, wait, offRoute, totalScore, editable) {
    $('#logsTable').append("<tr id='log-" + patrolNo + "'><td>" + patrolNo + "</td><td>" + timeIn + "</td><td>" + timeOut + "</td><td class='hide landscapeShow'>" + wait + "</td><td class='hide landscapeShow mdl-data-table__cell--non-numeric'>" + offRoute + "</td><td>" + totalScore + "</td></tr>");
}

function updateTableFromDb(doc) {
    for (var i = 0, l = doc.total_rows; i < l; i++) {
        console.log(doc.rows[i].doc.patrol);
        var path = doc.rows[i].doc;
        updateTable(path.patrol, path.timeIn, path.timeOut, path.wait, path.offRoute, path.totalScore, path.editable);
        orientationLandscapeUpdate();
    }
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
    $('.menuButton').on("click", function () {
        openMenu();
    })

    // login function
    appdb = new PouchDB('opFounderAppDb');
    appdb.get('login').then(function (doc) {
            base = doc.base;
            $('.pageTitle').append('Base ' + base);
            $('.quickAddTitle').append(base);
        })
        .catch(function (err) {
            console.log(err);
            navi.bringPageTop('loginPage.html', {
                animation: 'none'
            });

        });

    basedb = new PouchDB('basedb');
    remotedb = new PouchDB('http://ARChilton:2326@192.168.1.10:5984/founderhq');
    basedb.sync(remotedb, {
        live: true,
        retry: true
    }).on('change', function (change) {
        // yo, something changed!
        console.log(change);
    }).on('paused', function (info) {
        // replication was paused, usually because of a lost connection
    }).on('active', function (info) {
        // replication was resumed
    }).on('error', function (err) {
        // totally unhandled error (shouldn't happen)
        console.log(err);
    });
    basedb.allDocs({
            include_docs: true
        })
        .then(function (doc) {
            updateTableFromDb(doc);
        })
        .catch();

    //listens to onsenui event for the splitter menu closing line 22815 of onsenui.js
    //removes the shadow when the menu closes
    $('#menu').on('postclose', function () {
        console.log('menu closed');
        $('#menu').removeClass('menuShadow');
    });

    // QuickAdd
    $('.checkbox').on('click', '.checkbox__input', function () {

        if ($(this).is('.checkbox__input:checked')) {
            $('#total').prop('disabled', true);
        } else {
            $('#total').prop('disabled', false);
        }
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
                messageHTML: '<p>Please fill in the following fields:</p>' + missingInformationMessage,
                cancelable: true
            });
        } else {
            if (sqTimeIn == "") {
                var date = new Date();
                sqTimeIn = date.toLocaleTimeString();
            }
            if (sqTimeOut == "") {
                var date = new Date();
                sqTimeOut = date.toLocaleTimeString();
            }
            if (sqWait == "") {
                sqWait = 0;
            }
            if (sqTotalScore != "" && sqOffRoute) {
                sqTotalScore = '';
            }
            var patrolRecord = {
                _id: sqPatrol + ' base ' + base,
                patrol: sqPatrol,
                base: base,
                timeIn: sqTimeIn,
                timeOut: sqTimeOut,
                timeWait: sqWait,
                offRoute: sqOffRoute,
                totalScore: sqTotalScore,
                editable: true
            }
            basedb.get(patrolRecord._id)
                .then(function (doc) {
                    switch (doc.editable) {
                        case true:
                            ons.notification.confirm({
                                title: 'Update',
                                message: 'Are you sure you want to update patrol number ' + sqPatrol,
                                cancelable: true
                            }).then(function (input) {
                                if (input == 1) {
                                    basedb.put({
                                        _id: doc._id,
                                        _rev: doc._rev,
                                        patrol: sqPatrol,
                                        base: base,
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
                            break;
                    }


                }).catch(function (err) {
                    if (err.status == 404) {
                        console.log('404 no prior record putting a new record');
                        updateTable(sqPatrol, sqTimeIn, sqTimeOut, sqWait, sqOffRoute, sqTotalScore, true);
                        return basedb.put(patrolRecord);

                    } else if (err.status == 409) {
                        switch (doc.editable) {
                            case true:
                                console.log('409 putting anyway');
                                basedb.put({
                                    _id: doc._id,
                                    _rev: doc._rev,
                                    base: base,
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
                                break;
                        }
                    }
                });

        }
    });

    // page change code
    document.addEventListener('postpush', function (event) {
        console.log('page pushed');
        if ($('#loginPage').length) {
            //loginPage.html
            $('.loginButton').on('click', function () {
                if ($('#baseCode').val != '' && $('#userName').val() != '') {
                    var baseCodeInput = $('#baseCode').val();
                    name = $('#userName').val();
                    base = baseCodes.indexOf(baseCodeInput);

                    if (base > -1) {
                        //  good
                        if (base == 0) {
                            navi.bringPageTop('admin.html', {
                                animation: 'fade'
                            });
                            appdb.get('login').then(function (doc) {
                                    appdb.put({
                                        _id: doc._id,
                                        _rev: doc._rev,
                                        base: 'admin',
                                        name: name
                                    })
                                })
                                .catch(function (err) {
                                    appdb.put({
                                        _id: 'login',
                                        base: 'admin',
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
                        } else {
                            console.log('pass your base is ' + base);
                            navi.bringPageTop('page1.html', {
                                animation: 'fade'
                            });
                            appdb.get('login').then(function (doc) {
                                    appdb.put({
                                        _id: doc._id,
                                        _rev: doc._rev,
                                        base: base,
                                        name: name
                                    })
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
                                    }).catch(function () {
                                        ons.notification.alert({
                                            title: 'Error saving user',
                                            message: 'You have logged in but there was an error saving your user credentials, the app will require you to log in again if you close it.',
                                            cancelable: true
                                        });
                                    });

                                });
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
        if ($('#page1').length) {
            $('.pageTitle').html('Base ' + base);
            $('.quickAddTitle').html('Add record from base ' + base);
        }

    });

});