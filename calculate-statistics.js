var ObjectId = require('mongodb').ObjectID
var statistics = require('simple-statistics')
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

var hourStatistics = function(db, id, minTimestamp, maxTimestamp, callback){

  var timestamp = new Date(minTimestamp)

  var match = {
    $match : {  $and: [
      { date: { $gte: new Date(minTimestamp) } },
      { date: { $lt: new Date(maxTimestamp) } }
    ] }
  }


  var collection = db.collection(id)

  var cursor = collection.aggregate([project,match, projectValue]).toArray(function(err, docs) {

    if(docs.length != 0){

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

  var cursor = collection.aggregate([project,match, projectValue]).toArray(function(err, docs) {

    if(docs.length != 0){

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

  var cursor = collection.aggregate([project,match, projectValue]).toArray(function(err, docs) {

    if(docs.length != 0){

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

var previousHourStatistics = function(db, id, nowTimestamp){

  var previousHourTimestamp = nowTimestamp - 1 * 60 * 60 * 1000

  console.log('\nHOUR')
  console.log(new Date(previousHourTimestamp))
  console.log(new Date(nowTimestamp))

  hourStatistics(db, id, previousHourTimestamp, nowTimestamp, function(err,hasData){

  })

}

var previousDayStatistics = function(db, id, nowTimestamp){

  var previousDayTimestamp = nowTimestamp - 24 * 60 * 60 * 1000

  console.log('\nDAY:')
  console.log(new Date(previousDayTimestamp))
  console.log(new Date(nowTimestamp))

  dayStatistics(db, id, previousDayTimestamp, nowTimestamp, function(err,hasData){

  })

}

var previousMonthStatistics = function(db, id, nowTimestamp){

  var now = new Date(nowTimestamp)
  var month = now.getUTCMonth()
  var year = now.getUTCFullYear()

  if(month==0){
    var prevMonth = 11
    var prevYear = year-1
  } else {
    var prevMonth = month-1
    var prevYear = year
  }

  var minTimestamp = new Date(prevYear, prevMonth, 1, 0, 0, 0, 0).getTime()
  var maxTimestamp = new Date(year, month, 1, 0, 0, 0, 0).getTime()

  console.log('\nMES')
  console.log(new Date(minTimestamp))
  console.log(new Date(maxTimestamp))

  monthStatistics(db, id, minTimestamp, maxTimestamp, function(err,hasData){

  })

}

var generateStatisticsDocument = function(array, timestamp, callback){

  var results = {}

  results.timestamp = timestamp
  results.mean = statistics.mean(array)
  results.mode = statistics.mode(array)
  results.median = statistics.median(array)
  results.arrayCount = array.length
  results.createdAt = new Date()

  callback(results)

}

exports.monthStatistics = monthStatistics
exports.dayStatistics = dayStatistics
exports.hourStatistics = hourStatistics
exports.previousHourStatistics = previousHourStatistics
exports.previousDayStatistics = previousDayStatistics
exports.previousMonthStatistics = previousMonthStatistics
