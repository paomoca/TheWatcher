var ObjectId = require('mongodb').ObjectID
var db_functions = require('./db_functions.js')
var moment = require('moment-timezone')

var sort = {
  $sort : {
    value : 1
  }
}

//Results for every month of that year
var queryYear = function (db, query, id, callback){

  var obj1 = { year : parseInt(query.year), month: 0, day: 1, hour: 0 }

  db_functions.getVariableTimezone(db, id, function(timezone){

    var date1 = moment.tz(obj1, timezone).utc()
    var date2 = date1.clone().add(1, 'year')

    var collection = db.collection(id+'-month')

    var project = {
      $project:
      {
        _id : 0,
        timestamp: 1,
        arrayCount: 1,
        year: { $cond: [{ $ifNull: ['$timestamp', 0] }, { $year: '$timestamp' }, -1] }
      }
    }

    var match = {
      $match : {  $and: [
        {timestamp: { $gte: new Date(parseInt(date1.valueOf())) } },
        {timestamp: { $lt: new Date(parseInt(date2.valueOf())) } }
      ] }
    }

    var finalProject = {
      $project:
      {
        timestamp : 1,
        arrayCount: 1,
        _id : 0,
      }
    }

    project.$project[query.type] = 1
    finalProject.$project[query.type] = 1


    collection.aggregate([project, match, finalProject, sort]).toArray(function(err, docs) {
      callback(err, docs)
    });

  })

}

//Results for every day of that month
var queryMonth = function (db, query, id, callback){

  var obj1 = { year : parseInt(query.year), month: parseInt(query.month), day: 1, hour: 0 }

  db_functions.getVariableTimezone(db, id, function(timezone){

    var date1 = moment.tz(obj1, timezone).utc()
    var date2 = date1.clone().add(1, 'month')

    var collection = db.collection(id+'-day')

    var project = {
      $project:
      {
        _id : 0,
        timestamp: 1,
        arrayCount: 1,
        month: { $cond: [{ $ifNull: ['$timestamp', 0] }, { $month: '$timestamp' }, -1] },
        year: { $cond: [{ $ifNull: ['$timestamp', 0] }, { $year: '$timestamp' }, -1] }
      }
    }

    var match = {
      $match : {  $and: [
        {timestamp: { $gte: new Date(parseInt(date1.valueOf())) } },
        {timestamp: { $lt: new Date(parseInt(date2.valueOf())) } }
      ] }
    }

    var finalProject = {
      $project:
      {
        timestamp : 1,
        arrayCount: 1,
        _id : 0,
      }
    }

    project.$project[query.type] = 1
    finalProject.$project[query.type] = 1

    collection.aggregate([project,match,finalProject, sort]).toArray(function(err, docs) {
      callback(err, docs)
    });


  })

}

//Results for every hour of that day
var queryDay = function (db, query, id, callback){

  var obj1 = { year : parseInt(query.year), month: parseInt(query.month), day: parseInt(query.day), hour: 0 }

  db_functions.getVariableTimezone(db, id, function(timezone){

    var date1 = moment.tz(obj1, timezone).utc()
    var date2 = date1.clone().add(1, 'day')

    var collection = db.collection(id+'-hours')

    var project = {
      $project:
      {
        _id : 0,
        timestamp: 1,
        arrayCount: 1,
      }
    }

    var match = {
      $match : {  $and: [
        {timestamp: { $gte: new Date(parseInt(date1.valueOf())) } },
        {timestamp: { $lt: new Date(parseInt(date2.valueOf())) } }
      ] }
    }

    var finalProject = {
      $project:
      {
        timestamp : 1,
        arrayCount: 1,
        _id : 0,
      }
    }

    project.$project[query.type] = 1
    finalProject.$project[query.type] = 1

    collection.aggregate([project,match,finalProject, sort]).toArray(function(err, docs) {
      callback(err, docs)
    });

  })



}

//Results for every weekDay of the year
var queryWeekDay = function (db, query, id, callback){

  var obj = { year : parseInt(query.year), hour: 0 }

  db_functions.getVariableTimezone(db, id, function(timezone){

    var mt = moment.tz(obj, timezone).day(parseInt(query.weekDay))
    var UTCWeekDay = mt.clone().utc().day()

    var collection = db.collection(id+'-day')

    var project = {
      $project:
      {
        _id : 0,
        timestamp: 1,
        arrayCount: 1,
        dayOfWeek: { $cond: [{ $ifNull: ['$timestamp', 0] }, { $dayOfWeek: '$timestamp' }, -1] },
        year: { $cond: [{ $ifNull: ['$timestamp', 0] }, { $year: '$timestamp' }, -1] }
      }
    }

    //MOMENT maneja el weekDay como : [0-6] (Sunday-Saturday)
    //El query lo recibe como: [0-6] (Sunday-Saturday)
    //MONGO maneja el weekDay como : [1-7] (Sunday-Saturday) entonces le sumamos 1
    var match = {
      $match : { year: parseInt(query.year), dayOfWeek: UTCWeekDay+1 }
    }

    var finalProject = {
      $project:
      {
        timestamp : 1,
        arrayCount: 1,
        _id : 0,
      }
    }

    project.$project[query.type] = 1
    finalProject.$project[query.type] = 1

    collection.aggregate([project,match,finalProject, sort]).toArray(function(err, docs) {
      callback(err, docs)
    });

  })



}

//Results for every weekDay of the year at the given hour
var queryWeekDayHour = function (db, query, id, callback){

  var obj = { year : parseInt(query.year), hour: parseInt(query.hour) }

  db_functions.getVariableTimezone(db, id, function(timezone){

    var mt = moment.tz(obj, timezone).day(parseInt(query.weekDay))
    var utc = mt.clone().utc()

    var UTCWeekDay = utc.day()
    var UTCHour = utc.hour()

    var collection = db.collection(id+'-hours')

    var project = {
      $project:
      {
        _id : 0,
        timestamp: 1,
        arrayCount: 1,
        hour: { $cond: [{ $ifNull: ['$timestamp', 0] }, { $hour: '$timestamp' }, -1] },
        dayOfWeek: { $cond: [{ $ifNull: ['$timestamp', 0] }, { $dayOfWeek: '$timestamp' }, -1] },
        year: { $cond: [{ $ifNull: ['$timestamp', 0] }, { $year: '$timestamp' }, -1] }
      }
    }

    //MOMENT maneja el weekDay como : [0-6] (Sunday-Saturday)
    //El query lo recibe como: [0-6] (Sunday-Saturday)
    //MONGO maneja el weekDay como : [1-7] (Sunday-Saturday) entonces le sumamos 1
    var match = {
      $match : { year: parseInt(query.year), dayOfWeek: UTCWeekDay+1, hour: UTCHour }
    }

    var finalProject = {
      $project:
      {
        timestamp : 1,
        arrayCount: 1,
        _id : 0,
      }
    }

    project.$project[query.type] = 1
    finalProject.$project[query.type] = 1

    collection.aggregate([project, match, finalProject, sort]).toArray(function(err, docs) {
      callback(err, docs)
    });

  })

}

var queryRangeDay = function (db, query, id, callback){

  var obj1 = { year : parseInt(query.y1), month: parseInt(query.m1), day: parseInt(query.d1) }
  var obj2 = { year : parseInt(query.y2), month: parseInt(query.m2), day: parseInt(query.d2) }

  db_functions.getVariableTimezone(db, id, function(timezone){

    var date1 = moment.tz(obj1, timezone).utc()
    var date2 = moment.tz(obj2, timezone).utc()

    var collection = db.collection(id+'-day')

    var finalProject = {
      $project:
      {
        timestamp : 1,
        arrayCount: 1,
        _id : 0,
      }
    }

    var match = {
      $match : {  $and: [
        {timestamp: { $gte: new Date(parseInt(date1.valueOf())) } },
        {timestamp: { $lte: new Date(parseInt(date2.valueOf())) } }
      ] }
    }

    finalProject.$project[query.type] = 1

    collection.aggregate([match,finalProject, sort]).toArray(function(err, docs) {
      callback(err, docs)
    });

  })

}

var queryRangeDayHour = function (db, query, id, callback){

  var obj1 = { year : parseInt(query.y1), month: parseInt(query.m1), day: parseInt(query.d1), hour: parseInt(query.hour) }
  var obj2 = { year : parseInt(query.y2), month: parseInt(query.m2), day: parseInt(query.d2), hour: parseInt(query.hour) }

  db_functions.getVariableTimezone(db, id, function(timezone){

    var date1 = moment.tz(obj1, timezone).utc()
    var date2 = moment.tz(obj2, timezone).utc()
    var UTCHour = date1.hour()

    var collection = db.collection(id+'-hours')

    var project = {
      $project:
      {
        _id : 0,
        timestamp: 1,
        arrayCount: 1,
        hour: { $cond: [{ $ifNull: ['$timestamp', 0] }, { $hour: '$timestamp' }, -1] },
      }
    }

    var match = {
      $match : {  $and: [
        { hour: UTCHour },
        {timestamp: { $gte: new Date(parseInt(date1.valueOf())) } },
        {timestamp: { $lte: new Date(parseInt(date2.valueOf())) } }
      ] }
    }

    var finalProject = {
      $project:
      {
        timestamp : 1,
        arrayCount: 1,
        _id : 0,
      }
    }

    project.$project[query.type] = 1
    finalProject.$project[query.type] = 1

    collection.aggregate([project, match, finalProject, sort]).toArray(function(err, docs) {
      callback(err, docs)
    });

  })



}

exports.queryYear = queryYear
exports.queryMonth = queryMonth
exports.queryDay = queryDay
exports.queryWeekDay = queryWeekDay
exports.queryWeekDayHour = queryWeekDayHour
exports.queryRangeDay = queryRangeDay
exports.queryRangeDayHour = queryRangeDayHour
