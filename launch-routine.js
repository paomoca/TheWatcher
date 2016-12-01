var ObjectId = require('mongodb').ObjectID
var statistics = require('./calculate-statistics.js')
var db_functions = require('./db_functions.js')
var date_validations = require('./date-validations.js')

/*Inicia en launch(), por cada variable en la db realiza las siguientes acciones:

1. Loop desde el anio inicial (2016) hasta el anio actual
2. Para cada anio que existe genera las estadisticas del anio (1 valor por mes) y hace un loop de sus meses
3. Para cada mes que exista genera las estadisticas del mes (1 valor por dia) y hace un loop de sus dias
4. Para cada dia que exista genera las estadisticas del dia (1 valor por hora)

*/

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
    var variableDataCollection = db.collection(id)

    //Checa cada uno de los anios desde el anio minimo (2016) hasta el actual
    for(var y = minYear; y <= year; y++){

      yearLoop(variableDataCollection, id, y)
      console.log(y);

    }

  });

}

var run = function(db){

  var minYear = 2016
  var minMonth = 0
  var minDay = 1
  var minHour = 0

  var year = new Date().getUTCFullYear()

  db.collection('variables').find({}, {_id:1, timezoneOffset:1}).forEach(function(doc){

    var id = ObjectId(doc._id).toString()
    var variableDataCollection = db.collection(id)
    var timezoneOffset = doc.timezoneOffset

    for(var y = minYear; y <= year; y++){

      for(var m = 0; m < 11; m++){

        months(db, id, y, m, timezoneOffset)

      }

    }


  })

}

var months = function(db, id, y, m, timezoneOffset){

  var d = 1
  var h = 0

  date_validations.calculateUTCOffset(y, m, d, h, timezoneOffset, function(UTCTimestamp){
    var min = UTCTimestamp
    date_validations.calculateUTCOffset(y, m+1, d, h, timezoneOffset, function(UTCTimestamp){
      var max = UTCTimestamp
      statistics.monthStatistics(db, id, min, max, function(err, hasData){

        if(hasData!= 0){
          console.log(id+' had month data')
          var daysInMonth = date_validations.getDaysInMonth(y,m)
          console.log('Checking for # days: '+daysInMonth)
          for(var d = 1; d < daysInMonth; d++){
            days(db, id, y, m , d, timezoneOffset)

          }

        }
      })

    })
  })
}

var days = function(db, id, y, m, d, timezoneOffset){

  var h = 0

  date_validations.calculateUTCOffset(y, m, d, h, timezoneOffset, function(UTCTimestamp){
    var min = UTCTimestamp
    date_validations.calculateUTCOffset(y, m , d+1, h, timezoneOffset, function(UTCTimestamp){
      var max = UTCTimestamp
      statistics.dayStatistics(db, id, min, max, function(err, hasData){

        if(hasData != 0){
          console.log(id+' Had day data');
          for(var h = 0; h < 23; h++){
            hours(db, id, y, m , d, h, timezoneOffset)
          }
        }
        
      })

    })
  })
}

var hours = function(db, id, y, m, d, h, timezoneOffset){

  date_validations.calculateUTCOffset(y, m, d, h, timezoneOffset, function(UTCTimestamp){
    var min = UTCTimestamp
    date_validations.calculateUTCOffset(y, m, d, h+1, timezoneOffset, function(UTCTimestamp){
      var max = UTCTimestamp
      statistics.hourStatistics(db, id, min, max, function(err, hasData){
        if(hasData != 0){
          console.log(id+' had hour data');
        }

      })

    })
  })
}

var yearLoop = function(variableDataCollection, id, y){

  variableDataCollection.aggregate([projectY,{$match : { year: y }}]).toArray(function(err, docs) {

    //Esta variable si tiene el year en el loop, checa month
    if(docs.length != 0){

      for(var m = 0; m <= 11; m++){

        statistics.monthStatistics(db, id, y, m)
        monthLoop(variableDataCollection, id, y, m)

      }

    }

  });

}

var monthLoop = function(variableDataCollection, id, y, m){

  variableDataCollection.aggregate([projectM,{$match : { year: y, month: m }}]).toArray(function(err, docs) {

    if(docs.length != 0){

      console.log('       '+id+'---- '+'m:'+m+' '+docs.length)

      for(var d = 1; d <= 31; d++){

        statistics.dayStatistics(db, id, y, m, d)
        dayLoop(variableDataCollection, id, y, m, d)

      }
    }

  })

}

var dayLoop = function(variableDataCollection, id, y, m, d){


  variableDataCollection.aggregate([projectD,{$match : { year: y, month: m, day: d }}]).toArray(function(err, docs) {

    if(docs.length != 0){

      console.log('                    '+id+'---- '+'d:'+d+' '+docs.length)

      for(var h = 0; h <= 23; h++){

        statistics.hourStatistics(db, id, y, m, d, h)

      }
    }

  })


}

exports.launch = launch
exports.run = run
