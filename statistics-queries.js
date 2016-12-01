var ObjectId = require('mongodb').ObjectID

//Results for every month of that year
var queryYear = function (db, query, id, callback){

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
    $match : { year: parseInt(query.year) }
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


  collection.aggregate([project, match, finalProject]).toArray(function(err, docs) {
    callback(err, docs)
  });

}

//Results for every day of that month
var queryMonth = function (db, query, id, callback){

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
    $match : { year: parseInt(query.year), month: parseInt(query.month) }
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

  collection.aggregate([project,match,finalProject]).toArray(function(err, docs) {
    callback(err, docs)
  });

}

//Results for every hour of that day
var queryDay = function (db, query, id, callback){

  var collection = db.collection(id+'-hours')

  var project = {
    $project:
    {
      _id : 0,
      timestamp: 1,
      arrayCount: 1,
      day: { $cond: [{ $ifNull: ['$timestamp', 0] }, { $dayOfMonth: '$timestamp' }, -1] },
      month: { $cond: [{ $ifNull: ['$timestamp', 0] }, { $month: '$timestamp' }, -1] },
      year: { $cond: [{ $ifNull: ['$timestamp', 0] }, { $year: '$timestamp' }, -1] }
    }
  }

  var match = {
    $match : { year: parseInt(query.year), month: parseInt(query.month), day: parseInt(query.day) }
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

  collection.aggregate([project,match,finalProject]).toArray(function(err, docs) {
    callback(err, docs)
  });

}

//Results for every weekDay of the year
var queryWeekDay = function (db, query, id, callback){

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

  var match = {
    $match : { year: parseInt(query.year), dayOfWeek: parseInt(query.weekDay) }
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

  collection.aggregate([project,match,finalProject]).toArray(function(err, docs) {
    callback(err, docs)
  });

}

//Results for every weekDay of the year at the given hour
var queryWeekDayHour = function (db, query, id, callback){

  var UTCHour = parseInt(query.hour)

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

  var match = {
    $match : { year: parseInt(query.year), dayOfWeek: parseInt(query.weekDay), hour: UTCHour }
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

  collection.aggregate([project, match, finalProject]).toArray(function(err, docs) {
    callback(err, docs)
  });

}

var queryRangeDay = function (db, query, id, callback){

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
      {timestamp: { $gte: new Date(parseInt(query.date1)) } },
      {timestamp: { $lte: new Date(parseInt(query.date2)) } }
    ] }
  }

  finalProject.$project[query.type] = 1

  collection.aggregate([match,finalProject]).toArray(function(err, docs) {
    callback(err, docs)
  });

}

var queryRangeDayHour = function (db, query, id, callback){

  var UTCHour = parseInt(query.hour)

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
      {timestamp: { $gte: new Date(parseInt(query.date1)) } },
      {timestamp: { $lte: new Date(parseInt(query.date2)) } }
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

  collection.aggregate([project, match, finalProject]).toArray(function(err, docs) {
    callback(err, docs)
  });

}

exports.queryYear = queryYear
exports.queryMonth = queryMonth
exports.queryDay = queryDay
exports.queryWeekDay = queryWeekDay
exports.queryWeekDayHour = queryWeekDayHour
exports.queryRangeDay = queryRangeDay
exports.queryRangeDayHour = queryRangeDayHour
