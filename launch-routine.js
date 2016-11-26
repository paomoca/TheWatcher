var ObjectId = require('mongodb').ObjectID
var statistics = require('./statistics-functions.js')

//1 Enero 2016 00:00
var minUTCTimestamp = 1451606400000
var minUTC = new Date(minUTCTimestamp)

var projectY = {
  $project:
  {
    _id : 0,
    year: { $cond: [{ $ifNull: ['$date', 0] }, { $year: '$date' }, -1] }
  }
}

var projectM = {
  $project:
  {
    _id : 0,
    month: { $cond: [{ $ifNull: ['$date', 0] }, { $month: '$date' }, -1] },
    year: { $cond: [{ $ifNull: ['$date', 0] }, { $year: '$date' }, -1] }

  }
}

var projectD = {
  $project:
  {
    _id : 0,
    day: { $cond: [{ $ifNull: ['$date', 0] }, { $dayOfMonth: '$date' }, -1] },
    month: { $cond: [{ $ifNull: ['$date', 0] }, { $month: '$date' }, -1] },
    year: { $cond: [{ $ifNull: ['$date', 0] }, { $year: '$date' }, -1] }
  }
}

var projectH = {
  $project:
  {
    _id : 0,
    hour: { $cond: [{ $ifNull: ['$date', 0] }, { $hour: '$date' }, -1] },
    day: { $cond: [{ $ifNull: ['$date', 0] }, { $dayOfMonth: '$date' }, -1] },
    month: { $cond: [{ $ifNull: ['$date', 0] }, { $month: '$date' }, -1] },
    year: { $cond: [{ $ifNull: ['$date', 0] }, { $year: '$date' }, -1] }
  }
}



var launch = function(db){

  var minYear = minUTC.getUTCFullYear()
  var year = new Date().getUTCFullYear()
  var variables = db.collection('variables')

  //Se obtiene cada una de las variables registradas en la base de datos
  variables.find({}, {_id:1}).forEach(function(doc){

    var id = ObjectId(doc._id).toString()
    var collection = db.collection(id)

    //Checa year
    for(var y = minYear; y <= year; y++){

      yearLoop(collection, id, y)

    }

  });

}

var yearLoop = function(collection, id, y){

  collection.aggregate([projectY,{$match : { year: y }}]).toArray(function(err, docs) {

   //Esta variable si tiene el year en el loop, checa month
   if(docs.length != 0){

     console.log(id+'---- '+'y:'+y+' '+docs.length)

     for(var m = 1; m <= 12; m++){

      statistics.yearStatistics(db, id, y, m)
      monthLoop(collection, id, y, m)

     }

   }

 });

}

var monthLoop = function(collection, id, y, m){

  collection.aggregate([projectM,{$match : { year: y, month: m }}]).toArray(function(err, docs) {

    if(docs.length != 0){

      console.log('       '+id+'---- '+'m:'+m+' '+docs.length)

      for(var d = 1; d <= 31; d++){

        statistics.monthStatistics(db, id, y, m, d)
        dayLoop(collection, id, y, m, d)

     }
    }

  })

}

var dayLoop = function(collection, id, y, m, d){


  collection.aggregate([projectD,{$match : { year: y, month: m, day: d }}]).toArray(function(err, docs) {

    if(docs.length != 0){
      
      console.log('                    '+id+'---- '+'d:'+d+' '+docs.length)

      for(var h = 0; h <= 24; h++){

        statistics.dayStatistics(db, id, y, m, d, h)

     }
    }

  })


}


var hourRoutine = function(db){

  console.log('HOUR-------')

  var startHour = minUTCTimestamp
  var finalHour = new Date().getTime()

  for(var h = startHour; h <= finalHour; h = h+1*60*60*1000){
    var date = new Date(h)
    statistics.hourStatistics(db, date)
  //  console.log(date.toUTCString());

  }

}

var dayRoutine = function(callback){



}

var monthRoutine = function(db){

  console.log('HOUR-------')

  var minYear = minUTC.getUTCFullYear()
  var year = new Date().getUTCFullYear()

  for(var y = minYear; y <= year; y++){

    for(var m = 1; m <= 12; m++){

      date = cleanDate()
      date.setUTCMonth(m)
      date.setUTCFullYear(y)

      statistics.monthStatistics(db, date)

    }

  }

}

var cleanDate = function(){

  return new Date(minUTCTimestamp)

}

exports.hourRoutine = hourRoutine
exports.dayRoutine = dayRoutine
exports.monthRoutine = monthRoutine

exports.launch = launch
