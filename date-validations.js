//1 Enero 2016 00:00
var minMilliseconds = 1451606400000
var minUTC = new Date(minMilliseconds)

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

var cleanDate = function(){
  return new Date(minMilliseconds)
}

var calculateUTCWeekDayHour = function(query, timezoneOffset, callback){

  var desiredHour = parseInt(query.hour)
  var minutes = desiredHour*60

  var UTCHour = (minutes + timezoneOffset)/60
  var UTCWeekDay = parseInt(query.weekDay)

  //If the hour is greater than 24 it means we moved to the next weekDay
  if(UTCHour >= 24){
    UTCHour = UTCHour - 24
    UTCWeekDay++
    if(UTCWeekDay > 7){
      UTCWeekDay = 1
    }
  }

  //If the hour is a negative number it means we go back one weekDay
  if(UTCHour < 0){
    UTCHour = UTCHour + 24
    UTCWeekDay--
    if(UTCWeekDay < 1){
      UTCWeekDay = 7
    }
  }

  query.hour = UTCHour
  query.weekDay = UTCWeekDay

  callback(query)

  console.log('UTCHour: '+ UTCHour)
  console.log('UTCWeekDay: '+ UTCWeekDay)

}

exports.dateRangeValidation = dateRangeValidation
exports.cleanDate = cleanDate
exports.calculateUTCWeekDayHour = calculateUTCWeekDayHour
