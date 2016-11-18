var assert = require('assert')
var ObjectId = require('mongodb').ObjectID

var insertVariable = function(db, body, callback) {
  // Get the documents collection
  var collection = db.collection('variables');
  // Insert some documents
  collection.insertOne(body,
    function(err, result) {
    assert.equal(null, err);
    console.log("Inserted 1 document1 into the collection");
    callback(result);
  });
}

var insertDevice = function(db, body, callback) {

  var collection = db.collection('devices')

    collection.insertOne(body,
    function(err, result) {
    assert.equal(null, err);
    console.log("Inserted 1 document1 into the collection");
    callback(result);
  });
}


var insertData = function(db, dataKey, deviceKey, measurements, callback) {


  validateKeys(db, dataKey, deviceKey, function(result){

        console.log(result)

    if(!result) {
      var err = new Error('Invalid Keys')
      err.name = 'InvalidKeys'
      err.validations = 'The combination for dataKey and deviceKey is invalid '
      callback(err)
    //  console.log(callback.arguments);
    } else {

      // Get the documents collection
      var collection = db.collection(dataKey)

      collection.insertMany(measurements, function(err, result) {
        console.log("Inserted 1 document1 into the collection");
        callback(null, result.insertedCount)
      })
    }

  })


}

var validateKeys = function(db, dataKey, deviceKey, callback) {

  // Get the documents collection
  var collection = db.collection('devices')

  // Find some documents
  collection.findOne({_id: ObjectId(deviceKey), variable_id:dataKey }, function(err, result){
    callback(result)
  })

}


var findVariable = function(db, dataKey, callback) {
  // Get the documents collection
  var collection = db.collection('variables')

  // Find some documents
  collection.findOne({_id: ObjectId(dataKey)}, function(err, result){
    callback(result)
  })

}

var findDevice = function(db, deviceKey, callback) {
  // Get the documents collection
  var collection = db.collection('devices')

  // Find some documents
  collection.findOne({_id: ObjectId(deviceKey)}, function(err, result){
    callback(result)
  })

}







//TEST

var insertDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.insertMany([
    {a : 4}, {a : 5}, {a : 6}
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
  collection.find({'a': 4}).toArray(function(err, docs) {
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

exports.insertVariable = insertVariable;
exports.insertDevice = insertDevice;
exports.insertData = insertData;

exports.insertDocuments = insertDocuments;
exports.findAllDocuments = findAllDocuments;
exports.findDocuments = findDocuments;
exports.updateDocument = updateDocument;
exports.removeDocument = removeDocument;
