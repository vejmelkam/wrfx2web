
var websocket;

function initialize() {

  /* initialize the google map */
  var mapOptions = {
        zoom: 7,
        center: new google.maps.LatLng(47.5, -120.5),
        mapTypeId: google.maps.MapTypeId.TERRAIN
      };

  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  var marker = null;
  google.maps.event.addListener(map, 'click',
                                function(event) {
                                  if(marker != null) { marker.setMap(null); }
                                  marker = new google.maps.Marker({ position: event.latLng, map : map, title : 'Ignition point', draggable : true });
                                  google.maps.event.addListener(marker, 'dragend', function(event) { updateIgnCoords(event.latLng); } );
                                  updateIgnCoords(event.latLng);
                                });

  /* initialize the websocket subsystem */
  if(!("WebSocket" in window)) {
      sysmsg('<p><span style="color: red;">Websockets are NOT supported!</span></p>');
  } else {
      connect();
  };

  function updateIgnCoords(ll)
  {
    $('#ign_lat').val(ll.ob);
    $('#ign_lon').val(ll.pb);
  };

  function connect()
  {
      websocket = new WebSocket('ws://127.0.0.1:8080/websocket/control');
      websocket.onopen = function(evt) { onOpen(evt) };
      websocket.onclose = function(evt) { onClose(evt) };
      websocket.onmessage = function(evt) { onMessage(evt) };
      websocket.onerror = function(evt) { onError(evt) };
  };

  function disconnect() {
      websocket.close();
  };


  function onOpen(evt) {
      sysmsg('CONNECTED\n');
  };

  function onClose(evt) { 
      sysmsg('DISCONNECTED\n');
  };

  function onMessage(evt) {
      sysmsg(evt.data + '\n');
  };

  function onError(evt) {
      sysmsg('ERROR ' + evt.data + '\n');
  };

  function sysmsg(code)
  {
    var ta = $('#sysmsg');
    var msg = moment().format('YYYY-MM-DD_HH:mm:ss') + " - " + code;
    ta.append(msg);
    ta.animate({scrollTop:ta[0].scrollHeight - ta.height() }, 1000);
  }

}

google.maps.event.addDomListener(window, 'load', initialize);

  function submitjob() {
      if(websocket.readyState == websocket.OPEN){
          websocket.send('{ "request": "submit-job", ' +
                         '"lat": ' + $('#ign_lat').val() + ", " +
                         '"lon": ' + $('#ign_lon').val() + ", " +
                         '"time": "' +$('#ign_time').val() + '", ' +
                         '"fc_len": ' + $('#fc_len').val() +
                         ' }');
      } else {
           sysmsg('Websocket disconnected.');
      };
  };

