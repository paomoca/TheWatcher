var ObjectId = require('mongodb').ObjectID
var statistics = require('simple-statistics')
var moment = require('moment-timezone')
var date_validations = require('./date-validations.js')

//1 Enero 2016 00:00
var minUTCTimestamp = 1451606400000
var minUTC = new Date(minUTCTimestamp)

var project = {
  $project:
  {
    value : 1,
    date : 1,
    _id : 0,
  }
}

var projectValue = {
  $project:
  {
    value : 1,
    _id : 0,
  }

}

var sort = {
  $sort : {
    value : 1
  }
}

var hourStatistics = function(db, id, minTimestamp, maxTimestamp, callback){

  var timestamp = new Date(minTimestamp)

  var match = {
    $match : {  $and: [
      { date: { $gte: new Date(minTimestamp) } },
      { date: { $lt: new Date(maxTimestamp) } }
    ] }
  }


  var collection = db.collection(id)

  var cursor = collection.aggregate([project,match, projectValue, sort]).toArray(function(err, docs) {

    if(!err && docs.length != 0){

      callback(err, docs.length)

      var mappedArray = docs.map(function (item) { return item.value; });
      generateStatisticsDocument(mappedArray, timestamp, function(results){
        db.collection(id+'-hours').update({timestamp: timestamp}, results, { upsert: true }, function(err,res){
          console.log(id+': HOURS '+timestamp);
        })
      })

    } else {
      callback(err, 0)
    }

  });

}

var dayStatistics = function(db, id, minTimestamp, maxTimestamp, callback){

  var timestamp = new Date(minTimestamp)

  var match = {
    $match : {  $and: [
      { date: { $gte: new Date(minTimestamp) } },
      { date: { $lt: new Date(maxTimestamp) } }
    ] }
  }


  var collection = db.collection(id)

  var cursor = collection.aggregate([project,match, projectValue, sort]).toArray(function(err, docs) {

    if(!err && docs.length != 0){

      callback(err, docs.length)

      var mappedArray = docs.map(function (item) { return item.value; });
      generateStatisticsDocument(mappedArray, timestamp, function(results){
        db.collection(id+'-day').update({timestamp: timestamp}, results, { upsert: true }, function(err,res){
          console.log(id+': DAY '+timestamp);
        })
      })

    } else {
      callback(err, 0)
    }

  });


}

var monthStatistics = function(db, id, minTimestamp, maxTimestamp, callback){

  var timestamp = new Date(minTimestamp)

  var match = {
    $match : {  $and: [
      { date: { $gte: new Date(minTimestamp) } },
      { date: { $lt: new Date(maxTimestamp) } }
    ] }
  }

  var collection = db.collection(id)

  var cursor = collection.aggregate([project,match, projectValue, sort]).toArray(function(err, docs) {

    if(!err && docs.length != 0){

      callback(err, docs.length)

      var mappedArray = docs.map(function (item) { return item.value; });
      generateStatisticsDocument(mappedArray, timestamp, function(results){
        db.collection(id+'-month').update({timestamp: timestamp}, results, { upsert: true }, function(err,res){
          console.log(id+': MONTH '+timestamp);
        })
      })

    } else {
      callback(err, 0)
    }


  });


}

var generateStatisticsDocument = function(array, timestamp, callback){

  var results = {}
  results.timestamp = timestamp
  results.mean = statistics.mean(array)
  results.mode = statistics.modeSorted(array)
  results.median = statistics.medianSorted(array)
  results.arrayCount = array.length
  results.createdAt = new Date()

  callback(results)

}

exports.monthStatistics = monthStatistics
exports.dayStatistics = dayStatistics
exports.hourStatistics = hourStatistics
