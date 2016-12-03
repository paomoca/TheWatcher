var ObjectId = require('mongodb').ObjectID

var statistics = require('./calculate-statistics.js')
var moment = require('moment-timezone')

var runStatistics = function(db, timestamp, callback){

  var previousHourTimestamp = moment(timestamp).subtract(1, 'hour').valueOf()
  var previousDayTimestamp = moment(timestamp).subtract(1, 'day').valueOf()
  var previousMonthTimestamp = moment(timestamp).subtract(1, 'month').valueOf()

  var variables = db.collection('variables')

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
      statistics.hourStatistics(db, id, previousHourTimestamp, timestamp, function(){})
    }

    //Verifica si en la fecha local de la variable la hora es 0
    //Hora 0 representa un cambio de dia
    if(localHour == 0 && localMinutes == 0){
      //Estadisticas del dia
      statistics.dayStatistics(db, id, previousDayTimestamp ,timestamp, function(){})
    }

    //Verifica si en la fecha local de la variable el dia es uno
    //Dia 1 representa un cambio de mes
    if(localHour == 0 && localDay == 1){
      //Estadisticas del mes
      statistics.monthStatistics(db, id, previousMonthTimestamp, timestamp, function(){})
    }

  })

  // db.collection('cron-logs').

  // Return the information of a single collection name
  db.listCollections({name: 'cron-logs'}).toArray(function(err, items) {

    if(err || items.length == 0){
      db.createCollection('cron-logs', { capped : true, size : 100, max : 1 }, function(err, collection) {

        logCronTimestamp(db, timestamp)

      })
    } else {
      logCronTimestamp(db, timestamp)
    }

  })

  callback('Launched all hourly statistic calculations')

}

var logCronTimestamp = function(db, timestamp){

  var collection = db.collection('cron-logs')

  collection.isCapped(function(err, res){
      console.log(res);
  })

  // Insert a document in the capped collection
  collection.insertOne({lastCronTimestamp:timestamp}, function(err, result) {
    if(err){
      console.log('error logging last cron timestamp');
    } else {
      console.log('Logged last cron timestamp to: '+new Date(timestamp))
    }
  })

}

exports.runStatistics = runStatistics
