/*
This is the javascript for the operationFounder app
*/

// global variables
var baseCodes = ['opFounder123', 'adam', 'martin'];
var base;
var appdb;
var name;

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


ons.ready(function () {
    console.log('ons-ready function fired');

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
    appdb.get('login').then(function () {
            base = doc.base;
            $('.pageTitle').append('Base ' + base);
        })
        .catch(function (err) {
            navi.bringPageTop('loginPage.html', {
                animation: 'none'
            });

        });


    //listens to onsenui event for the splitter menu closing line 22815 of onsenui.js
    //removes the shadow when the menu closes
    $('#menu').on('postclose', function () {
        console.log('menu closed');
        $('#menu').removeClass('menuShadow');
    });


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
        }

    });

});