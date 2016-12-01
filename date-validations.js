//1 Enero 2016 00:00
var minMilliseconds = 1451606400000
var minUTC = new Date(minMilliseconds)

var dateRangeValidation = function(date1, date2, callback){

  var now = new Date()

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

var calculateUTCRangeDay = function(query, timezoneOffset, callback){

  var date1 = new Date()
  date1.setUTCFullYear(query.y1)
  date1.setUTCMonth(query.m1 - 1)
  date1.setUTCDate(query.d1)
  date1.setUTCHours(0)
  date1.setUTCMinutes(0)
  date1.setUTCSeconds(0)
  date1.setUTCMilliseconds(0)

  var date2 = new Date()
  date2.setUTCFullYear(query.y2)
  date2.setUTCMonth(query.m2 - 1)
  date2.setUTCDate(query.d2)
  date2.setUTCHours(0)
  date2.setUTCMinutes(0)
  date2.setUTCSeconds(0)
  date2.setUTCMilliseconds(0)

  date1 = date1.getTime()
  date2 = date2.getTime()

  console.log(new Date(date1))
  console.log(new Date(date2))

  dateRangeValidation(date1, date2, function(err){

    if(!err){
      query.date1 = date1
      query.date2 = date2
      callback(null, query)
    } else {
      callback(err, null)
    }

  })

}

var calculateUTCRangeDayHour = function(query, timezoneOffset, callback){

  var date1 = new Date()
  date1.setUTCFullYear(query.y1)
  date1.setUTCMonth(query.m1 - 1)
  date1.setUTCDate(query.d1)
  date1.setUTCHours(0)
  date1.setUTCMinutes(0)
  date1.setUTCSeconds(0)
  date1.setUTCMilliseconds(0)

  var date2 = new Date()
  date2.setUTCFullYear(query.y2)
  date2.setUTCMonth(query.m2 - 1)
  date2.setUTCDate(query.d2)
  date2.setUTCHours(0)
  date2.setUTCMinutes(0)
  date2.setUTCSeconds(0)
  date2.setUTCMilliseconds(0)

  var desiredHour = parseInt(query.hour)
  var minutes = desiredHour*60

  var UTCHour = (minutes + timezoneOffset)/60

  //If the hour is greater than 24 it means we moved to the next day
  if(UTCHour >= 24){
    UTCHour = UTCHour - 24
    date1.setUTCHours(UTCHour)
    date2.setUTCHours(UTCHour)

    date1 = date1.getTime() + (24*60*60*1000)
    date2 = date2.getTime() + (24*60*60*1000)

  } else if(UTCHour < 0) {

    //If the hour is a negative number it means we go back one day

    UTCHour = UTCHour + 24
    date1.setUTCHours(UTCHour)
    date2.setUTCHours(UTCHour)

    date1 = date1.getTime() - (24*60*60*1000)
    date2 = date2.getTime() - (24*60*60*1000)

  } else {

    date1.setUTCHours(UTCHour)
    date2.setUTCHours(UTCHour)

    date1 = date1.getTime()
    date2 = date2.getTime()

  }

  console.log(new Date(date1))
  console.log(new Date(date2))

  console.log('UTCHour: '+ UTCHour)

  dateRangeValidation(date1, date2, function(err){

    if(!err){
      query.date1 = date1
      query.date2 = date2
      query.hour = UTCHour
      callback(null, query)
    } else {
      callback(err, null)
    }

  })

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

var calculateUTCOffset = function(y, m, d, h, timezoneOffset, callback){

  var date = new Date()
  date.setUTCFullYear(y)
  date.setUTCMonth(m)
  date.setUTCDate(d)
  date.setUTCHours(h)
  date.setUTCMinutes(0)
  date.setUTCSeconds(0)
  date.setUTCMilliseconds(0)

  var UTCHour = ((h*60) + timezoneOffset)/60

  //If the hour is greater than 24 it means we moved to the next weekDay
  if(UTCHour >= 24){
    UTCHour = UTCHour - 24

    date.setUTCHours(UTCHour)
    date = date.getTime() + (24*60*60*1000)

  } else if(UTCHour < 0){

    //If the hour is a negative number it means we go back one weekDay
    UTCHour = UTCHour + 24

    date.setUTCHours(UTCHour)
    date = date.getTime() - (24*60*60*1000)

  } else {

    date.setUTCHours(UTCHour)
    date = date.getTime()

  }

  callback(date)

}

var getDaysInMonth = function(year,month) {
  // Here January is 1 based
  //Day 0 is the last day in the previous month
 //return new Date(year, month, 0).getDate();
// Here January is 0 based
 return new Date(year, month+1, 0).getDate();
}

var calculateVariableLocalHour = function(UTCHour, timezoneOffset, callback){

  var localHour = ((UTCHour*60) - timezoneOffset)/60
  console.log('\ncalculatedLocalHour: '+localHour)
  var dayOffset = 0

  //If the hour is greater than 24 it means we moved to the next weekDay
  if(localHour >= 24){
    localHour = localHour - 24
    dayOffset = 1
  }

  //If the hour is a negative number it means we go back one weekDay
  if(localHour < 0){
    localHour = localHour + 24
    dayOffset = -1
  }

  callback(localHour, dayOffset)
}

var calculateVariableLocalDay = function(now, dayOffset, callback){

  var time = now.getTime()
  var offset = dayOffset * 24 * 60 * 60 * 1000

  var offsetedTime = time + offset
  var offsetedDate = new Date(offsetedTime)

  var localDay = offsetedDate.getUTCDate()

  callback(localDay)

}

var calculatePreviousHourTimestamp = function(now, callback){

  var previousHourTimestamp = now - 1 * 60 * 60 * 1000

  callback(previousHourTimestamp)

}

var cleanDate = function(){
  return new Date(minMilliseconds)
}

exports.calculateUTCRangeDayHour = calculateUTCRangeDayHour
exports.calculateUTCRangeDay = calculateUTCRangeDay
exports.dateRangeValidation = dateRangeValidation
exports.cleanDate = cleanDate
exports.calculateUTCWeekDayHour = calculateUTCWeekDayHour
exports.calculateUTCOffset = calculateUTCOffset

exports.getDaysInMonth = getDaysInMonth

exports.calculateVariableLocalHour = calculateVariableLocalHour
exports.calculateVariableLocalDay = calculateVariableLocalDay
exports.calculatePreviousHourTimestamp = calculatePreviousHourTimestamp
