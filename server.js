const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const request = require("request");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/', (req, res) => {
  const twiml = new MessagingResponse();

  var query = req.body.Body;
  var key = "";
  var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + query + "&key=" + key;
  

  request(url, function(error, response, body){
    var message = "Oops, bad things happen to good people:(\n Try again with a more accurate place"

  	if (!error){
  		var data = JSON.parse(body);
  		if (data["results"][0]){
  			var name = data["results"][0]["name"];
  			var address = data["results"][0]["formatted_address"];
        var id = data["results"][0]["place_id"];

        var placeurl = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + id + "&fields=international_phone_number,opening_hours&key=" + key;
        request(placeurl, function(error, response, body){
          if (!error){
            var placedata = JSON.parse(body);

            var phoneNumber;
            if (placedata["result"]["international_phone_number"]){
              phoneNumber = placedata["result"]["international_phone_number"];
            } else {
              phoneNumber = "Phone number not available";
            }

            var openNow = "Open/closed info not available";
            var openingHours = "Opening hours not available";
            var open = placedata["result"]["opening_hours"];

            if (open){
              if (open["open_now"]){
                if (open["open_now"] == true){
                  openNow = "Open now";
                } else {
                  openNow = "Closed now";
                }
              }
              if (open["periods"].length > 1){
                //console.log(open["periods"]);
                var days = "Opening hours\n";
                for (i=0; i<open["periods"].length; i++){
                  var day;
                  if (open["periods"][i]["open"]["day"] == 0){
                    day = "Sunday: Open at " + open["periods"][i]["open"]["time"].slice(0, 2) + " Close at " + open["periods"][i]["close"]["time"].slice(0, 2) + "\n";
                    days += day;
                  }
                  if (open["periods"][i]["open"]["day"] == 1){
                    day = "Monday: Open at " + open["periods"][i]["open"]["time"].slice(0, 2) + " Close at " + open["periods"][i]["close"]["time"].slice(0, 2) + "\n";
                    days += day;
                  }
                  if (open["periods"][i]["open"]["day"] == 2){
                    day = "Tuesday: Open at " + open["periods"][i]["open"]["time"].slice(0, 2) + " Close at " + open["periods"][i]["close"]["time"].slice(0, 2) + "\n";
                    days += day;
                  }
                  if (open["periods"][i]["open"]["day"] == 3){
                    day = "Wednesday: Open at " + open["periods"][i]["open"]["time"].slice(0, 2) + " Close at " + open["periods"][i]["close"]["time"].slice(0, 2) + "\n";
                    days += day;
                  }
                  if (open["periods"][i]["open"]["day"] == 4){
                    day = "Thursday: Open at " + open["periods"][i]["open"]["time"].slice(0, 2) + " Close at " + open["periods"][i]["close"]["time"].slice(0, 2) + "\n";
                    days += day;
                  }
                  if (open["periods"][i]["open"]["day"] == 5){
                    day = "Friday: Open at " + open["periods"][i]["open"]["time"].slice(0, 2) + " Close at " + open["periods"][i]["close"]["time"].slice(0, 2) + "\n";
                    days += day;
                  }
                  if (open["periods"][i]["open"]["day"] == 6){
                    day = "Saturday: Open at " + open["periods"][i]["open"]["time"].slice(0, 2) + " Close at " + open["periods"][i]["close"]["time"].slice(0, 2) + "\n";
                    days += day;
                  }
                }
                openingHours = days;
              } else if (open["periods"].length == 1){
                console.log(open["periods"]);
                openingHours = "Open 24 hours";
              }
  			  message = name + "\n" + address + "\n" + phoneNumber + "\n" + "\n" + openNow + "\n" + openingHours + "\n";
  			  message += "\nNot what you want? Try again with a more accurate place:)"; 
  		  } else {
          // if error
  			  message = name + "\n" + address + "\n";
  		  }
        console.log(message);
        twiml.message(message);
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
      }
      });

  	} else {
      // no matching response
  		var message = "outer request: no matching response";
  	} 
  } else {
      // if error
      var message = "outer request fail";
  }
  });
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});
