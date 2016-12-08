var _= require('underscore');

module.exports = {
   formatResponse: function(trips) {

     var flightsData = {
         requestId: trips.requestId,
         trips: []
     };
     _.each(trips.tripOption, function(option){
     	var optionAttributes = _.pick(option, 'id', 'saleTotal');
     	optionAttributes.slices = _.map(option.slice, function(eachSlice){
     		var sliceInfo = _.pick(eachSlice, 'duration');
     		sliceInfo.segments = _.map(eachSlice.segment, function(eachSegment){
     			var segmentInfo = _.pick(eachSegment, 'id', 'duration', 'flight');
     			segmentInfo.seatsLeft = eachSegment.bookingCodeCount;
     			segmentInfo.legs = _.map(eachSegment.leg, function(eachLeg){
	     			var LegInfo = _.pick(eachLeg, 'id', 'aircraft', 'arrivalTime', 'departureTime', 'origin', 'destination', 'duration', 'meal');
	     			return LegInfo;
	     		});
                return segmentInfo;
     		});
            return sliceInfo;
     	});
     	flightsData.trips.push(optionAttributes);
     });

     return flightsData;
   }


};