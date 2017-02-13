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

var baseCodes = ['opFounder123', 'adam', 'martin'];
var base;

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

    //listens to onsenui event for the splitter menu closing line 22815 of onsenui.js
    //removes the shadow when the menu closes
    $('#menu').on('postclose', function () {
        console.log('menu closed');
        $('#menu').removeClass('menuShadow');
    });

    $('.loginButton').on('click', function () {
        var baseCodeInput = $('#baseCode').val();
        base = baseCodes.indexOf(baseCodeInput);

        if (base > -1) {
            //  good
            if (base == 0) {
                navi.bringPageTop('admin.html', {
                    animation: 'none'
                });
            } else {
                console.log('pass your base is ' + base);
                navi.bringPageTop('page1.html', {
                    animation: 'none'
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
    });


});