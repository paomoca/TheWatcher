var express = require('express')
var MongoClient = require('mongodb').MongoClient
var assert = require('assert')
var validate = require('express-jsonschema').validate
var bodyParser = require('body-parser')

var schemas = require('./schemas.js')
var db_functions = require('./db_functions.js')
var statistics = require('./statistics-functions.js')
var statistics_queries = require('./statistics-queries.js')
var date_validations = require('./date-validations.js')
var launch_routine = require('./launch-routine.js')

var app = express()
//var jwt = require('express-jwt')

// var jwtCheck = jwt({
//   secret: new Buffer('IPX4p3ofCMLuR6k0AWwzkAvb2HicsSsPI9FRR201KHZgtZa10KWcoub2Uu0Cf6wo', 'base64'),
//   audience: '4qmgJ7ZFCGDjppO2ZOFP2tkSBETCAA3Y'
// })

//app.use('/variable', jwtCheck);

app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

// Connection URL
//var url = 'mongodb://172.16.73.145:27017/juan';
var url = 'mongodb://localhost:27017/myproject';
//var url = 'mongodb://juan:juanito@ds057176.mlab.com:57176/paomoca-tests'

// Use connect method to connect to the server
MongoClient.connect(url, function(err, database) {
  assert.equal(null, err);
  console.log("Connected successfully to server")
  db = database

  launch_routine.launch(db)

});

var jsonRespose = function(res, status, json){

  res.status(status)
  res.setHeader('Content-Type', 'application/json');
  res.send(json)

}

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
//  "foto_url": "latas.jpg"
//  }
// }
app.post('/variable', validate({body: schemas.VariableSchema}), function (req, res, next) {

  db_functions.insertVariable(db, req.body.payload, function(err, result) {

    if(err){
      next(err)
    } else {
      var response = JSON.stringify({
        payload: {
          variable_id: result.insertedId
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
          variable_id: result.insertedId
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

// Petición de la información de un device en específico
app.get('/device/:device_id', function (req, res) {

  db_functions.findDevice(db, req.params.device_id, function(err, docs){
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
      measurementItem.date = new Date(measurementItem.time)
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
      measurementItem.date = new Date(measurementItem.time)

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
      measurementItem.date = new Date(measurementItem.time)

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
//Prueba: localhost:3000/statistics/year/582b7288009e5750e40a43ac?year=2016&type=mean
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
//Prueba: localhost:3000/statistics/month/582b7288009e5750e40a43ac?year=2016&month=3&type=mean
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
//Prueba: localhost:3000/statistics/day/582b7288009e5750e40a43ac?year=2016&month=3&day=20&type=mean
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
//Prueba: localhost:3000/statistics/weekDay/582b7288009e5750e40a43ac?year=2016&weekDay=1&type=mean
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
// Prueba: localhost:3000/statistics/weekDay/hour/582b7288009e5750e40a43ac?year=2016&weekDay=1&hour=19&type=mean
//Prueba con timezone offset: localhost:3000/statistics/weekDay/hour/582b7288009e5750e40a43ac?year=2016&weekDay=1&hour=13&offset=360&type=mean
app.get('/statistics/weekDay/hour/:dataKey', validate({query: schemas.WeekDayHourSchema}), function(req, res, next){

  statistics_queries.queryWeekDayHour(db, req.query, req.params.dataKey, function(err, docs){

    if(err){
      next(err)
    } else {
      jsonRespose(res, 200, docs)
    }

  })

})

// 6. RANGE DAY
//Prueba: localhost:3000/statistics/range/day/582b7288009e5750e40a43ac?date2=1480194323000&date1=1451606400000&type=mean
app.get('/statistics/range/day/:dataKey', validate({query: schemas.RangeDaySchema}),  function(req, res, next){


    date_validations.dateRangeValidation(req.query.date1, req.query.date2, function(err){

      if(!err){
        statistics_queries.queryRangeDay(db, req.query, req.params.dataKey, function(err, docs){

          if(err){
            next(err)
          } else {
            jsonRespose(res, 200, docs)
          }

        })

      } else {
        next(err)
      }
    })

})

// 7. RANGE DAY HOUR
//Prueba: localhost:3000/statistics/range/day/hour/582b7288009e5750e40a43ac?date2=1480194323000&date1=1451606400000&hour=10&type=mean
//Prueba con timezone offset: localhost:3000/statistics/range/day/hour/582b7288009e5750e40a43ac?date2=1480194323000&date1=1451606400000&hour=4&offset=360&type=mean
app.get('/statistics/range/day/hour/:dataKey', validate({query: schemas.RangeDayHourSchema}), function(req, res, next){

  date_validations.dateRangeValidation(req.query.date1, req.query.date2, function(err){

    if(!err){
      statistics_queries.queryRangeDayHour(db, req.query, req.params.dataKey, function(err, docs){

        if(err){
          next(err)
        } else {
          jsonRespose(res, 200, docs)
        }

      })

    } else {
      next(err)
    }
  })


})

/***************************************************************************/

// 9. Peticiones de datos crudos: Restringidas a la API privada
app.get('/data', validate({query: schemas.GetDataSchema}),  function (req, res) {

  res.send('Good')
})

app.get('/data/variable/:dataKey', validate({query: schemas.GetDataSchema}),  function (req, res) {

  //  res.status(201)
  res.send(req.query)
  // var variable = req.params.dataKey
  // var start = +JSON.stringify(req.query.EPOCH_START)
  // var end = JSON.stringify(req.query.EPOCH_END)

  //  res.send(variable+' - '+start+' - '+end)
  res.send('Good')
})

app.get('/data/device/:deviceKey', validate({query: schemas.GetDataSchema}),  function (req, res) {
  //  res.status(201)
  //res.send(req.params)
  var device = req.params.deviceKey
  var start = JSON.stringify(req.query.EPOCH_START)
  var end = JSON.stringify(req.query.EPOCH_END)

  res.send(req.query)

})

app.get('/data/:dataKey/:deviceKey', validate({query: schemas.GetDataSchema}),  function (req, res) {
  //  res.status(201)
  //res.send(req.params)
  var variable = req.params.dataKey
  var device = req.params.deviceKey

  var start = JSON.stringify(req.query.EPOCH_START)
  var end = JSON.stringify(req.query.EPOCH_END)

  res.send(req.query)

})

// 10. Peticiones de datos estadísticos: API pública
app.get('/statistics', validate({query: schemas.GetStatisticsSchema}),  function (req, res) {

  var start = JSON.stringify(req.query.EPOCH_START)
  var end = JSON.stringify(req.query.EPOCH_END)

  res.send(req.query)

})

app.get('/statistics/:dataKey', validate({query: schemas.GetStatisticsSchema}),  function (req, res) {

  var start = JSON.stringify(req.query.EPOCH_START)
  var end = JSON.stringify(req.query.EPOCH_END)

  res.send(req.query)

})

app.get('/statistics/:dataKey/:deviceKey', validate({query: schemas.GetStatisticsSchema}),  function (req, res) {

  var start = JSON.stringify(req.query.EPOCH_START)
  var end = JSON.stringify(req.query.EPOCH_END)

  res.send(req.query)

})

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
    res.status(444)
    res.send()
  }
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
