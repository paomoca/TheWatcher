var ObjectId = require('mongodb').ObjectID
var statistics = require('simple-statistics')

var projectValue = {
  $project:
  {
    value : 1,
    _id : 0,
  }
}

var hourStatistics = function(db, date){

  console.log('HOUR-------')

  var variables = db.collection('variables')

  //Get every variable id and iterate over each result
  variables.find({}, {_id:1}).forEach(function(doc){

    var id = ObjectId(doc._id).toString()
    var collection = db.collection(id)

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
      $match : { hour : date.matchTo.hour, day: date.matchTo.day, month: date.matchTo.month, year: date.matchTo.year}
    }

    var cursor = collection.aggregate([project,match,projectValue])

    create(cursor, date, id, "hour")

  });

}

var dayStatistics = function(db, date){

  console.log('DAY-------')

  var variables = db.collection('variables')

  //Get every variable id and iterate over each result
  variables.find({}, {_id:1}).forEach(function(doc){

    var id = ObjectId(doc._id).toString()
    var collection = db.collection(id)

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
      $match : {day: date.matchTo.day, month: date.matchTo.month, year: date.matchTo.year}
    }

    var cursor = collection.aggregate([project,match,projectValue])

    create(cursor, date, id, "day")

  });
}

var monthStatistics = function(db, date){

  console.log('MONTH------')

  var variables = db.collection('variables')

  //Get every variable id and iterate over each result
  variables.find({}, {_id:1}).forEach(function(doc){

    var id = ObjectId(doc._id).toString()
    var collection = db.collection(id)

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
      $match : {month: date.matchTo.month, year: date.matchTo.year}
    }

    var cursor = collection.aggregate([project,match,projectValue])

    create(cursor, date, id, "month")

  });
}

var create = function(cursor, date, id, type){

  cursor.toArray(function(err, docs) {

    if(err){
      console.log(err)
    } else if(docs.length == 0){
      console.log('non '+type)

    } else {

      var mappedArray = docs.map(function (item) { return item.value; });
      var results = generateStatisticsDocument(mappedArray, date)

      db.collection(id+'-'+type).update({timestamp: date.simpleTimestamp}, results, { upsert: true })

      console.log(id)
      console.log(mappedArray)
      console.log(results)
    }

  });

}


var generateStatisticsDocument = function(array, date){

  var results = {}

  results.timestamp = date.simpleTimestamp
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
