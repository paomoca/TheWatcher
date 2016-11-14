
  var express = require('express')
  var MongoClient = require('mongodb').MongoClient
  var assert = require('assert')
  var validate = require('express-jsonschema').validate
  var bodyParser = require('body-parser')
  var schemas = require('./schemas.js')
  var db_functions = require('./db_functions.js')
  var app = express()

  app.use(bodyParser.json()) // support json encoded bodies
  app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

  // Connection URL
  var url = 'mongodb://localhost:27017/myproject';

  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    dbb = db

  });

  /* API ***********************************************************************************************/

  app.post('/variable', validate({body: schemas.VariableSchema}), function (req, res) {
    res.send('Good')
  })

  app.post('/device', validate({body: schemas.DeviceSchema}), function (req, res) {
    res.send('Good')
  })

  app.post('/data', validate({body: schemas.DataSchema}), function (req, res) {

    var testValue = req.body.payload.data[0].measurements[0].value
    var dataArray = req.body.payload.data

    dataArray.forEach(function(dataItem){

      var dataKey = dataItem.dataKey
      var deviceKey = dataItem.deviceKey
      var measurements = dataItem.measurementsArray

      measurementsArray.forEach(function(measurementItem){
        var time = measurementItem.time
        var value = measurementItem.value
      })

    });

    db_functions.insertDocuments(dbb, function() {
        db_functions.findDocuments(dbb, function() {
         dbb.close();
        });
    });

    res.send('Good '+testValue)

    console.log(testValue)
  })

  app.post('/data/:dataKey', validate({body: schemas.VariableDataSchema}), function (req, res) {

    var dataArray = req.body.payload.data

    dataArray.forEach(function(value){
      console.log(value);
    });

    res.send('Good')

  })

  app.post('/data/:dataKey/:deviceKey', validate({body: schemas.DeviceDataSchema}), function (req, res) {

    var dataArray = req.body.payload.data

    dataArray.forEach(function(value){
      console.log(value);
    });

    res.send('Good')
  })

  app.get('/variables', function (req, res) {
  //  res.status(201)
    res.send('Hello World! ')
  })

  app.get('/variable/:variable_id', function (req, res) {
  //  res.status(201)
    res.send('Hello World! ')
  })

  app.get('/devices/:variable', function (req, res) {
  //  res.status(201)
    res.send('Hello World! ')
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

  app.get('/data/device/:deviceKey', function (req, res) {
  //  res.status(201)
    //res.send(req.params)
    var device = req.params.deviceKey
    var start = JSON.stringify(req.query.EPOCH_START)
    var end = JSON.stringify(req.query.EPOCH_END)

    res.send(req.query)

  })

  /******************************************************************************************************/

  // This route validates req.body against the StreetSchema
  app.post('/street', validate({body: schemas.StreetSchema}), function(req, res) {
      // At this point req.body has been validated and you can
      // begin to execute your application code
      res.send('Good')
  })


  app.get('/', function (req, res) {
  //  res.status(201)
    res.send('Hello World! '+JSON.stringify(req.query.HOLA))
  })

  // app.get('/:pao/:juan/:diego', function (req, res) {
  //   res.send(req.params)
  // })

  app.post('/', function (req, res) {
    res.send('Got a POST request'+req.body)
  })

  app.put('/user', function (req, res) {
    res.send('Got a PUT request at /user')
  })

  app.delete('/user', function (req, res) {
    res.send('Got a DELETE request at /user')
  })

  var TokenSchema = {
    type: 'object',
    properties: {
        token: {
            type: 'string',
            format: 'alphanumeric',
            minLength: 10,
            maxLength: 10,
            required: true
        }
    }
}

app.get('/streets/', validate({query: TokenSchema}), function(req, res) {
    // application code
    res.send(req.query)
});



  //Handle errors
  app.use(function (err, req, res, next) {
    // logic
    console.log('error')
    console.log(err)
    console.log(JSON.stringify(err))

    var responseData;

    if (err.name === 'JsonSchemaValidation') {
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
           jsonSchemaValidation: true,
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
