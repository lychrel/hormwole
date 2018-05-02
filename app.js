// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');

const app = express();

var path = require('path');

const { body, validationResult } = require('express-validator/check');
const {sanitizeBody } = require('express-validator/filter');

var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: true });

var request = require('ajax-request');

// [START hello_world]
// Say hello!
app.get('/', (req, res) => {
  //res.status(200).send('./index.html')});
  res.sendFile(path.join(__dirname + '/test.html'));});
// [END hello_world]

app.post('/inputs', urlencodedParser, function (req, res) {
	var reply = '';
	reply += "input 1: " + req.body.deltaT;
	reply += "input 2: " + req.body.L_travel;
	//res.send(reply);
	
	var c = 3*Math.pow(10,8); //speed of light

	//var speed = function speed(dist, L_travel) {return ((dist)^2/((L_travel/2)^2+(dist)^2))^(1/2)};

	//var L_travel = function(dist, speed) { return 2*dist*((1/(speed^2)-1)^(1/2))};

	global.L_travel = req.body.L_travel;
	global.deltaT = req.body.deltaT;
	global.L_earth = deltaT + L_travel;
	
	// max distance: if v = 0.0001c
	// min distance: if v = c
	
	var output_distance = function (L_trav, speed) { return (L_trav/2)/Math.pow(1/(Math.pow(speed,2))-1,(0.5))};

	console.log("setting min/max distance...\n");
	console.log(" with L_trav" + L_travel);
	console.log("should be " + output_distance(L_travel, 0.5));

	var max_dist = output_distance(L_travel, 0.0001);
	var min_dist = output_distance(L_travel, 0.99);

	console.log("finished setting min/max distance")

	console.log("creating HTML...\n")
	console.log("precomputing distance strings")
	var mind_str = min_dist.toString();
	var maxd_str = max_dist.toString();
	var avg_dist = (max_dist + min_dist)/2;
	var avgd_str = avg_dist.toString();
	console.log(mind_str, maxd_str, avgd_str);

	// sliders!
	// WHEN THEY'RE TOGETHER, THIS WORKS. THEY FAIL WHEN SEPARATE.
	//var html='';
	//html += "<!DOCTYPE html>";
	//html += "<html>";

	//html += "<div class='slidecontainer'>";
	//html += "<form action='/sslider' method='post' name='mySpeed'>";
	//html += "<input type='range' min='0.0001' max='1.0' value='0.5' name='mySpeed'>";
	//html += "<input type='submit' value='Calculate'>";
	//html += "<p> Speed <span> name='showSpeed'</span>c</p>";
//	html += "</form>";
//	html += "</div>";
//	html += "<div class='slidecontainer'>";
//	html += "<form action='/dslider' method='post' name='dsliderform>";
//	html += "<input type='range' min='0.0003000000015' max='21.053771788747607' value='" + avgd_str + "' name='myDist'>";
//	console.log("\n\n");
//	console.log("<input type='range' min='0.0003000000015' max='21.053771788747607' value='" + avgd_str + "' name='myDist'>");
	//html += "<p> Distance  <span> name='myDist'</span></p>";
//	html += "<input type='submit' value='Calculate'>";
//	html += "</div>";
//	html += "</form>";

//	html += "</html>";
	
	var html = '';
	html += "<form action='/speedin' method='post'>";
	html += "Speed is unset (max 0.99c). New speed: ";
	html += "<input type='number' step='0.0001' name='mySpeed'>.";
	html += "<input type='submit' name='button' value='send speed'>";
	html += "<br/>Distance is unset (out of 21.1 lightyears). New distance: ";
	html += "<input type='number' step='0.0001' name='myDist'>.<br/>";
	html += "<input type='submit' name='button' value='send distance'>";
	html += "</form>";

	res.send(html);

// if user specifies speed,
app.post('/speedin', urlencodedParser, function (req, res) {

	console.log("checking request")
	console.log(req.body.button)
	var distance = 0;
	var speed = 0;
	if(req.body.button=='send speed') {
		var get_distance = function (L_trav, speed) { return (L_trav/2)/Math.pow(1/(Math.pow(speed,2))-1,(0.5))};
		speed = req.body.mySpeed;
		distance = get_distance(L_travel, speed);
	} else {
		var get_speed = function (dist, L_travel) {return Math.pow(Math.pow(dist,2)/(Math.pow((L_travel/2),2)+Math.pow(dist,2)),(1/2))};
		distance = req.body.myDist;
		speed = get_speed(distance, L_travel);
	}

	var html = '';
	html += "<form action='/speedin' method='post'>";
	html += "Speed is " + speed.toString() + "c (out of 0.99c). New speed: ";
	html += "<input type='number' step='0.0001' name='mySpeed'>.";
	html += "<input type='submit' name='button' value='send speed'>";
	html += "<br/>Distance is " + distance.toString() + " lightyears (out of 21.1). New distance: ";
	html += "<input type='number' step='0.0001' name='myDist'>.<br/>";
	html += "<input type='submit' name='button' value='send distance'>";
	html += "</form>";

	res.send(html);
});

app.post('/distin', urlencodedParser, function (req, res) {

	var output_speed = function (dist, L_travel) {return Math.pow(Math.pow(dist,2)/(Math.pow((L_travel/2),2)+Math.pow(dist,2)),(1/2))};

	// determine distance
	var input_dist = req.body.myDist;
	var speed = output_speed(L_travel, input_dist);


	var html = '';
	html += "<form action='/speedin' method='post'>";
	html += "Speed is " + speed.toString() + "c (out of 0.99c). New speed: ";
	html += "<input type='number' name='mySpeed'>.";
	html += "<input type='submit' value='Calculate'>";
	html += "</form>";
	html += "<form action='/distin' method='post'>";
	html += "Distance is " + input_dist.toString() + " lightyears (out of 21.1). New distance: ";
	html += "<input type='number' name='myDist'>.<br/>";
	html += "<input type='submit' value='Calculate'>";
	html += "</form>";

	res.send(html);

	// return same old HTML but with updated slider values
	//var html='';
	//html += "<!DOCTYPE html>";
	//html += "<html>";

	//html += "<div class='slidecontainer'>";
	//html += "<form action='/sslider' method='post' name='mySpeed'>";
	//html += "<input type='range' min='0.0001' max='1.0' value='" + input_speed + "' name='mySpeed'>";
	//html += "<p> Speed <span> name='showSpeed'</span>c</p>";
	//html += "</form>";
	//html += "<form action='/dslider' method='post' id='dsliderform>";
	//html += "<input type='range' min='" + min_dist  + "' max='" + max_dist + "' value='" + distance + "' name='myDist'>";
	//html += "<p> Distance  <span> name='myDist'</span></p>";
	//html += "<input type='submit' value='Calculate'>";
	//html += "</form>";
	//html += "</div>";

	//html += "</html>";
});
});

if (module === require.main) {
  // [START server]
  // Start the server
  const server = app.listen(process.env.PORT || 8081, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
  // [END server]
}

module.exports = app;
