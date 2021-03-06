var express = require('express')
var MongoClient = require('mongodb').MongoClient
var assert = require('assert')
var validate = require('express-jsonschema').validate
var bodyParser = require('body-parser')
var cron = require('node-cron')
var moment = require('moment-timezone')

var schemas = require('./schemas.js')
var db_functions = require('./db_functions.js')
var statistics_queries = require('./statistics-queries.js')
var cron_functions = require('./cron.js')

var statistics = require('./calculate-statistics.js')

var app = express()
//var jwt = require('express-jwt')

// var jwtCheck = jwt({
//   secret: new Buffer('IPX4p3ofCMLuR6k0AWwzkAvb2HicsSsPI9FRR201KHZgtZa10KWcoub2Uu0Cf6wo', 'base64'),
//   audience: '4qmgJ7ZFCGDjppO2ZOFP2tkSBETCAA3Y'
// })

//app.use('/variable', jwtCheck);

app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE')
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next();
});

// Connection URL
//var url = 'mongodb://172.16.73.145:27017/juan';
//the-watcher
//myproject
var url = 'mongodb://localhost:27017/the-watcher';
//var url = 'mongodb://juan:juanito@ds057176.mlab.com:57176/paomoca-tests'

// Use connect method to connect to the server
MongoClient.connect(url, function(err, database) {

  assert.equal(null, err);
  console.log("Connected successfully to server")
  db = database


  cron.schedule('0 0-23 * * *', function(){

    console.log('***** running every HOUR from 1 to 23 ')

    var now = new Date()
    now.setUTCMinutes(0)
    now.setUTCSeconds(0)
    now.setUTCMilliseconds(0)

    cron_functions.runStatistics(db, now.getTime(), function(msg){
      console.log(msg)
    })

  });

});

var jsonRespose = function(res, status, json){

  res.status(status)
  res.setHeader('Content-Type', 'application/json');
  res.send(json)

}

app.post('/hola', function(req, res){

  console.log(req)
  console.log(req.body)

  var response = JSON.stringify({
    payload: {
      dataKey: 'funciono post'
    }
  })
  jsonRespose(res, 200, response)

})

app.get('/hola', function(req, res){

  console.log(req)
  console.log(req.body)

  var response = JSON.stringify({
    payload: {
      dataKey: 'funciono get'
    }
  })
  jsonRespose(res, 200, response)

})

/* API PANEL ADMINISTRADOR ***********************************************************************************************/

// 1. Nuevo tipo de variable

//Prueba

//   {
// "payload":
// 	{
// "nombre": "Latas",
//  "lugar": "CUBO",
//  "unidad": "número",
//  "descripcion": "Contador de latas",
//  "foto_url": "latas.jpg",
//  "timezoneOffset": 360
//  }
// }
app.post('/variable', validate({body: schemas.VariableSchema}), function (req, res, next) {

  db_functions.insertVariable(db, req.body.payload, function(err, result) {

    if(err){
      next(err)
    } else {
      var response = JSON.stringify({
        payload: {
          dataKey: result.insertedId
        }
      })
      jsonRespose(res, 200, response)
    }
  })

})

app.delete('/variable/:dataKey', function(req, res, next){
  console.log('got delete variable');

  db_functions.removeVariable(db, req.params.dataKey, function(err, result){

    if(err){
      next(err)
    } else {

      var response = JSON.stringify({
        payload: {
          removed: req.params.dataKey
        }
      })

      jsonRespose(res, 200, response)
    }

  })

})

// 2. Nuevo dispositivo

//Prueba

//   {
//  "payload": {
//  "nombre" : "Device 1",
//  "lugar" : "Estacionamiento puerta 6",
//  "variable_id": "582a4b5e8cd48d060770c8f8",
//  "descripcion":"Chiquito y brillante"
//  }
// }
app.post('/device', validate({body: schemas.DeviceSchema}), function (req, res, next) {

  db_functions.insertDevice(db, req.body.payload, function(err, result) {

    if(err){
      next(err)
    } else {

      var response = JSON.stringify({
        payload: {
          deviceKey: result.insertedId
        }
      })

      jsonRespose(res, 200, response)
    }

  })

})

app.delete('/device/:deviceKey', function(req, res, next){
  console.log('got delete device');

  db_functions.removeDevice(db, req.params.deviceKey, function(err, result){

    if(err){
      next(err)
    } else {

      var response = JSON.stringify({
        payload: {
          removed: req.params.deviceKey
        }
      })

      jsonRespose(res, 200, response)
    }

  })
})

//6. Petición de lista de variables
app.get('/variables', function (req, res) {

  db_functions.findAllVariables(db, function(err, docs){
    if(err){
      next(err)
    } else {
      jsonRespose(res, 200, docs)
    }
  })

})

// 7. Petición de la información de una variable en específico
app.get('/variable/:variable_id', function (req, res) {

  db_functions.findVariable(db, req.params.variable_id, function(err, docs){
    if(err){
      next(err)
    } else {
      jsonRespose(res, 200, docs)
    }
  })

})

// 8. Petición de lista de dispositivos: de una variable en específico
app.get('/devices/:variable_id', function (req, res) {

  db_functions.findVariableDevices(db, req.params.variable_id, function(err, docs){
    if(err){
      next(err)
    } else {
      jsonRespose(res, 200, docs)
    }
  })

})

// 9. Petición de la información de un device en específico
app.get('/device/:deviceKey', function (req, res) {

  db_functions.findDevice(db, req.params.deviceKey, function(err, docs){
    if(err){
      next(err)
    } else {
      jsonRespose(res, 200, docs)
    }
  })

})

/* API INSERCION DE MEDICIONES **************************************************************************/

// 3. Inserción de múltiples mediciones: cualquier variable, cualquier dispositivo

//Prueba
// {
// "payload": {
// "data": [
// {
// "dataKey" : "582a4b5e8cd48d060770c8f8",
// "deviceKey": "582a50f293bcda0676227ee6",
// "measurements":[ {"time": 12345678, "value": 0.456} ]
// }
// ]
// }
// }
app.post('/data', validate({body: schemas.DataSchema}), function (req, res, next) {

  var dataArray = req.body.payload.data

  dataArray.forEach(function(dataItem){

    var dataKey = dataItem.dataKey
    var deviceKey = dataItem.deviceKey
    var measurementsArray = dataItem.measurements

    measurementsArray.forEach(function(measurementItem){

      measurementItem.deviceKey = deviceKey
      measurementItem.date = new Date(parseInt(measurementItem.time))
      measurementItem.time = parseInt(measurementItem.time)

    })

    db_functions.insertData(db, dataKey, deviceKey, measurementsArray, function(err,result) {

      if(err){
        next(err)
      } else {

        var response = JSON.stringify({
          payload: {
            insertedCount: result.insertedCount
          }
        })

        jsonRespose(res, 200, response)
      }

    })

  });

})

// 4. Inserción de múltiples mediciones: una variable en específico

//Prueba

// {
// "payload": {
// "data": [
// {
// "deviceKey": "582a50f293bcda0676227ee6",
// "measurements":[ {"time": 12345678, "value": 0.556},
// {"time": 12345678, "value": 1.456},
// {"time": 12345678, "value": 2.456},
// {"time": 12345678, "value": 3.456}]
// }
// ]
// }
// }
app.post('/data/:dataKey', validate({body: schemas.VariableDataSchema}), function (req, res, next) {

  var dataArray = req.body.payload.data
  var dataKey = req.params.dataKey


  dataArray.forEach(function(dataItem){

    var deviceKey = dataItem.deviceKey
    var measurementsArray = dataItem.measurements

    measurementsArray.forEach(function(measurementItem){
      measurementItem.deviceKey = deviceKey
      measurementItem.date = new Date(parseInt(measurementItem.time))
      measurementItem.time = parseInt(measurementItem.time)


    })

    db_functions.insertData(db, dataKey, deviceKey, measurementsArray, function(err, result) {

      if(err){
        next(err)
      } else {

        var response = JSON.stringify({
          payload: {
            insertedCount: result.insertedCount
          }
        })

        jsonRespose(res, 200, response)
      }

    })

  });


})

// 5. Inserción de múltiples mediciones: una variable en específico, un dispositivo en específico
//Prueba
// {
// "payload": {
// "data": [
// {
// "measurements":[ {"time": 12345678, "value": 0.8},
// {"time": 12345678, "value": 1.0},
// {"time": 12345678, "value": 2.0},
// {"time": 12345678, "value": 3.0}]
// }
// ]
// }
// }
app.post('/data/:dataKey/:deviceKey', validate({body: schemas.DeviceDataSchema}), function (req, res, next) {

  var dataKey = req.params.dataKey
  var deviceKey = req.params.deviceKey

  var dataArray = req.body.payload.data

  dataArray.forEach(function(dataItem){

    var measurementsArray = dataItem.measurements

    measurementsArray.forEach(function(measurementItem){
      measurementItem.deviceKey = deviceKey
      measurementItem.date = new Date(parseInt(measurementItem.time))
      measurementItem.time = parseInt(measurementItem.time)

    })

    db_functions.insertData(db, dataKey, deviceKey, measurementsArray, function(err, result) {

      if(err){
        next(err)
      } else {

        var response = JSON.stringify({
          payload: {
            insertedCount: result.insertedCount
          }
        })

        jsonRespose(res, 200, response)
      }

    })

  })

})

/* API ESTADISTICAS ***************************************************************************/

// 1. ANIO
//Prueba: localhost:3000/statistics/year/583f845393e5b820ac46dcfd?year=2016&type=mean
app.get('/statistics/year/:dataKey', validate({query: schemas.YearSchema}), function(req, res, next){

  statistics_queries.queryYear(db, req.query, req.params.dataKey, function(err, docs){

    if(err){
      next(err)
    } else {
      jsonRespose(res, 200, docs)
    }

  })

})

// 2. MES
//Prueba: localhost:3000/statistics/month/583f845393e5b820ac46dcfd?year=2016&month=3&type=mean
app.get('/statistics/month/:dataKey', validate({query: schemas.MonthSchema}), function(req, res, next){

  statistics_queries.queryMonth(db, req.query, req.params.dataKey, function(err, docs){

    if(err){
      next(err)
    } else {
      jsonRespose(res, 200, docs)
    }

  })

})

// 3. DIA
//Prueba: localhost:3000/statistics/day/583f845393e5b820ac46dcfd?year=2016&month=3&day=20&type=mean
app.get('/statistics/day/:dataKey', validate({query: schemas.DaySchema}), function(req, res, next){

  statistics_queries.queryDay(db, req.query, req.params.dataKey, function(err, docs){

    if(err){
      next(err)
    } else {
      jsonRespose(res, 200, docs)
    }

  })

})

// 4. WEEKDAY
//Prueba: localhost:3000/statistics/weekDay/583f845393e5b820ac46dcfd?year=2016&weekDay=1&type=mean
app.get('/statistics/weekDay/:dataKey', validate({query: schemas.WeekDaySchema}), function(req, res, next){

    statistics_queries.queryWeekDay(db, req.query, req.params.dataKey, function(err, docs){

      if(err){
        next(err)
      } else {
        jsonRespose(res, 200, docs)
      }

    })

})

// 5. WEEKDAY HOUR
//weekDay : [0-6] (Sunday-Saturday)
// Prueba: localhost:3000/statistics/weekDay/hour/583f845393e5b820ac46dcfd?year=2016&weekDay=1&hour=19&type=mean
app.get('/statistics/weekDay/hour/:dataKey', validate({query: schemas.WeekDayHourSchema}), function(req, res, next){

  //Gets statistics, querying data with the new UTCValue
  statistics_queries.queryWeekDayHour(db, req.query, req.params.dataKey, function(err, docs){

    if(err){
      next(err)
    } else {
      jsonRespose(res, 200, docs)
    }

  })

})

// 6. RANGE DAY
//Prueba: localhost:3000/statistics/range/day/583f845393e5b820ac46dcfd?y1=2016&m1=2&d1=20&y2=2016&m2=11&d2=16&type=mean
app.get('/statistics/range/day/:dataKey', validate({query: schemas.RangeDaySchema}),  function(req, res, next){

  statistics_queries.queryRangeDay(db, req.query, req.params.dataKey, function(err, docs){

    if(err){
      next(err)
    } else {
      jsonRespose(res, 200, docs)
    }

  })

})

// 7. RANGE DAY HOUR
//Prueba: llocalhost:3000/statistics/range/day/hour/583b235b9746d113699b4d4a?y1=2016&m1=2&d1=20&y2=2016&m2=11&d2=16&hour=18&type=mean
app.get('/statistics/range/day/hour/:dataKey', validate({query: schemas.RangeDayHourSchema}), function(req, res, next){

  statistics_queries.queryRangeDayHour(db, req.query, req.params.dataKey, function(err, docs){

    if(err){
      next(err)
    } else {
      jsonRespose(res, 200, docs)
    }

  })

})

// 8. LAST 45 RAW MEASUREMENT ENTRIES
//Prueba: localhost:3000/statistics/last/raw/583f845393e5b820ac46dcfd
app.get('/statistics/last/raw/:dataKey', function(req, res, next){

  db_functions.findLastMeasurements(db, req.params.dataKey, function(err, docs){

    if(err){
      next(err)
    } else {
      jsonRespose(res, 200, docs)
    }

  })

})


/***************************************************************************/

// // 9. Peticiones de datos crudos: Restringidas a la API privada
// app.get('/data', validate({query: schemas.GetDataSchema}),  function (req, res) {
//
//   res.send('Good')
// })
//
// app.get('/data/variable/:dataKey', function (req, res, next) {
//
//
//   var collection = db.collection(req.params.dataKey).find().sort({value:1}).toArray(function(err,docs){
//     if(!err){
//       jsonRespose(res, 200, docs)
//     } else {
//       next(err)
//     }
//   })
//
// })

// app.get('/data/device/:deviceKey', validate({query: schemas.GetDataSchema}),  function (req, res) {
//   //  res.status(201)
//   //res.send(req.params)
//   var device = req.params.deviceKey
//   var start = JSON.stringify(req.query.EPOCH_START)
//   var end = JSON.stringify(req.query.EPOCH_END)
//
//   res.send(req.query)
//
// })
//
// app.get('/data/:dataKey/:deviceKey', validate({query: schemas.GetDataSchema}),  function (req, res) {
//   //  res.status(201)
//   //res.send(req.params)
//   var variable = req.params.dataKey
//   var device = req.params.deviceKey
//
//   var start = JSON.stringify(req.query.EPOCH_START)
//   var end = JSON.stringify(req.query.EPOCH_END)
//
//   res.send(req.query)
//
// })
//
// // 10. Peticiones de datos estadísticos: API pública
// app.get('/statistics', validate({query: schemas.GetStatisticsSchema}),  function (req, res) {
//
//   var start = JSON.stringify(req.query.EPOCH_START)
//   var end = JSON.stringify(req.query.EPOCH_END)
//
//   res.send(req.query)
//
// })
//
// app.get('/statistics/:dataKey', validate({query: schemas.GetStatisticsSchema}),  function (req, res) {
//
//   var start = JSON.stringify(req.query.EPOCH_START)
//   var end = JSON.stringify(req.query.EPOCH_END)
//
//   res.send(req.query)
//
// })
//
// app.get('/statistics/:dataKey/:deviceKey', validate({query: schemas.GetStatisticsSchema}),  function (req, res) {
//
//   var start = JSON.stringify(req.query.EPOCH_START)
//   var end = JSON.stringify(req.query.EPOCH_END)
//
//   res.send(req.query)
//
// })

/******************************************************************************************************/


// app.put('/user', function (req, res) {
//   res.send('Got a PUT request at /user')
// })
//
// app.delete('/user', function (req, res) {
//   res.send('Got a DELETE request at /user')
// })
//




//Handle errors
app.use(function (err, req, res, next) {
  // logic
  // console.log('error '+err.name)
  // console.log(err)
  // console.log(JSON.stringify(err))

  var responseData;

  if (err.name === 'JsonSchemaValidation' || err.name === 'InvalidKeys' || err.name === 'InvalidDateRange') {
    console.log('Responded with error');
    // Log the error however you please
    //  console.log('Bad')
    //  console.log(err.message);
    // logs "express-jsonschema: Invalid data found"

    // Set a bad request http response status or whatever you want
    res.status(400);
    //res.status(400).json({ error: 'mal' });

    // Format the response body however you want
    responseData = {
      statusText: 'Bad Request',
      error: err.name,
      validations: err.validations  // All of your validation information
    };

    res.json(responseData);

  } else {
    // pass error to next error middleware handler
    //  next(err);
    res.status(400)
    console.log(err);
    res.send('error')
  }
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
