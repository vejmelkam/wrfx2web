
var websocket;
var kml = null;
var map = null;
var kml_urls = [];
var job_id = null;

function initialize() {

  /* parse the location.href and find the jobid if any */
  ndx = location.href.indexOf('jobid');
  if(ndx >= 0) {
    job_id = location.href.substring(ndx + 6);
  }

  /* initialize the google map */
  var mapOptions = {
        zoom: 7,
        center: new google.maps.LatLng(47.5, -120.5),
        mapTypeId: google.maps.MapTypeId.TERRAIN
      };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  /* initialize the websocket subsystem */
  if(!("WebSocket" in window)) {
      sysmsg('<p><span style="color: red;">Websockets are NOT supported!</span></p>');
  } else {
      connect();
  };


  function connect()
  {
      websocket = new WebSocket('ws://127.0.0.1:8000/websocket/monitor');
      websocket.onopen = function(evt) { onOpen(evt) };
      websocket.onclose = function(evt) { onClose(evt) };
      websocket.onmessage = function(evt) { onMessage(evt) };
      websocket.onerror = function(evt) { onError(evt) };
  };


  function disconnect() {
      websocket.close();
  };


  function onOpen(evt) {
      sysmsg('CONNECTED');
      sysmsg('You are monitoring job ' + job_id);
      
      // send a request to monitor job with our job_id
      websocket.send("{ \"request\" : \"monitor\", \"jobid\" : \"" + job_id + "\" }");
  };

  function onClose(evt) {
      sysmsg('DISCONNECTED');
  };

  function onMessage(evt) {
      json = JSON.parse(evt.data);
      if(json["message"] == "job_status") {
        // update job status here
        sysmsg(evt.data);
      }
  };

  function onError(evt) {
      sysmsg('ERROR ' + evt.data);
  };

    $("#kml-slider").slider({
    value: 1, min:1, max:5, step:1, slide: function(ev, ui) { switchkml(ui.value); }
  });
}



function sysmsg(code)
  {
    var ta = $('#sysmsg');
    var msg = moment().format('YYYY-MM-DD_HH:mm:ss') + " - " + code + '\n';
    ta.append(msg);
    ta.animate({scrollTop:ta[0].scrollHeight - ta.height() }, 1000);
  };



function switchkml(ndx)
{
  if(kml != null) { kml.setMap(null); }
  kml = new google.maps.KmlLayer({url: 'http://mathweb.ucdenver.edu/~mvejmelka/test' + ndx + '.kmz', map: map});

}

google.maps.event.addDomListener(window, 'load', initialize);

