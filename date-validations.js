//1 Enero 2016 00:00
var minUTC = new Date(1451606400000)

var dateRangeValidation = function(d1, d2, callback){

  var now = new Date()
  var date1 = new Date(parseInt(d1))
  var date2 = new Date(parseInt(d2))

  console.log(date1);
  console.log(date2);

  var err = null

  if(date1 < minUTC){

    err = new Error()
    err.name = 'InvalidDateRange'
    err.validations = 'Date 1 cannot be earlier than January 1, 2016 at 00:00 UTC'

  } else if (date2 < minUTC) {

    err = new Error()
    err.name = 'InvalidDateRange'
    err.validations = 'Date 2 cannot be earlier than January 1, 2016 at 00:00 UTC'

  } else if ( date2 < date1) {

    err = new Error()
    err.name = 'InvalidDateRange'
    err.validations = 'Date 2 cannot be earlier than Date 1'

  } else if ( date1 > now) {

    err = new Error()
    err.name = 'InvalidDateRange'
    err.validations = 'Date 1 cannot be later than UTC now'

  } else if ( date2  > now) {

    err = new Error()
    err.name = 'InvalidDateRange'
    err.validations = 'Date 2 cannot be later than UTC now'
  }

  callback(err)

}

exports.dateRangeValidation = dateRangeValidation
