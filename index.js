
var express = require('express')
var MongoClient = require('mongodb').MongoClient
var assert = require('assert')
var validate = require('express-jsonschema').validate
var bodyParser = require('body-parser')
var app = express()


app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies


//JSON SCHEMAS

var VariableSchema = {

  type: 'object',
  properties: {
    payload: {
      type: 'object',
      properties: {
        nombre: {
          type: 'string',
          required: true
        },
        lugar: {
          type: 'string',
          required: true
        },
        unidad: {
          type: 'string',
          required: true
        },
        descripcion: {
          type: 'string',
          required: true
        },
        foto_url: {
          type: 'string',
          required: false
        }
      }

    }
  }

}

//API

app.post('/variable', validate({body: VariableSchema}), function (req, res) {
  res.send('Good')
})

// Create a json scehma
var StreetSchema = {
    type: 'object',
    properties: {
        number: {
            type: 'number',
            required: true
        },
        name: {
            type: 'string',
            required: true
        },
        type: {
            type: 'string',
            required: true,
            enum: ['Street', 'Avenue', 'Boulevard']
        }
    }
}

// This route validates req.body against the StreetSchema
app.post('/street', validate({body: StreetSchema}), function(req, res) {
    // At this point req.body has been validated and you can
    // begin to execute your application code
    res.send('Good')
})

// Connection URL
var url = 'mongodb://localhost:27017/myproject';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  insertDocuments(db, function() {
    findDocuments(db, function() {
     db.close();
   });
  });
});

var insertDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.insertMany([
    {a : 1}, {a : 2}, {a : 3}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 documents into the collection");
    callback(result);
  });
}

var findAllDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.log(docs)
    callback(docs);
  });
}

var findDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Find some documents
  collection.find({'a': 3}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.log(docs);
    callback(docs);
  });
}

var updateDocument = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Update document where a is 2, set b equal to 1
  collection.updateOne({ a : 2 }
    , { $set: { b : 1 } }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Updated the document with the field a equal to 2");
    callback(result);
  });
}

var removeDocument = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.deleteOne({ a : 3 }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Removed the document with the field a equal to 3");
    callback(result);
  });
}

app.get('/', function (req, res) {
//  res.status(201)
  res.send('Hello World! '+JSON.stringify(req.query.HOLA))
})

app.get('/:pao/:juan/:diego', function (req, res) {
  res.send(req.params)
})

app.post('/', function (req, res) {
  res.send('Got a POST request'+req.body)
})

app.put('/user', function (req, res) {
  res.send('Got a PUT request at /user')
})

app.delete('/user', function (req, res) {
  res.send('Got a DELETE request at /user')
})




app.use(function (err, req, res, next) {
  // logic
  console.log('error')
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
