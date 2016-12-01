var ObjectId = require('mongodb').ObjectID
var statistics = require('./calculate-statistics.js')
var db_functions = require('./db_functions.js')
var date_validations = require('./date-validations.js')
var moment = require('moment-timezone')


/*Inicia en launch(), por cada variable en la db realiza las siguientes acciones:

1. Loop desde el anio inicial (2016) hasta el anio actual
2. Para cada anio que existe genera las estadisticas del anio (1 valor por mes) y hace un loop de sus meses
3. Para cada mes que exista genera las estadisticas del mes (1 valor por dia) y hace un loop de sus dias
4. Para cada dia que exista genera las estadisticas del dia (1 valor por hora)

*/

//1 Enero 2016 00:00
var minUTCTimestamp = 1451606400000
var minUTC = new Date(minUTCTimestamp)

var run = function(db){

  var minYear = 2016

  var year = new Date().getUTCFullYear()

  db.collection('variables').find({}, {_id:1, timezone:1}).forEach(function(doc){

    var id = ObjectId(doc._id).toString()
    var variableDataCollection = db.collection(id)

    if(doc.timezone){
      var timezone = doc.timezone
    } else {
      var timezone = "America/Mexico_City"
    }

    for(var y = minYear; y <= year; y++){

      for(var m = 0; m < 11; m++){

        months(db, id, y, m, timezone)

      }

    }


  })

}

var months = function(db, id, y, m, timezone){

  var obj = { year : y, month : m, day : 1, hour: 0 };

  var minDate = moment.tz(obj, timezone).utc()
  var maxDate = minDate.clone().add(1, 'month')

  statistics.monthStatistics(db, id, minDate.valueOf(), maxDate.valueOf(), function(err, hasData){

    if(hasData!= 0){

      var daysInMonth = date_validations.getDaysInMonth(y,m)

      for(var d = 1; d < daysInMonth; d++){
        days(db, id, y, m , d, timezone)

      }
    }
  })

}

var days = function(db, id, y, m, d, timezone){

  var obj = { year : y, month : m, day : d, hour: 0 };

  var minDate = moment.tz(obj, timezone).utc()
  var maxDate = minDate.clone().add(1, 'day')

  statistics.dayStatistics(db, id, minDate.valueOf(), maxDate.valueOf(), function(err, hasData){

    if(hasData != 0){
      for(var h = 0; h < 23; h++){
        hours(db, id, y, m , d, h, timezone)
      }
    }

  })

}

var hours = function(db, id, y, m, d, h, timezone){

  var obj = { year : y, month : m, day : d, hour: h };

  var minDate = moment.tz(obj, timezone).utc()
  var maxDate = minDate.clone().add(1, 'hour')


  statistics.hourStatistics(db, id, minDate.valueOf(), maxDate.valueOf(), function(err, hasData){

  })

}


exports.run = run
