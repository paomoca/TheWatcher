var ObjectId = require('mongodb').ObjectID
var statistics = require('simple-statistics')

Date.prototype.hour = function() {

  this.prevHour = new Date(this.getTime() - (1*60*60*1000)).getHours()

  this.simpleTimestamp = new Date(this)
  this.simpleTimestamp.setHours(this.prevHour)
  this.simpleTimestamp.setMinutes(0)
  this.simpleTimestamp.setSeconds(0)
  this.simpleTimestamp.setMilliseconds(0)

  this.day = this.getDate()
  this.month = this.getMonth()+1
  this.year = this.getFullYear()

  console.log('date: '+ this)
  console.log('prevHour: '+ this.prevHour)
  console.log('new time: '+ this.simpleTimestamp)

}

Date.prototype.day = function() {

  this.prevDay = new Date(this.getTime() - (24*60*60*1000)).getDate()

  this.simpleTimestamp = new Date(this)
  this.simpleTimestamp.setDate(this.prevDay)
  this.simpleTimestamp.setHours(0)
  this.simpleTimestamp.setMinutes(0)
  this.simpleTimestamp.setSeconds(0)
  this.simpleTimestamp.setMilliseconds(0)


  this.month = this.getMonth()+1
  this.year = this.getFullYear()

  console.log('date: '+ this)
  console.log('prevDay: '+this.prevDay)
  console.log('new time: '+ this.simpleTimestamp)


}

Date.prototype.month = function() {

  var prevMonth = this.getMonth() - 1

  if(prevMonth == -1)
    prevMonth = 11

  this.simpleTimestamp = new Date(this)
  this.simpleTimestamp.setMonth(prevMonth)
  this.simpleTimestamp.setDate(1)
  this.simpleTimestamp.setHours(0)
  this.simpleTimestamp.setMinutes(0)
  this.simpleTimestamp.setSeconds(0)
  this.simpleTimestamp.setMilliseconds(0)

  this.day = this.getDate()
  this.month = this.getMonth()+1
  this.year = this.getFullYear()

  console.log('date: '+ this)
  console.log('prevMonth: '+prevMonth)
  console.log('new time: '+ this.simpleTimestamp)


}

var hourStatistics = function(db){

  var variables = db.collection('variables')

  var date = new Date()
  date.hour()

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
      $match : { hour : date.prevHour, day: date.day, month: date.month, year: date.year}
    }

    var project2 = {
      $project:
      {
        value : 1,
        _id : 0,
      }
    }

    var cursor = collection.aggregate([project,match,project2])

    cursor.toArray(function(err, docs) {

      if(err){
        console.log(err)
      } else if(docs.length == 0){
        console.log('non hour')

      } else {
        var mappedArray = docs.map(function (item) { return item.value; });
        console.log(mappedArray)
        var results = generateStatisticsDocument(mappedArray, date)
        console.log(results)

        db.collection(id+'-hour').update({timestamp: date.simpleTimestamp}, results, { upsert: true })

      }

    });

  });

}

var dayStatistics = function(db){

  console.log('DAY-------')

  var date = new Date()
  date.day()

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
      $match : {day: date.prevDay, month: date.month, year: date.year}
    }

    var project2 = {
      $project:
      {
        value : 1,
        _id : 0,
      }
    }

    var cursor = collection.aggregate([project,match,project2])

    cursor.toArray(function(err, docs) {

      if(err){
        console.log(err)
      } else if(docs.length == 0){
        console.log('non day')

      } else {
        var mappedArray = docs.map(function (item) { return item.value; });
        console.log(mappedArray)
        var results = generateStatisticsDocument(mappedArray, date)
        console.log(results)

        db.collection(id+'-day').update({timestamp: date.simpleTimestamp}, results, { upsert: true })

      }

    });

  });
}

var monthStatistics = function(db){

  console.log('MONTH------')

  var date = new Date()
  console.log(date)

  date.month()
}


var generateStatisticsDocument = function(array, date){

  var results = {}

  results.timestamp = date.simpleTimestamp
  results.mean = statistics.mean(array)
  results.mode = statistics.mode(array)
  results.median = statistics.median(array)
  results.createdAt = new Date()

  return results;

}

exports.monthStatistics = monthStatistics
exports.dayStatistics = dayStatistics
exports.hourStatistics = hourStatistics
