// This is the main Javascript file where the all the magic happens
// Author: Piyush Bajaj
// Topic: UI Assignment 4 

var map;
var markers = [];
var locations = [];
var draw = null;
var routes_present,markers_present = false;
var directionsDisplay;
var cur_username="";
var cur_lat,cur_lng;
var infoWindows = [];

function get_locations(){var oReq = new XMLHttpRequest();
oReq.open("POST", "http://localhost:8888/findall");
oReq.onreadystatechange = function() {
    console.log("inside findall",this.status)
      
      //console.log("we are here")
      locations = JSON.parse(this.responseText);
      initMap();
    
 };
//console.log("we called findall")
oReq.send();
}

//console.log("locations outside initMap");
//console.log(locations); 

function change( temp )
{
  if ( temp.value === "Draw" )
      temp.value = "Un-Draw";
  else
      temp.value = "Draw";
}

function initMap() {
  console.log("loactions inside InitMap")
  console.log(locations)
  var styles = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "administrative.country",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#181818"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#1b1b1b"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#2c2c2c"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#8a8a8a"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#373737"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#3c3c3c"
        }
      ]
    },
    {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#4e4e4e"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#3d3d3d"
        }
      ]
    }
  ];

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.2904976, lng: -80.1100212},
    zoom: 3,
    styles: styles,
    mapTypeControl: false
  });

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: getPoints(),
    map: map
  });

  heatmap.set('radius',20);
  var gradient = [
    'rgba(0, 255, 255, 0)',
    'rgba(0, 255, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 127, 255, 1)',
    'rgba(0, 63, 255, 1)',
    'rgba(0, 0, 255, 1)',
    'rgba(0, 0, 223, 1)',
    'rgba(0, 0, 191, 1)',
    'rgba(0, 0, 159, 1)',
    'rgba(0, 0, 127, 1)',
    'rgba(63, 0, 91, 1)',
    'rgba(127, 0, 63, 1)',
    'rgba(191, 0, 31, 1)',
    'rgba(255, 0, 0, 1)'
  ]
  heatmap.set('gradient', gradient);

  function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);

  }

  var largeInfowindow = new google.maps.InfoWindow();
  var drawingManager = new google.maps.drawing.DrawingManager({
   // drawingMode: google.maps.drawing.OverlayType.MARKER,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT,
      drawingModes: [
        //'circle', 'polygon', 'polyline', 'rectangle'
        google.maps.drawing.OverlayType.POLYGON
      ]
    }
  });

  var defaultIcon = makeMarkerIcon('0091ff');

  var highlightedIcon = makeMarkerIcon('FFFF24');
  console.log("locations before call")
  console.log(locations)

  for (var i = 0; i< locations.length;i++) {   // Process Query - MongoDB  OR Fetch Data
    var position = {lat: parseFloat(locations[i].latitude), lng: parseFloat(locations[i].longitude)};
    var title = locations[i].UserName;
    console.log(position);
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      map: map
    });
    markers.push(marker);
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });

    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }
  document.getElementById('show-listings').addEventListener('click', showListings);
  //document.getElementById('hide-listings').addEventListener('click', hideListings);
  document.getElementById('drawing').addEventListener('click', function() {
    toggleDrawing(drawingManager);
  });

  document.getElementById('zoom-to-area').addEventListener('click', function() {
    zoomToArea();
  });

  document.getElementById('search-within-time').addEventListener('click', function() {
    searchWithinTime();
  });

  drawingManager.addListener('overlaycomplete', function(event) {
    if (draw) {
      draw.setMap(null);
      hideListings(markers);
    }
    drawingManager.setDrawingMode(null);
    draw = event.overlay;
    draw.setEditable(true);
    searchInsideDraw();
    draw.getPath().addListener('set_at', searchInsideDraw);
    draw.getPath().addListener('insert_at', searchInsideDraw);
  });
}

function populateInfoWindow(marker, infowindow) {
  if (infowindow.marker != marker) {
    infowindow.setContent('');
    infowindow.marker = marker;
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;

    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
          infowindow.setContent(
            '<div class="pop-up">' +
            '<div class="left">' +
            '<div class="title">' + marker.title  + '</div>' +
            '</div><div id="pano"></div>' + 
            '</div>');
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 30
            }
          };
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent( '<div class="pop-up">' + marker.title + '</div>' +
          '<div>No Street View Found</div>');
      }
    }

    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    infowindow.open(map, marker);
  }
}
function showListings() {
  if(routes_present){
    directionsDisplay.setMap(null);}
    if(markers_present){
      close_all_info_window();
    }
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

function hideListings() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

function toggleDrawing(drawingManager) {
  if (drawingManager.map) {
    drawingManager.setMap(null);
    if (draw !== null) {
      draw.setMap(null);
    }
  } else {
    drawingManager.setMap(map);
  }
}
function searchInsideDraw() {
  for (var i = 0; i < markers.length; i++) {
    if (google.maps.geometry.poly.containsLocation(markers[i].position, draw)) {
      markers[i].setMap(map);
    } else {
      markers[i].setMap(null);
    }
  }
}

function zoomToArea() {
  if(routes_present){
    directionsDisplay.setMap(null);}
    if(markers_present){
    /*for(var i=0;i<markers.length;i++){
      if(markers[i].infowindow){
      markers[i].infowindow.close();}*/
      close_all_info_window();
    }
  var geocoder = new google.maps.Geocoder();
  var address = document.getElementById('zoom-to-area-text').value;
  console.log(address)
  if (address == '') {
    window.alert('You must enter an area, or address.');
  } else {
    geocoder.geocode(
      { address: address
      }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          map.setZoom(12);
        } else {
          window.alert('We could not find that location - try entering a more' +
              ' specific place.');
        }
      });
  }
}

function searchWithinTime() {
  if(routes_present){
    directionsDisplay.setMap(null);
  }
  var distanceMatrixService = new google.maps.DistanceMatrixService;
  //var address = document.getElementById('search-within-time-text').value;
  /*if (address == '') {
    window.alert('You must enter an address.');
  } else {*/
    hideListings();
    
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
   //get current user's location
    cur_username = document.getElementsByName("u_name").value;
    for(var i=0; i<locations.length;i++){
      if(locations[i].UserName == cur_username){
        cur_lat = locations[i].latitude;
        cur_lng = locations[i].longitude  
      }
    }
    
    var origins = [];
    for (var i = 0; i < markers.length-15; i++) {
      console.log(markers[i])
      origins[i] = markers[i].position;
    }
    var destination = {lat: cur_lat, lng: cur_lng};
    var mode = document.getElementById('mode').value;
    console.log(mode)
    console.log(origins)
    console.log(destination)
    distanceMatrixService.getDistanceMatrix({
      origins: origins,
      destinations: [destination],
      travelMode: google.maps.TravelMode[mode],
      unitSystem: google.maps.UnitSystem.IMPERIAL,
    }, function(response, status) {
      if (status !== google.maps.DistanceMatrixStatus.OK) {

       window.alert('Error was: ' + status);
      } else {
        console.log(status)
        console.log(response)
        displayMarkersWithinTime(response);
      }
    });
}

function displayDirections(origin) {		
  //directionsService.route(null);		
  //hideListings();		
 close_all_info_window();
 hideListings(markers);		
var directionsService = new google.maps.DirectionsService;		
  //Fetch from MongoDB		
  var destinationAddress = {lat: cur_lat, lng: cur_lng};		
  var mode = document.getElementById('mode').value;		
  directionsService.route({		
    origin: origin,		
    destination: destinationAddress,		
    travelMode: google.maps.TravelMode[mode]		
  }, function(response, status) {		
    if (status === google.maps.DirectionsStatus.OK) {		
         directionsDisplay = new google.maps.DirectionsRenderer({		
        map: map,		
      directions: response,		
        draggable: true,		
        polylineOptions: {		
          strokeColor: 'green'		
        }		
      });		
    } else {		
      window.alert('Directions request failed due to ' + status);		
    }		
  });
  routes_present = true;
}

function displayMarkersWithinTime(response) {
  //console.log(response)
  markers_present = true;
  var maxDuration = document.getElementById('max-duration').value;
  var origins = response.originAddresses;
  var destinations = response.destinationAddresses;
  var atLeastOne = false;
  for (var i = 0; i < origins.length; i++) {
    var results = response.rows[i].elements;
    for (var j = 0; j < results.length; j++) {
      var element = results[j];
      if (element.status === "OK") {

        var distanceText = element.distance.text;

        var duration = element.duration.value / 60;
        var durationText = element.duration.text;
        if (duration <= maxDuration) {

          markers[i].setMap(map);
          atLeastOne = true;

           infowindow = new google.maps.InfoWindow({
            content: durationText + ' away, ' + distanceText +
            '<div><input type=\"button\" value=\"View Route\" onclick =' +
            '\"displayDirections(&quot;' + origins[i] + '&quot;);\"></input></div>'
          });
          infowindow.open(map, markers[i]);
          infoWindows.push(infowindow);

          markers[i].infowindow = infowindow;
          google.maps.event.addListener(markers[i], 'click', function() {
            this.infowindow.close();
          });
        }
      }
    }
  }
}
function close_all_info_window(){
  for(var i =0 ;i<infoWindows.length;i++){
    infoWindows[i].close();
  }
}
function getPoints() {
  var heatmap_locations = [];

  for (var i = 0; i< locations.length;i++) {   // Process Query - MongoDB  OR Fetch Data
    var position = {lat: parseFloat(locations[i].latitude), lng: parseFloat(locations[i].longitude)};
    //console.log(position);
    var heatpoints = new google.maps.LatLng(position.lat,position.lng);
    heatmap_locations.push(heatpoints);
}
return heatmap_locations;
}
// Jquery addition for Image upload

$(document).ready(function() {     
      var readURL = function(input) {
          if (input.files && input.files[0]) {
              var reader = new FileReader();
  
              reader.onload = function (e) {
                  $('.profile-pic').attr('src', e.target.result);
              }
      
              reader.readAsDataURL(input.files[0]);
          }
      }

      $(".file-upload").on('change', function(){
          readURL(this);
      });
      
      $(".upload-button").on('click', function() {
         $(".file-upload").click();
      });
  });

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('logout');
    console.log(btn)
    if (btn) {
      btn.addEventListener('click', function(){
          //document.getElementsByName("fb_status").value = "false"
          FB.logout(function(response) {
            //document.getElementsByName("fb_status").value = "false"
            document.location.reload();
          });
          window.location = "http://localhost:8888/"
      })
    }
  });
