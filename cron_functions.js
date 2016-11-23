var ObjectId = require('mongodb').ObjectID
var statistics = require('simple-statistics')

var hourStatistics = function(db, callback){

  var variables = db.collection('variables')

  var date = new Date()
  var curr_hour = date.getHours()
  var prev_hour = curr_hour - 1;

  if(prev_hour == -1)
  prev_hour = 23

  variables.find({}, {_id:1}).forEach(function(doc){

    var collection = db.collection(ObjectId(doc._id).toString())

    var project = {
      $project:
      {
        time : 1,
        value : 1,
        _id : 0,

        hour: { $cond: [{ $ifNull: ['$date', 0] }, { $hour: '$date' }, -1] }

      }
    }

    var match = {
      $match : { hour : prev_hour }
    }

    var project2 = {
      $project:
      {
        value : 1,
        _id : 0,
      }
    }

    var cursor = collection.aggregate([project,match, project2])


    cursor.toArray(function(err, docs) {

      if(err){
        console.log(err)
      } else {
        console.log('good')
        var mappedArray = docs.map(function (item) { return item.value; });
        console.log(mappedArray);
        var mean = statistics.mean(mappedArray);
        console.log(mean);

      }

    });



  }, function(err){
    console.log(err)
    callback('done')
  });


}

var test = statistics.product([1, 2, 3, 4]);

exports.test = test
exports.hourStatistics = hourStatistics
