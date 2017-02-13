 //--- Start of tracking functionality ---
 //  --- Server Variables
 var serverUrl; //= 'vps358200.ovh.net';
 var serverPort; //= '80';
 var serverUsername = '' // = 'adam@dsan.co.uk';
 var serverPassword = '' //= '2326';
 var serverConnected;
 var websocketDefined = false;
 // holds information on the tracker id, name etc.
 var yourTrackers = [];
 // holds which device has been checked
 var deviceArray = [];
 //maintains an ordered list of device array for comparing against yourTrackers
 var trackerID = [];
 var deviceInfo;
 var trackerPositionRefresh = true;
 var trackerRefreshCount = 0;
 var trackerRefreshInterval = 1000 * 60 * 3; // milliseconds, seconds, minutes
 var trackers = L.featureGroup()
 L.LayerGroup.include({
     customGetLayer: function (id) {
         for (var i in this._layers) {
             if (this._layers[i].id == id) {
                 return this._layers[i];
             }
         }
     }
 });

 // Other page variables

 var tcButtonIteration = 0;
 var connectionTitle;
 var skipButton;

 //Get request for devices
 function trackerDevices() {
     return {
         "async": true,
         "crossDomain": true,
         "url": "http://" + serverUrl + ":" + serverPort + "/api/devices",
         "method": "GET",
         "headers": {
             "authorization": "Basic " + btoa(atob(serverUsername) + ":" + atob(serverPassword))

         },
         "xhrFields": {
             "withCredentials": true
         },
     };
 }
 //Get request for positions
 function trackerPosition() {
     return {
         "async": true,
         "crossDomain": true,
         "url": "http://" + serverUrl + ":" + serverPort + "/api/positions",
         "method": "GET",
         "headers": {
             "authorization": "Basic " + btoa(atob(serverUsername) + ":" + atob(serverPassword))

         },
         "xhrFields": {
             "withCredentials": true
         }
     };
 }

 // Get positions for a single device to create a route
 function trackerRoute(deviceId, from, to) {
     return {
         "async": true,
         "crossDomain": true,
         "url": "http://" + serverUrl + ":" + serverPort + "/api/positions?&deviceId=" + deviceId + "from=" + from + "&to=" + to,
         "method": "GET",
         "headers": {
             "authorization": "Basic " + btoa(atob(serverUsername) + ":" + atob(serverPassword))

         },
         "xhrFields": {
             "withCredentials": true
         }
     };
 }

 //Get Request for server

 //Get Request for session
 function trackerSession() {
     return {
         "async": true,
         "crossDomain": true,
         "url": "http://" + serverUrl + ":" + serverPort + "/api/session",
         "method": "GET",
         "headers": {
             "authorization": "Basic " + btoa(atob(serverUsername) + ":" + atob(serverPassword))
         },
         "xhrFields": {
             "withCredentials": true
         },
     };
 }
 //Post request for creating a session
 function postTrackerSession() {
     return {
         "async": true,
         "crossDomain": true,
         "url": "http://" + serverUrl + ":" + serverPort + "/api/session",
         "method": "POST",
         "dataType": "json",
         "xhrFields": {
             "withCredentials": true
         },
         "headers": {
             "content-type": "application/x-www-form-urlencoded",

         },
         "data": {
             "email": atob(serverUsername),
             "password": atob(serverPassword)
         }
     };
 }

 //web socket URI
 function wsUri() {
     var webSocketUri = "ws://" + serverUrl + ":" + serverPort + "/api/socket?";
     return webSocketUri;
 }



 function getSession() {
     $.ajax(trackerSession()).done(function (response) {
         console.log(response);
     });
 }

 function postSession() {
     $.ajax(postTrackerSession()).done(function (response) {
         console.log(response);

     });
 }


 function getTrackerDevices() {
     // returns the names for the tracker devices and adds them to the side menu
     $.ajax(trackerDevices()).done(function (response) {
         console.log(response);


         //$('#menuHolder').prepend('<ons-list-header id="deviceList">Your Tracking Devices</ons-list-header>');
         for (var i = 0, l = response.length; i < l; i++) {
             $('#backgroundMapList').before('<ons-list-item tappable class="tDevices"><label class="left"><ons-input type="checkbox" input-id="check-' + response[i].id + '" value=' + response[i].id + ' class="deviceList" checked></ons-input></label><label for="check-' + response[i].id + '" class="center">' + response[i].name + '</label></ons-list-item>');
             //flexible list that keeps track of what has been clicked
             deviceArray.push(response[i].id);
             //set list that will not change as an ID reference for yourTrackers array below.
             trackerID.push(response[i].id);
             //creates an array of device info PICK UP HERE
             yourTrackers.push({
                 name: response[i].name,
                 status: response[i].status

             });

         }

         $('#menuHolder').on('click', '.checkbox__input', function () {
             var clickedDevice = parseInt($(this).val());
             console.log('menuholder clicked');
             if ($(this).is('.checkbox__input:checked')) {
                 deviceArray.push(clickedDevice);
             } else {
                 var index = deviceArray.indexOf(clickedDevice);
                 if (index > -1) {
                     deviceArray.splice(index, 1);
                 }
             }
             console.log(deviceArray);
             getPositions();
         });
         console.log(deviceArray);
         //trackerPositionRefreshLocation()
         createWebSocket();
     });
 }


 //uses the api to get the positions of the trackers
 function getPositions() {
     $.ajax(trackerPosition()).done(function (response) {
         console.log(response);

         processPositions(response);
     });
 }

 function processPositions(response) {
     console.log('processing positions');
     for (var i = 0, l = response.length; i < l; i++) {
         var deviceId = response[i].deviceId;

         //index of the device's ID in deviceArray
         var deviceChecked = deviceArray.indexOf(deviceId);

         if (deviceChecked > -1) {

             if (!(trackers.hasLayer(trackers.customGetLayer(deviceId)))) {
                 addDeviceToMap(deviceId, response[i].latitude, response[i].longitude);
             } else {
                 trackers.removeLayer(trackers.customGetLayer(deviceId));
                 addDeviceToMap(deviceId, response[i].latitude, response[i].longitude);
             }
         } else {
             try {
                 trackers.removeLayer(trackers.customGetLayer(deviceId));
             } catch (err) {
                 console.log(err);
             }
         }
     }
     if (trackerRefreshCount == 0) {
         map.fitBounds(trackers.getBounds());
         trackerRefreshCount++;
     }
 }

 function deviceInformationFromID(deviceId) {
     deviceInfo = trackerID.indexOf(deviceId);
     return deviceInfo;
 }

 function addDeviceToMap(deviceId, lat, lon) {
     var device = L.marker([lat, lon]);
     device.id = deviceId;
     device.name = yourTrackers[deviceInformationFromID(deviceId)].name;
     trackers.addLayer(device).addTo(map);
     trackers.customGetLayer(deviceId).bindTooltip(device.name, {
         permanent: true,
         direction: 'top'
     }).openTooltip();
 }

 function trackerPositionRefreshLocation() {
     //console.log(trackerRefreshInterval);
     getPositions();
     setTimeout(function () {
         switch (trackerPositionRefresh) {
             case true:
                 trackerPositionRefreshLocation();
             case false:
                 break;
         }
     }, trackerRefreshInterval);
 }

 // web socket functions and events
 function createWebSocket() {
     if (!(ons.platform.isAndroid() && ons.platform.isWebView())) {
         websocket = new WebSocket(wsUri());
         websocketDefined = true;
         websocket.onopen = function (evt) {
             onOpen(evt);
         };
         websocket.onclose = function (evt) {
             onClose(evt);
         };
         websocket.onmessage = function (evt) {
             onMessage(evt);
         };
         websocket.onerror = function (evt) {
             onError(evt);
         };
     } else {
         trackerPositionRefreshLocation();
     }
 }

 function onOpen(evt) {
     console.log('WEB SOCKET CONNECTED');

 }

 function onClose(evt) {
     console.log("WEB SOCKET DISCONNECTED");
     websocketDefined = false;
 }

 function onMessage(evt) {
     //console.log(evt.data);
     //websocket.close();
     var wsMessage = JSON.parse(evt.data);
     //console.log(wsMessage);
     if (wsMessage.positions) {
         var wsUpdate = wsMessage.positions;
         console.log('wsUpdate');
         console.log(wsUpdate);
         processPositions(wsUpdate);

     }
 }

 function onError(evt) {
     console.log('ERROR: ' + evt.data);
     trackerPositionRefreshLocation();

 }

 function doSend(message) {
     console.log("SENT: " + message);
     websocket.send(message);
 }

 function checkConnection() {
     var networkState = navigator.connection.type;
     return networkState;

 }
 //this function will clear all trackers
 function clearDownTrackers() {
     //removes the devices from the side menu
     $('.tDevices').remove();
     //removes all map layers in the trackers LayerGroup
     clearAllTrackersFromMap();
     //cleans down all of the arrays storing information so you can start afresh
     clearTrackerArrays()
     if (websocketDefined) {
         websocket.close();
     }

 }
 //this function will clear the tracking information from the map
 function clearAllTrackersFromMap() {
     console.log('removing tracking layer from map');
     trackers.clearLayers();
 }
 //empty tracker arrays
 function clearTrackerArrays() {
     yourTrackers = [];
     deviceArray = [];
     trackerID = [];
     trackerRefreshCount = 0;
 }

 //  checkConnection();
 //  console.log(navigator.connection.type);
 function updateConnectivityInfo() {
     // takes information from the connection.html page and updates the variables and trackerDb
     serverUrl = $('#t-c-server').val().replace(/http:\/\/|https:\/\//g, ''); //removes http://
     serverPort = $('#t-c-port').val();
     serverUsername = btoa($('#t-c-username').val());
     serverPassword = btoa($('#t-c-password').val());
     console.log('updated connectivity information, saving to Db')
     updateTrackingDbConnection();
 }

 function updateTrackingDbConnection() {
     // puts the information into the tracking db for reference next time
     trackingdb.get('connection').then(function (doc) {
         return trackingdb.put({
             _id: doc._id,
             _rev: doc._rev,
             server: serverUrl,
             port: serverPort,
             username: serverUsername,
             password: serverPassword

         }).catch(function (err) {
             //catch put error
         })
     }).catch(function (err) {
         console.log(err);
         console.log('putting connection info into db for the first time');
         return trackingdb.put({
             _id: 'connection',
             server: serverUrl,
             port: serverPort,
             username: serverUsername,
             password: serverPassword
         }).catch(function (err) {
             console.log(err);
         })
     });
 }

 function isServerConnected() {
     return serverConnected;
 }

 function firstPostTrackingSession() {
     $.ajax(postTrackerSession()).done(function (response) {

         getTrackerDevices();
         serverConnected = true;
         if ($('#connectionInput').length) {
             // if this is being called by the connectionInput page
             $('#t-c-button').html('Connected').addClass('button--material--flat');
             $('.progressBar').addClass('hide');
             $('.t-c-skipPage').addClass('hide');
             $('.t-c-done').removeClass('hide');
             tcButtonIteration = 0;
         }

     }).fail(function (err) {
         //checks internet connection on mobile devices
         if ($('#connectionInput').length) {
             // if this is being called by the connectionInput page
             $('.progressBar').addClass('hide');
             $('.t-c-skipPage').removeClass('hide');
             $('.t-c-done').addClass('hide');
             tcButtonIteration = 0;
         }

         if (ons.platform.isWebView()) {
             if (checkConnection() == 'none') {
                 ons.notification.alert({
                     title: 'Internet connectivity Error',
                     message: 'You are not connected to the internet, please connect and try again',
                     cancelable: true
                 });
             }
         }
         console.log('next error is the ajax error');
         console.log(err);
         if (err.status == 401) {
             ons.notification.alert({
                 title: err.statusText,
                 message: 'Please check your username and password',
                 cancelable: true
             });
         } else {
             //PossToDo perhaps put an error due to the return from the server
             ons.notification.alert({
                 title: 'Server connection error',
                 message: 'Please check your server connection information and try again',
                 cancelable: true
             });
         }
     });
 }

 function testConnection() {
     if ($('#t-c-server').val().replace(/http:\/\/|https:\/\//g, '') != '' && $('#t-c-port').val() != '') {
         updateConnectivityInfo();
         // puts the information into the tracking db for reference next time
         updateTrackingDbConnection();
         firstPostTrackingSession();


     } else {
         ons.notification.alert({
             title: 'Missing Fields',
             message: 'Please enter your server and port information',
             cancelable: true
         })
         if ($('#connectionInput').length) {
             $('.progressBar').addClass('hide');
             tcButtonIteration = 0;
         }
     }
 }



 function beginTracking() {
     console.log('begun tracking');
     try {
         firstPostTrackingSession();
         // getSession();
         // getTrackerDevices();
     } catch (err) {
         console.log(err);
     }
 }


 /* End of the functions and start of the pre-DOM ready section */

 // Add CSS for tracking plug-in
 $("head").append("<link rel='stylesheet' href='css/tracking.css' type='text/css'>");

 // pouchDB controls before main script

 var trackingdb = new PouchDB('trackingdb');

 /*start of the tracking script after the DOM is ready*/

 ons.ready(function () {

     // begin the tracking script

     //adds the tracking device section to the menu
     $('#menu').on('init', function () {
         $('#menuHolder').prepend('<ons-list-header id="deviceList">Your Tracking Devices</ons-list-header>');
         console.log('menu init and tracking device holder added');
     });
     //gets saved credentials or opens the intro pages
     trackingdb.get('connection').then(function (doc) {
             serverUrl = doc.server;
             serverPort = doc.port;
             serverUsername = doc.username;
             serverPassword = doc.password;
             console.log('connection information: ' + doc.server + ' ' + atob(serverUsername));
             //begins tracking scripts
             beginTracking();
         })
         .catch(function (err) {
             console.log(err);
             //assumes this is the first time of use and pushes the intro pages
             navi.bringPageTop('intro-t.html', {
                 animation: 'none'
             });
         });
     //handline online and offline on mobile phones
     if (ons.platform.isWebView()) {


         document.addEventListener("offline", onOffline, false);

         function onOffline() {
             // Handle the offline event

             document.addEventListener("online", onOnline, false);
         }

         function onOnline() {
             // Handle the online event

             //alert('congrats you are online, connected via: ' + checkConnection());

         }
     }

     // actions that are added after a page change to specific pages
     document.addEventListener('postpush', function (event) {
         if ($('#intro-t').length) {
             $('.nextPage').on('click', function () {
                 connectionTitle = 'First connection';
                 skipButton = true;
                 navi.bringPageTop('connection.html', {
                     animation: 'fade'

                 });
             })
         }
         if ($('#connectionInput').length) {
             $('.connectionTitle').append(connectionTitle);

             $('#t-c-server').val(serverUrl);
             $('#t-c-port').val(serverPort);
             $('#t-c-username').val(atob(serverUsername));
             $('#t-c-password').val(atob(serverPassword));
             if (skipButton == true) {
                 skipButton = false;
                 $('.t-c-skipPage').removeClass('hide').on('click', function () {
                     map.setView(marker.getLatLng(), 15);
                     clearDownTrackers();
                     navi.bringPageTop('map.html', {
                         animation: 'fade'
                     });
                 });

             }
             $('#t-c-button').on('click', function () {
                 if (tcButtonIteration == 0 && !($(this).hasClass('button--material--flat'))) {
                     tcButtonIteration++;
                     $('.progressBar').removeClass('hide');
                     clearDownTrackers();
                     testConnection();
                 }
             });
             $('.t-c-done').on('click', function () {
                 navi.bringPageTop('map.html', {
                     animation: 'fade'
                 });
             });
             var currentVal;
             $('.connectionInput').focus(function () {
                 currentVal = $(this).val();
             }).blur(function () {
                 if (currentVal != $(this).val()) {
                     console.log('val changed');
                     updateConnectivityInfo()
                     $('#t-c-button').html('Test connection').removeClass('button--material--flat');
                 } else {
                     console.log('value not changed');
                 }
             });
             if (ons.platform.isWebView() || ons.platform.isChrome()) {
                 $('.t-c-scrollable').focus(function () {
                     $(this).addClass('scrollToMe');
                     setTimeout(function () {
                         $('.page__content').animate({
                             scrollTop: $('.scrollToMe').offset().top
                         }, 'fast');
                         console.log('trying to scroll');
                     }, 600); //timeout in milliseconds
                     // $(this).removeClass('scrollToMe');
                 });
             }
         }

         if ($('#trackingSettings').length) {
             //Tracking refresh interval
             $('#trackerRefreshInterval').val(trackerRefreshInterval / 1000);
             $('#trackerRefreshInterval').blur(function () {
                 if (trackerRefreshInterval != ($('#trackerRefreshInterval').val()) * 1000) {
                     trackerRefreshInterval = ($('#trackerRefreshInterval').val()) * 1000; //to convert to milliseconds
                     trackerPositionRefreshLocation();
                 }
             });
             //Server Url update
             $('#serverConnect').on('click', function () {
                 connectionTitle = 'Tracking server settings';
                 navi.bringPageTop('connection.html', {
                     animation: 'fade'

                 });
             });
             /* $('#serverURL').on('click', function () {
                  ons.notification.prompt({
                          message: 'Server URL http://',
                          //  placeholder: 'http://',
                          defaultValue: serverUrl,
                          title: 'Server settings',
                          cancelable: true
                      })
                      .then(
                          function (input) {
                              var noHttpInput = input.replace(/http:\/\/|https:\/\//g, '');
                              if (serverUrl !== noHttpInput) {
                                  ons.notification.alert('Server updated to: ' + input + ' refreshing tracking devices');
                                  serverUrl = noHttpInput;

                                  trackingdb.get('server').then(function (doc) {
                                      return trackingdb.put({
                                          _id: 'connection',
                                          _rev: doc._rev,
                                          url: noHttpInput,
                                          port: serverPort,
                                          username: serverUsername,
                                          password: serverPassword
                                      })
                                  }).then(function (response) {
                                      console.log('updated the server to');
                                      console.log(response);
                                  }).catch(function (err) {
                                      console.log(err);
                                      trackingdb.put({
                                          _id: 'connection',
                                          url: noHttpInput,
                                          port: serverPort,
                                          username: serverUsername,
                                          password: serverPassword
                                      }).then(function (response) {
                                          console.log('first input of a server url');
                                          console.log('updated the server to');
                                          console.log(response);
                                      }).catch(function (err) {
                                          console.log(err);
                                      })
                                  });
                                  clearDownTrackers();
                                  beginTracking();
                              }
                          }
                      );
              });
              //Server Port update
              $('#serverPort').on('click', function () {
                  ons.notification.prompt({
                          message: 'Enter server port number',
                          //  placeholder: 'http://',
                          defaultValue: serverPort,
                          title: 'Server port',
                          cancelable: true
                      })
                      .then(
                          function (input) {
                              if ($.isNumeric(input)) {
                                  if (serverPort !== input) {
                                      ons.notification.alert('Server port updated to: ' + input + ' refreshing tracking devices');
                                      serverPort = input;
                                      clearDownTrackers();
                                      beginTracking();
                                  }
                              } else {
                                  ons.notification.alert(input + ' is not a valid port NUMBER, your changes have not been saved');
                              }
                          }
                      );
              });*/
         }
     });
     console.log('at the end of the script for tracking');


     //End of ons.ready function
 });

 //Debug functionality

 function destroyTrackingDb() {
     trackingdb.destroy();
     trackingdb.get('connection').catch(function (err) {
         alert(err + ' means that the db is destroyed');
     });
 }

 function circleProgressBar(id) {
     $('#' + id).append('<div class="circle-loader-container"><div class="circle-loader-background"><svg class="circle-loader progress" width="30" height="30" version="1.1" xmlns="http://www.w3.org/2000/svg"><circle cx="50%" cy="50%" r="8px"></svg></div></div>');
 }