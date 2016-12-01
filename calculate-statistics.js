var ObjectId = require('mongodb').ObjectID
var statistics = require('simple-statistics')
var date_validations = require('./date-validations.js')

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

var hourStatistics = function(db, id, minTimestamp, maxTimestamp, callback){

  var timestamp = new Date(minTimestamp)

  var project = {
    $project:
    {
      value : 1,
      date : 1,
      _id : 0,
    }
  }

  var match = {
    $match : {  $and: [
      { date: { $gte: new Date(minTimestamp) } },
      { date: { $lte: new Date(maxTimestamp) } }
    ] }
  }


    var collection = db.collection(id)

    var cursor = collection.aggregate([project,match, projectValue]).toArray(function(err, docs) {

     if(docs.length != 0){

      var mappedArray = docs.map(function (item) { return item.value; });
      var results = generateStatisticsDocument(mappedArray, timestamp)

      db.collection(id+'-hours').update({timestamp: timestamp}, results, { upsert: true }, function(err,res){
        console.log(id+': HOURS '+timestamp);
      })

      callback(err, docs.length)

    } else {
      callback(err, 0)
    }

  });



}

var dayStatistics = function(db, id, minTimestamp, maxTimestamp, callback){

  var timestamp = new Date(minTimestamp)

  var project = {
    $project:
    {
      value : 1,
      date : 1,
      _id : 0,
    }
  }

  var match = {
    $match : {  $and: [
      { date: { $gte: new Date(minTimestamp) } },
      { date: { $lte: new Date(maxTimestamp) } }
    ] }
  }


    var collection = db.collection(id)

    var cursor = collection.aggregate([project,match, projectValue]).toArray(function(err, docs) {

     if(docs.length != 0){

      var mappedArray = docs.map(function (item) { return item.value; });
      var results = generateStatisticsDocument(mappedArray, timestamp)

      db.collection(id+'-day').update({timestamp: timestamp}, results, { upsert: true }, function(err,res){
        console.log(id+': DAY '+timestamp);
      })

      callback(err, docs.length)

    } else {
      callback(err, 0)
    }

  });


}

var monthStatistics = function(db, id, minTimestamp, maxTimestamp, callback){

  var timestamp = new Date(minTimestamp)

  var project = {
    $project:
    {
      value : 1,
      date : 1,
      _id : 0,
    }
  }

  var match = {
    $match : {  $and: [
      { date: { $gte: new Date(minTimestamp) } },
      { date: { $lte: new Date(maxTimestamp) } }
    ] }
  }


    var collection = db.collection(id)

    var cursor = collection.aggregate([project,match, projectValue]).toArray(function(err, docs) {

     if(docs.length != 0){

      var mappedArray = docs.map(function (item) { return item.value; });
      var results = generateStatisticsDocument(mappedArray, timestamp)

      db.collection(id+'-month').update({timestamp: timestamp}, results, { upsert: true }, function(err,res){
        console.log(id+': MONTH '+timestamp);
      })

      callback(err, docs.length)

    } else {
      callback(err, 0)
    }



  });


}

var previousHourStatistics = function(db, id, nowTimestamp){

  var previousHourTimestamp = nowTimestamp - 1 * 60 * 60 * 1000

  console.log('\nHOUR')
  console.log(new Date(previousHourTimestamp))
  console.log(new Date(nowTimestamp))


  var timestamp = new Date(previousHourTimestamp)

  var project = {
    $project:
    {
      value : 1,
      date : 1,
      _id : 0,
    }
  }

  var match = {
    $match : {  $and: [
      { date: { $gte: new Date(previousHourTimestamp) } },
      { date: { $lte: new Date(nowTimestamp) } }
    ] }
  }


    var collection = db.collection(id)

    var cursor = collection.aggregate([project,match, projectValue]).toArray(function(err, docs) {

     if(docs.length != 0){

      var mappedArray = docs.map(function (item) { return item.value; });
      var results = generateStatisticsDocument(mappedArray, timestamp)

      db.collection(id+'-hours').update({timestamp: timestamp}, results, { upsert: true }, function(err,res){
        console.log(id+': HOURS '+timestamp);
      })

    }

  });



}

var previousDayStatistics = function(db, id, nowTimestamp){

  var previousDayTimestamp = nowTimestamp - 24 * 60 * 60 * 1000

  console.log('\nDAY:')
  console.log(new Date(previousDayTimestamp))
  console.log(new Date(nowTimestamp))

  var timestamp = new Date(previousDayTimestamp)

  var project = {
    $project:
    {
      value : 1,
      date : 1,
      _id : 0,
    }
  }

  var match = {
    $match : {  $and: [
      { date: { $gte: new Date(previousDayTimestamp) } },
      { date: { $lte: new Date(nowTimestamp) } }
    ] }
  }


    var collection = db.collection(id)

    var cursor = collection.aggregate([project,match, projectValue]).toArray(function(err, docs) {

     if(docs.length != 0){

      var mappedArray = docs.map(function (item) { return item.value; });
      var results = generateStatisticsDocument(mappedArray, timestamp)

      db.collection(id+'-day').update({timestamp: timestamp}, results, { upsert: true }, function(err,res){
        console.log(id+': DAY '+timestamp);
      })

    }

  });


}

var previousMonthStatistics = function(db, id, nowTimestamp){

  var month = new Date(nowTimestamp).getUTCMonth()

  var previousMonthDate = new Date(nowTimestamp)
  previousMonthDate.setUTCMonth(month-1)
  var previousMonthTimestamp = previousMonthDate.getTime()

  var timestamp = new Date(previousMonthTimestamp)

  var project = {
    $project:
    {
      value : 1,
      date : 1,
      _id : 0,
    }
  }

  var match = {
    $match : {  $and: [
      { date: { $gte: new Date(previousMonthTimestamp) } },
      { date: { $lte: new Date(nowTimestamp) } }
    ] }
  }


    var collection = db.collection(id)

    var cursor = collection.aggregate([project,match, projectValue]).toArray(function(err, docs) {

     if(docs.length != 0){

      var mappedArray = docs.map(function (item) { return item.value; });
      var results = generateStatisticsDocument(mappedArray, timestamp)

      db.collection(id+'-month').update({timestamp: timestamp}, results, { upsert: true }, function(err,res){
        console.log(id+': MONTH '+timestamp);
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

exports.monthStatistics = monthStatistics
exports.dayStatistics = dayStatistics
exports.hourStatistics = hourStatistics
exports.previousHourStatistics = previousHourStatistics
exports.previousDayStatistics = previousDayStatistics
exports.previousMonthStatistics = previousMonthStatistics
