var ObjectId = require('mongodb').ObjectID

var db_functions = require('./db_functions.js')
var statistics = require('./calculate-statistics.js')
var date_validations = require('./date-validations.js')
var moment = require('moment-timezone')

var runStatistics = function(db, timestamp, callback){

  var variables = db.collection('variables')
  var date = new Date(timestamp)

  //Se obtiene cada una de las variables registradas en la base de datos
  variables.find({}, {_id:1, timezone:1}).forEach(function(doc){

    var id = ObjectId(doc._id).toString()
    var variableDataCollection = db.collection(id)

    if(doc.timezone){
      var timezone = doc.timezone
    } else {
      var timezone = "America/Mexico_City"
    }

    var localVariableTime = moment.tz(timestamp, timezone)
    var localHour = localVariableTime.hour()
    var localDay = localVariableTime.date()
    var localMinutes = localVariableTime.minutes()

    if(localMinutes == 0){
      //Estadisticas de la hora pasada
      statistics.previousHourStatistics(db, id, timestamp)
    }

    //Verifica si en la fecha local de la variable la hora es 0
    //Hora 0 representa un cambio de dia
    if(localHour == 0 && localMinutes == 0){
      //Estadisticas del dia
      statistics.previousDayStatistics(db, id, timestamp)
    }

    //Verifica si en la fecha local de la variable el dia es uno
    //Dia 1 representa un cambio de mes
    if(localHour == 0 && localDay == 1){
      //Estadisticas del mes
      statistics.previousMonthStatistics(db, id, timestamp)
    }

    // console.log('\n '+timezone);
    // console.log(date)
    // console.log(localVariableTime.date());
    // console.log(localVariableTime.day());
    // console.log(localVariableTime.month());
    // console.log(localVariableTime.year());
    // console.log(localVariableTime.hour());

  })

}

//exports.runCronFunction = runCronFunction
exports.runStatistics = runStatistics
