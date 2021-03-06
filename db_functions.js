var assert = require('assert')
var ObjectId = require('mongodb').ObjectID
var moment = require('moment-timezone')


var insertVariable = function(db, body, callback) {

  var collection = db.collection('variables')

  collection.insertOne(body, function(err, result) {
    callback(err,result)
    if(!err){
      //Set indexes for the collection that will store the variable's measurements
      var variable_id = result.insertedId
      db.collection(variable_id.toString()).createIndex({date:1, value:1}, {}, function(){
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

var getVariableTimezone = function (db, dataKey, callback){

  var collection = db.collection('variables')

  collection.findOne({_id: ObjectId(dataKey)},{ fields: { timezone: 1, _id: 0}}, function(err, doc){

    if(!doc || err || !doc.timezone){
      callback("America/Mexico_City")
    } else {
      callback(doc.timezone)
    }

  })

}

var findLastMeasurements = function(db, dataKey, callback){

  var collection = db.collection(dataKey)

  collection.find({}).sort({ date: -1 }).limit(45).toArray(function(err, docs) {
    callback(err, docs)
  })

}

/***************************************************************************/


var removeVariable = function(db, dataKey, callback){

  var collection = db.collection('variables')
  console.log(dataKey);

  collection.deleteOne({_id: ObjectId(dataKey)}, function(err, res){
    console.log('Removed Variable')
    callback(err, res)
  })

  db.dropCollection(dataKey+'-day', function(err, result) {
    console.log(err);
    console.log('Removed Day statistics')
  })

  db.dropCollection(dataKey+'-month', function(err, result) {
    console.log(err);
    console.log('Removed Month statistics')
  })

  db.dropCollection(dataKey+'-hours', function(err, result) {
    console.log(err);
    console.log('Removed Hours statistics')
  })

}

var removeDevice = function(db, deviceKey, callback){

  var collection = db.collection('devices')

  collection.deleteOne({_id: ObjectId(deviceKey)}, function(err, res){
    console.log('Removed Device')
    callback(err, res)
  })

}

exports.insertVariable = insertVariable
exports.insertDevice = insertDevice
exports.insertData = insertData

exports.findAllVariables = findAllVariables
exports.findVariableDevices = findVariableDevices
exports.findVariable = findVariable
exports.findDevice = findDevice

exports.getVariableTimezone = getVariableTimezone
exports.findLastMeasurements = findLastMeasurements

exports.removeVariable = removeVariable
exports.removeDevice = removeDevice
