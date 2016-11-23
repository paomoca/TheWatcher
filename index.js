var express = require('express')
var MongoClient = require('mongodb').MongoClient
var assert = require('assert')
var validate = require('express-jsonschema').validate
var bodyParser = require('body-parser')
var cron = require('node-cron')

var schemas = require('./schemas.js')
var db_functions = require('./db_functions.js')
var cron_functions = require('./cron_functions.js')

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

  cron_functions.hourStatistics(db, function(mess){
    console.log('++++++++++++++++++++++++++++++'+mess)
  })

});

cron.schedule('0-59 * * * *', function(){
  console.log('****************************** running every minute to 1 from '+cron_functions.test);
});

app.get('/test', function(req, res, next){


  var collection = db.collection('582f5239342e940db340b3e7')

  var project = {
    $project:
    {
      time : 1,
      value : 1,
      _id : 0,

      year: { $year: "$date" },
      month: { $month: "$date" },
      day: { $dayOfMonth: "$date" },
      hour: { $hour: "$date" },
      minutes: { $minute: "$date" },
      seconds: { $second: "$date" },
      milliseconds: { $millisecond: "$date" },
      dayOfYear: { $dayOfYear: "$date" },
      dayOfWeek: { $dayOfWeek: "$date" }
    }
  }

  var match = {
    $match : { year : 2016, month: 10 }
  }

  var project2 = {
    $project:
    {
      time : 1,
      value : 1,
      _id : 0,
    }
  }

  var cursor = collection.aggregate([project,match, project2])
  //console.log(cursor)

  cursor.toArray(function(err, docs) {
    console.log(docs)
    if(err){
      next(err)
    } else {
      res.send(docs)
    }

  });

})


/* API ***********************************************************************************************/

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
app.post('/variable', validate({body: schemas.VariableSchema}), function (req, res) {

  var body = req.body.payload

  db_functions.insertVariable(db, body, function(result) {
    var key = result.ops[0]._id
    var response = JSON.stringify({
      payload: {
        variable_id: key
      }
    })
    res.status(200)
    res.setHeader('Content-Type', 'application/json');
    res.send(response)
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
app.post('/device', validate({body: schemas.DeviceSchema}), function (req, res) {

  var body = req.body.payload

  db_functions.insertDevice(db, body, function(result) {
    var key = result.ops[0]._id
    var response = JSON.stringify({
      payload: {
        variable_id: key
      }
    })
    res.status(200)
    res.setHeader('Content-Type', 'application/json');
    res.send(response)
  })

})


// 3. Inserción de múltiples mediciones: cualquier variable, cualquier dispositivo

//Prueba
//{
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

  var testValue = req.body.payload.data[0].measurements[0].value
  var dataArray = req.body.payload.data

  dataArray.forEach(function(dataItem){

    var dataKey = dataItem.dataKey
    var deviceKey = dataItem.deviceKey
    var measurementsArray = dataItem.measurements

    measurementsArray.forEach(function(measurementItem){
      // var time = measurementItem.time
      // var value = measurementItem.value
      measurementItem.deviceKey = deviceKey
      measurementItem.date = new Date(measurementItem.time)

    })

    db_functions.insertData(db, dataKey, deviceKey, measurementsArray, function(err,result) {
      if(err){
        next(err)
      } else {
        res.send('Good inserted '+result+' elements')
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
        res.send('Good inserted '+result+' elements')
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
        res.send('Good inserted '+result+' elements')
      }
    })

  })

})

/***************************************************************************/
app.get('/statistics/year/:dataKey', function(req, res, next){


  var collection = db.collection('582f5239342e940db340b3e7')

  var project = {
    $project:
    {
      time : 1,
      value : 1,
      _id : 0,

      year: { $year: "$date" },
      month: { $month: "$date" },
      day: { $dayOfMonth: "$date" },
      hour: { $hour: "$date" },
      minutes: { $minute: "$date" },
      seconds: { $second: "$date" },
      milliseconds: { $millisecond: "$date" },
      dayOfYear: { $dayOfYear: "$date" },
      dayOfWeek: { $dayOfWeek: "$date" }
    }
  }

  var match = {
    $match : { year : 2016, month: 10 }
  }

  var project2 = {
    $project:
    {
      time : 1,
      value : 1,
      _id : 0,
    }
  }

  var cursor = collection.aggregate([project,match, project2])
  //console.log(cursor)

  cursor.toArray(function(err, docs) {
    console.log(docs)
    if(err){
      next(err)
    } else {
      res.send(docs)
    }

  });

})

app.get('/statistics/month/:dataKey', function(req, res, next){

})

app.get('/statistics/day/:dataKey', function(req, res, next){

})

app.get('/statistics/weekDay/:dataKey', function(req, res, next){

})

app.get('/statistics/weekDay/hour/:dataKey', function(req, res, next){

})

app.get('/statistics/range/day/:dataKey', function(req, res, next){

})

app.get('/statistics/range/day/hour/:dataKey', function(req, res, next){

})

/***************************************************************************/


//6. Petición de lista de variables
app.get('/variables', function (req, res) {
  //  res.status(201)
  res.send('Hello World! ')
})

// 7. Petición de la información de una variable en específico
app.get('/variable/:variable_id', function (req, res) {
  //  res.status(201)
  res.send('Hello World! ')
})

// 8. Petición de lista de dispositivos: de una variable en específico
app.get('/devices/:variable', function (req, res) {
  //  res.status(201)
  res.send('Hello World! ')
})

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

// // This route validates req.body against the StreetSchema
// app.post('/street', validate({body: schemas.StreetSchema}), function(req, res) {
//     // At this point req.body has been validated and you can
//     // begin to execute your application code
//     res.send('Good')
// })
//
//
app.get('/', function (req, res) {
  //  res.status(201)
  res.send('Hello World! ')
})

// app.get('/:pao/:juan/:diego', function (req, res) {
//   res.send(req.params)
// })
//
// app.post('/', function (req, res) {
//   res.send('Got a POST request'+req.body)
// })
//
// app.put('/user', function (req, res) {
//   res.send('Got a PUT request at /user')
// })
//
// app.delete('/user', function (req, res) {
//   res.send('Got a DELETE request at /user')
// })
//
//   var TokenSchema = {
//     type: 'object',
//     properties: {
//         token: {
//             type: 'string',
//             format: 'alphanumeric',
//             minLength: 10,
//             maxLength: 10,
//             required: true
//         }
//     }
// }
//
// app.get('/streets/', validate({query: TokenSchema}), function(req, res) {
//     // application code
//     res.send(req.query)
// });



//Handle errors
app.use(function (err, req, res, next) {
  // logic
  console.log('error '+err.name)
  console.log(err)
  console.log(JSON.stringify(err))

  var responseData;

  if (err.name === 'JsonSchemaValidation' || err.name === 'InvalidKeys') {
    // Log the error however you please
    console.log('Bad')
    console.log(err.message);
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

    // Take into account the content type if your app serves various content types
    if (req.xhr || req.get('Content-Type') === 'application/json') {
      res.json(responseData);
    } else {
      // If this is an html request then you should probably have
      // some type of Bad Request html template to respond with
      res.render('badrequestTemplate', responseData);
    }
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
