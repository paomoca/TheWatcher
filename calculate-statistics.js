var ObjectId = require('mongodb').ObjectID
var statistics = require('simple-statistics')

//1 Enero 2016 00:00
var minUTCTimestamp = 1451606400000
var minUTC = new Date(minUTCTimestamp)

var projectValue = {
  $project:
  {
    value : 1,
    _id : 0,
  }
}

var dayStatistics = function(db, id, y, m, d, h){

  //console.log('Day 24 hrs -------')

  var timestamp = new Date(minUTCTimestamp)

  timestamp.setUTCFullYear(y)
  timestamp.setUTCMonth(m-1)
  timestamp.setUTCDate(d)
  timestamp.setUTCHours(h)

  var project = {
    $project:
    {
      time : 1,
      value : 1,
      _id : 0,

      hour: { $cond: [{ $ifNull: ['$date', 0] }, { $hour: '$date' }, -1] },
      day: { $cond: [{ $ifNull: ['$date', 0] }, { $dayOfMonth: '$date' }, -1] },
      month: { $cond: [{ $ifNull: ['$date', 0] }, { $month: '$date' }, -1] },
      year: { $cond: [{ $ifNull: ['$date', 0] }, { $year: '$date' }, -1] }

    }
  }

  var match = {
    $match : { year: y, month: m, day: d, hour: h }
  }


    var collection = db.collection(id)

    var cursor = collection.aggregate([project,match,projectValue]).toArray(function(err, docs) {

     if(docs.length != 0){

      var mappedArray = docs.map(function (item) { return item.value; });
      var results = generateStatisticsDocument(mappedArray, timestamp)

      db.collection(id+'-hours').update({timestamp: timestamp}, results, { upsert: true }, function(err,res){
        console.log(id+'----H'+res.result.nModified+' -----------------'+' Y: '+y+' M: '+m+' D: '+d+' H: '+h+'  '+timestamp.toUTCString());
      })

    }

  });



}

var monthStatistics = function(db, id, y, m, d){

 // console.log('Month 31 days -------')

  var timestamp = new Date(minUTCTimestamp)
  timestamp.setUTCFullYear(y)
  timestamp.setUTCMonth(m-1)
  timestamp.setUTCDate(d)

  var project = {
    $project:
    {
      time : 1,
      value : 1,
      _id : 0,

      day: { $cond: [{ $ifNull: ['$date', 0] }, { $dayOfMonth: '$date' }, -1] },
      month: { $cond: [{ $ifNull: ['$date', 0] }, { $month: '$date' }, -1] },
      year: { $cond: [{ $ifNull: ['$date', 0] }, { $year: '$date' }, -1] }

    }
  }

  var match = {
    $match : { year: y, month: m, day: d }
  }

    var collection = db.collection(id)

    var cursor = collection.aggregate([project,match,projectValue]).toArray(function(err, docs) {

     if(docs.length != 0){

      var mappedArray = docs.map(function (item) { return item.value; });
      var results = generateStatisticsDocument(mappedArray, timestamp)

      db.collection(id+'-day').update({timestamp: timestamp}, results, { upsert: true }, function(err,res){
        console.log(id+'----D'+res.result.nModified+' ----------'+' Y: '+y+' M: '+m+' D: '+d+'  '+timestamp.toUTCString());
      })

    }

  });

  
}

var yearStatistics = function(db, id, y, m){

  //console.log('Year 12 months -------')

  var timestamp = new Date(minUTCTimestamp)
  timestamp.setUTCFullYear(y)
  timestamp.setUTCMonth(m-1)

  var project = {
    $project:
    {
      time : 1,
      value : 1,
      _id : 0,

      month: { $cond: [{ $ifNull: ['$date', 0] }, { $month: '$date' }, -1] },
      year: { $cond: [{ $ifNull: ['$date', 0] }, { $year: '$date' }, -1] }

    }
  }

  var match = {
    $match : { year: y, month: m }
  }

    var collection = db.collection(id)

    var cursor = collection.aggregate([project,match,projectValue]).toArray(function(err, docs) {

     if(docs.length != 0){

      var mappedArray = docs.map(function (item) { return item.value; });
      var results = generateStatisticsDocument(mappedArray, timestamp)

      db.collection(id+'-month').update({timestamp: timestamp}, results, { upsert: true }, function(err,res){

        console.log(id+'----M'+res.result.nModified+' '+' Y: '+y+' M: '+m+'  '+timestamp.toUTCString());

      })

    }

  });


}


var generateStatisticsDocument = function(array, timestamp){

  var results = {}

  results.timestamp = timestamp
  results.mean = statistics.mean(array)
  results.mode = statistics.mode(array)
  results.median = statistics.median(array)
  results.arrayCount = array.length
  results.createdAt = new Date()

  return results;

}

exports.yearStatistics = yearStatistics
exports.monthStatistics = monthStatistics
exports.dayStatistics = dayStatistics
