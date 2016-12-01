var ObjectId = require('mongodb').ObjectID

var db_functions = require('./db_functions.js')
var statistics = require('./calculate-statistics.js')

var runCronFunction = function(now, callback){

  var UTCHour = now.getUTCHours()
  var UTCDay = now.getUTCDate()

  var variables = db.collection('variables')

  //Se obtiene cada una de las variables registradas en la base de datos
  variables.find({}, {_id:1}).forEach(function(doc){

    var id = ObjectId(doc._id).toString()
    var variableDataCollection = db.collection(id)

    //Estadisticas de la hora pasada
    statistics.previousHourStatistics(db, id, now.getTime())

    //Obtiene el timezoneOffset de la variable para decidir si hay un cambio de
    //mes o dia en la hora local de la variable
    db_functions.getVariableOffset(db, id, function(timezoneOffset){

      //Calcula la hora local de la variable segun su timezoneOffset
      calculateVariableLocalHour(UTCHour, timezoneOffset, function(localHour, dayOffset){

        console.log('UTCHour: '+ UTCHour)
        console.log('local: '+ localHour)
        console.log('dayOffset: '+ dayOffset)

        //Verifica si en la fecha local de la variable la hora es 0
        //Hora 0 representa un cambio de dia
        if(localHour == 0){

          //Estadisticas del dia
          statistics.previousDayStatistics(db, id, now.getTime())

          //Calcula el dia local de la variable segun su timezoneOffset
          calculateVariableLocalDay(now, dayOffset, function(localDay){

            //Verifica si en la fecha local de la variable el dia es uno
            //Dia 1 representa un cambio de mes
            if(localDay == 1){

              //Estadisticas del mes
              statistics.previousMonthStatistics(db, id, now.getTime())
            }

            console.log('UTCDay: '+UTCDay)
            console.log('local DAY: '+localDay)
          })

        }



      })

    })

  });

}

var calculateVariableLocalHour = function(UTCHour, timezoneOffset, callback){

  var localHour = ((UTCHour*60) - timezoneOffset)/60
  console.log('\ncalculatedLocalHour: '+localHour)
  var dayOffset = 0

  //If the hour is greater than 24 it means we moved to the next weekDay
  if(localHour >= 24){
    localHour = localHour - 24
    dayOffset = 1
  }

  //If the hour is a negative number it means we go back one weekDay
  if(localHour < 0){
    localHour = localHour + 24
    dayOffset = -1
  }

  callback(localHour, dayOffset)
}

var calculateVariableLocalDay = function(now, dayOffset, callback){

  var time = now.getTime()
  var offset = dayOffset * 24 * 60 * 60 * 1000

  var offsetedTime = time + offset
  var offsetedDate = new Date(offsetedTime)

  var localDay = offsetedDate.getUTCDate()

  callback(localDay)

}

var calculatePreviousHourTimestamp = function(now, callback){

  var previousHourTimestamp = now - 1 * 60 * 60 * 1000

  callback(previousHourTimestamp)

}

exports.runCronFunction = runCronFunction
