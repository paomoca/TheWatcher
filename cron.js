var ObjectId = require('mongodb').ObjectID

var db_functions = require('./db_functions.js')
var statistics = require('./calculate-statistics.js')
var date_validations = require('./date-validations.js')

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
      date_validations.calculateVariableLocalHour(UTCHour, timezoneOffset, function(localHour, dayOffset){
        //
        // console.log('UTCHour: '+ UTCHour)
        // console.log('local: '+ localHour)
        // console.log('dayOffset: '+ dayOffset)

        //Verifica si en la fecha local de la variable la hora es 0
        //Hora 0 representa un cambio de dia
        if(localHour == 0){

          //Estadisticas del dia
          statistics.previousDayStatistics(db, id, now.getTime())

          //Calcula el dia local de la variable segun su timezoneOffset
          date_validations.calculateVariableLocalDay(now, dayOffset, function(localDay){

            //Verifica si en la fecha local de la variable el dia es uno
            //Dia 1 representa un cambio de mes
            if(localDay == 1){

              //Estadisticas del mes
              statistics.previousMonthStatistics(db, id, now.getTime())
            }

            // console.log('UTCDay: '+UTCDay)
            // console.log('local DAY: '+localDay)
          })

        }



      })

    })

  });

}

exports.runCronFunction = runCronFunction
