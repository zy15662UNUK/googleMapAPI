function initMap(){
  var mapOptions = {
    center: {lat: 51.5, lng:-0.1},
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map"),mapOptions);

  // Add a marker when click on any point of the map
  var markers = [],
  clickPosition = [],
  placeIds = [],
  checkRepitition = false;
  map.addListener("click",function(e){
    // Avoid multiple markers being created if click the same point for multiple time
    if((e.ea !== undefined)){//if it is not clicked on the landmarker
        if((clickPosition.length != 0)&&(e.ea.x === clickPosition[clickPosition.length-1].x)&&(e.ea.y === clickPosition[clickPosition.length-1].y)){
          // if it is multiple click
          checkRepitition = true;
        }else{
          // if not multiple click
          checkRepitition = false;
          clickPosition.push({x:e.ea.x,y:e.ea.y});
        }

    }else{//if it is clicked on the landmarker
      if((placeIds.length !== 0)&&(e.placeId === placeIds[placeIds.length-1])){
        // if it is multiple click
        checkRepitition = true;
      }else{
        // if not multiple click
        checkRepitition = false;
        placeIds.push(e.placeId);
      }

    }
    if (checkRepitition === false){
      var markerOptions = {
        map: map,
        position: e.latLng,
        animation: google.maps.Animation.DROP,
        draggable:true,
        title:"Drag me!"
      };
      var marker = new google.maps.Marker(markerOptions);
      var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+e.latLng.lat()+","+e.latLng.lng()+"&key=AIzaSyBAD1qkvSluZyzx6BQWO9YTPxznWaNJXFE";
      var address,postcode;
      marker.addListener("click",function(e){
        $.getJSON(url, function(data) {
          address = data.results[0].formatted_address;
          postcode = data.results[0].address_components[data.results[0].address_components.length-1].long_name;
          var infoWindow = new google.maps.InfoWindow({
            content: address+"\n",
            maxWidth: 200
          });
          infoWindow.open(map,marker);
        });
      });
      markers.push(marker);
    }
  });

  //Remove the marker once click outside the map
  //Attach a click event to the document body which closes the window.
  $(window).click(function() {
    // Remove the markers from the map
    for(var i=0;i<markers.length;i++){
      markers[i].setMap(null);
    }
    // Clear the array
    markers = [];
    placeIds = [];
  });
  //Attach a separate click event to the window which stops
  //propagation to the document body.
  $('#map').click(function(event){
      event.stopPropagation();
  });
      if(navigator.geolocation){
      var pos;
      navigator.geolocation.getCurrentPosition(function(position){
        pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        //Center to the current user location
        map.setCenter(new google.maps.LatLng(pos.lat,pos.lng));
        //Marker at the user location
        var markerUser = new google.maps.Marker({
          map: map,
          position: pos,
          draggable: true,
          title: "You are here",
          icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          });
        markerUser.addListener("click",function(){
          //InfoWindow for the marker
          var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+pos.lat+","+pos.lng+"&key=AIzaSyBAD1qkvSluZyzx6BQWO9YTPxznWaNJXFE";
          var address,postcode;
          $.getJSON(url, function(data) {
            address = data.results[0].formatted_address;
            postcode = data.results[0].address_components[data.results[0].address_components.length-1].long_name;
            var infoWindow = new google.maps.InfoWindow({
              content: address+"\n",
              maxWidth: 200
            });
            infoWindow.open(map,markerUser);
          });
        });
      });
    }

  //Autocomplete for the search boxes
  var departureInput = document.getElementById("departure");
  var destinationInput = document.getElementById("destination");
  var autocompleteDeparture = new google.maps.places.Autocomplete(departureInput);
  var autocompleteDestination = new google.maps.places.Autocomplete(destinationInput);

  //Click button to search for path
  var directionService = new google.maps.DirectionsService();
  var directionsRender = new google.maps.DirectionsRenderer();
  $(".driving").click(function(event) {
    showPath(0);
  });
  $(".walking").click(function(event) {
    showPath(1);
  });
  $(".bicycling").click(function(event) {
    showPath(2);
  });
  function showPath(index){
    directionsRender.setMap(map);
    var travelMode = ['DRIVING','WALKING','BICYCLING'];
    var start = $("#departure").val(),
    des = $("#destination").val();
    var request = {
      origin: start,
      destination: des,
      unitSystem: google.maps.UnitSystem.METRIC,
      travelMode: travelMode[index]
    };
    directionService.route(request, function(result,status){
      $(".Distance p").text("");
      $(".Duration p").text("");
      $(".Alarm P").text("");
      if(status === google.maps.DirectionsStatus.OK){
        directionsRender.setDirections(result);
        $(".Distance p").text("The distance is: "+result.routes[0].legs[0].distance.text);
        $(".Duration p").text("Your journey takes about: "+result.routes[0].legs[0].duration.text);
      }else{
        $(".Alarm p").text("Sorry, your search result is "+status);
        clear();
      }
    });
  }
  //If anyone of input boxes is cleared, clear the route on the map
  $("#departure").change(function(event) {
    if($("#departure").val() === ""){
      clear();
    }
  });
  $("#destination").change(function(event) {
    if($("#destination").val() === ""){
      clear();
    }
  });
  function clear(){
    directionsRender.setMap(null);
    $(".Distance p").text("");
    $(".Duration p").text("");
  }
}
