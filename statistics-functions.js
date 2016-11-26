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

var hourStatistics = function(db){

  console.log('HOUR -------')

  var startHour = minUTCTimestamp
  var finalHour = new Date().getTime()

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

  var variables = db.collection('variables')

  //Get every variable id and iterate over each result
  variables.find({}, {_id:1}).forEach(function(doc){

    var id = ObjectId(doc._id).toString()
    var collection = db.collection(id)

    for(var h = startHour; h <= finalHour; h = h+1*60*60*1000){

      var date = new Date(h)

      var match = {
        $match : { hour : date.getUTCHours(), day: date.getUTCDate(), month: date.getUTCMonth()+1, year: date.getUTCFullYear()}
      }

      var cursor = collection.aggregate([project,match,projectValue]).toArray(function(err, docs) {

         if(docs.length != 0){

          var mappedArray = docs.map(function (item) { return item.value; });
          var results = generateStatisticsDocument(mappedArray, date)

          db.collection(id+'-hour').update({timestamp: date.simpleTimestamp}, results, { upsert: true }, function(err,res){
            console.log(id+'-----'+res.result.nModified+' ---DATE: '+date.toUTCString());
          })

        } else {
          console.log('no docs');
        }

      });


    }




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
      $match : { day: date.getUTCDate(), month: date.getUTCMonth(), year: date.getUTCFullYear()}
    }

    var cursor = collection.aggregate([project,match,projectValue]).toArray(function(err, docs) {

       if(docs.length != 0){

        var mappedArray = docs.map(function (item) { return item.value; });
        var results = generateStatisticsDocument(mappedArray, date)

        db.collection(id+'-day').update({timestamp: date.simpleTimestamp}, results, { upsert: true }, function(err,res){
          console.log(id+'-----'+res.result.nModified+' ---DATE: '+date.toUTCString());
        })

      }

    });

  });
}

var monthStatistics = function(db, date){



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
      $match : { month: date.getUTCMonth(), year: date.getUTCFullYear()}
    }

    var cursor = collection.aggregate([project,match,projectValue]).toArray(function(err, docs) {

       if(docs.length != 0){

        var mappedArray = docs.map(function (item) { return item.value; });
        var results = generateStatisticsDocument(mappedArray, date)

        db.collection(id+'-month').update({timestamp: date.simpleTimestamp}, results, { upsert: true }, function(err,res){
          console.log(id+'-----'+res.result.nModified+' ---DATE: '+date.toUTCString());
        })

      }

    });

  });
}

var create = function(cursor, date, id, type, callback){

  cursor.toArray(function(err, docs) {

    if(err){
      console.log(err)
    } else if(docs.length == 0){
      console.log('non '+type)

    } else {

      var mappedArray = docs.map(function (item) { return item.value; });
      var results = generateStatisticsDocument(mappedArray, date)

      db.collection(id+'-'+type).update({timestamp: date.simpleTimestamp}, results, { upsert: true }, function(err,res){

      })

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
