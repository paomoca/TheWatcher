var assert = require('assert')
var ObjectId = require('mongodb').ObjectID

var insertVariable = function(db, body, callback) {

  var collection = db.collection('variables')

  collection.insertOne(body, function(err, result) {
    callback(err,result)
    if(!err){
      var variable_id = result.insertedId
      db.collection(variable_id.toString()).createIndex({date:1}, {}, function(){
        console.log('indexed new collection');
      })
    }
  })
}

var insertDevice = function(db, body, callback) {

  validateVariable(db, body.variable_id, function(err, res){

    if(err || !res){
      var err = new Error('Invalid Keys')
      err.name = 'InvalidKeys'
      err.validations = 'There is no variable related to the key '+body.variable_id
      callback(err, null)

    } else {
      var collection = db.collection('devices')
        collection.insertOne(body, function(err, insertionResult) {
        callback(err, insertionResult)
      })
    }

  })

}


var insertData = function(db, dataKey, deviceKey, measurements, callback) {

  validateKeys(db, dataKey, deviceKey, function(err,res){

    if(err || !res) {
      var err = new Error('Invalid Keys')
      err.name = 'InvalidKeys'
      err.validations = 'The combination for dataKey and deviceKey is invalid '
      callback(err, null)

    } else {

      var collection = db.collection(dataKey)

      collection.insertMany(measurements, function(err, result) {
        callback(err, result)
      })
    }

  })


}

var validateKeys = function(db, dataKey, deviceKey, callback) {

  var collection = db.collection('devices')

  if(ObjectId.isValid(deviceKey)){

    var id = new ObjectId(deviceKey)
    collection.findOne({ _id: id, variable_id:dataKey }, {}, function(err, result){
      callback(err,result)
    })

  } else {
    callback(true,null)
  }



}

var validateVariable = function(db, dataKey, callback){

  var collection = db.collection('variables')

  if(ObjectId.isValid(dataKey)){
      var id = new ObjectId(dataKey)
      collection.findOne({ _id: id }, {} , function(err, result){
        callback(err,result)
      })
  } else {
    callback(true,null)
  }

}


var findVariable = function(db, dataKey, callback) {

  var collection = db.collection('variables')

  collection.findOne({_id: ObjectId(dataKey)}, function(err, res){
    callback(err, res)
  })

}

var findDevice = function(db, deviceKey, callback) {
  // Get the documents collection
  var collection = db.collection('devices')

  // Find some documents
  collection.findOne({_id: ObjectId(deviceKey)}, function(err, res){
    callback(err, res)
  })

}


var findAllVariables = function(db, callback) {

  var collection = db.collection('variables')

  collection.find({}).toArray(function(err, docs) {

    callback(err, docs)

  })

}

var findVariableDevices = function(db, dataKey, callback){

  var collection = db.collection('devices')

  collection.find({variable_id: dataKey}).toArray(function(err, docs) {

    callback(err, docs)

  })

}

var getVariableOffset = function (db, dataKey, callback){

  var collection = db.collection('variables')

  collection.findOne({_id: ObjectId(dataKey)},{ fields: { timezoneOffset: 1, _id: 0}}, function(err, doc){

    if(err || !doc){
      callback(0)
    } else {
      callback(doc.timezoneOffset)
    }


  })

}

var getVariableTimezone = function (db, dataKey, callback){

  var collection = db.collection('variables')

  collection.findOne({_id: ObjectId(dataKey)},{ fields: { timezone: 1, _id: 0}}, function(err, doc){

    if(err || !doc.timezone){
      callback("America/Mexico_City")
    } else {
      callback(doc.timezone)
    }


  })

}

/***************************************************************************/

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

exports.findAllVariables = findAllVariables;
exports.findVariableDevices = findVariableDevices;
exports.findVariable = findVariable;
exports.findDevice = findDevice;

exports.getVariableOffset = getVariableOffset;

exports.updateDocument = updateDocument;
exports.removeDocument = removeDocument;

exports.getVariableTimezone = getVariableTimezone;
