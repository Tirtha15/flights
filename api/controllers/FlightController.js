/**
 * FlightController
 *
 * @description :: Server-side logic for managing flights
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var moment = require('moment');
var request = require('request');

module.exports = {
	search: function(req, res){
		
        
        //passenger info		
		var noOfAdults = req.query.adults || 1;
		var noOfChildren = req.query.children || 0;

        //travel info
        var journeyDate = req.query.journeyDate || moment().format('YYYY-MM-DD');
        var returnDate = req.query.returnDate || null;
        var origin = req.query.origin;
        var destination = req.query.destination;


        if(!origin)
        	return res.badRequest({
        		code: 'BAD_REQUEST',
        		message: 'Origin is not specified'
        	});
        if(!destination)
        	return res.badRequest({
        		code: 'BAD_REQUEST',
        		message: 'Destination is not specified'
        	});

       // check if origin and destination are correct IATA codes : TODO
       // check if jouneyDate and returnDate are correct date in format YYYY-MM-DD : TODO


		//constructing request body for qpx api	    
	    var bodyToSend = {
            "request": {
		    	"passengers": {
			      "kind": "qpxexpress#passengerCounts",
			      "adultCount": noOfAdults,
			      "childCount": noOfChildren
			    },
		    	"slice":[]
		    }
	    };
        
        //add slice for journey
	    var onwardSlice = {
	        "kind": "qpxexpress#sliceInput",
	        "origin": origin,
	        "destination": destination,
	        "date": journeyDate
	    };
	    bodyToSend.request.slice.push(onwardSlice);
        
        //add return slice if its a roundtrip
	    if(returnDate) {
	    	var returnSlice = {
	    		"kind": "qpxexpress#sliceInput",
		        "origin": destination,
		        "destination": origin,
		        "date": returnDate
	    	};
            bodyToSend.request.slice.push(returnSlice);
	    }

        //send a request to qpx-api to get flight info
        // var reqOptions = {
        // 	method: 'POST',
        // 	uri: 'https://www.googleapis.com/qpxExpress/v1/trips/search?key=AIzaSyBgi-WkS3RhpJgbcWxxCHUWWBLmnfdt0FA',
        // 	headers: {
        // 		'Content-Type': 'application/json'
        // 	},
        // 	body: JSON.stringify(bodyToSend)
        // }; 
        // request.post(reqOptions, function(err, flightsRes, body){
        // 	if(err){
        // 		sails.log("err", err);
        // 		return res.serverError(err);
        // 	}
        // 	var flightsInfo = JSON.parse(body);
        // 	var formattedRes = FlightService.formatResponse(flightsInfo.trips);
        //     return res.json(formattedRes);
        // });

	   // sending mock response for bangalore to kolkata of 8th feb 2017
       var mockResponse = utils.qpxMockResponse();

       var mockRes = FlightService.formatResponse(mockResponse.trips);

	   res.json(mockRes);
	}
};

