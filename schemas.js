//JSON SCHEMAS

var allowedTypes = '^(mode|median|mean|all)$'
var yearPattern = '^[2]\\d\\d\\d$'
var monthPattern = '^[0-9]$|^[1][0-1]$'
var dayPattern = '^[1-9]$|^[1-2]\\d$|^[3][0-1]$'
var hourPattern = '^\\d$|^[1]\\d$|^[2][0-3]$'
var weekDayPattern = '^[0-6]$'
var offsetPattern = '^[1-9]$|^\\d\\d$|^[1-7]\\d\\d$|^[1-8][0-3]\\d$|^[1-8][4][0]$|^[-][1-9]$|^[-]\\d\\d$|^[-][1-6]\\d\\d$|^[-][1-7][2][0]$'
var millisecondsPattern = '^\\d+$'

var VariableSchema = {

  type: 'object',
  properties: {
    payload: {
      type: 'object',
      required: true,
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
        timezone: {
          type: 'string',
          required: true
        },
        tipo: {
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

var DeviceSchema = {

  type: 'object',
  properties: {
    payload: {
      type: 'object',
      required: true,
      properties: {
        nombre: {
          type: 'string',
          required: true
        },
        lugar: {
          type: 'string',
          required: true
        },
        variable_id: {
          type: 'string',
          required: true
        },
        descripcion: {
          type: 'string',
          required: true
        }
      }

    }
  }

}

//   {
//  "payload": {
//  "nombre" : "Device 1",
//  "lugar" : "Estacionamiento puerta 6",
//  "variable_id": "",
//  "descripcion":"Chiquito y brillante"
//  }
// }


var DataSchema = {

  type: 'object',
  properties: {

    payload: {
      type: 'object',
      required: true,
      properties: {

        data: {
          type: 'array',
          required: true,
          items: {

            type: 'object',
            properties: {

              dataKey: {
                type: 'string',
                required: true
              },

              deviceKey: {
                type: 'string',
                required: true
              },

              measurements:{

                type: 'array',
                items: {
                  type: 'object',
                  properties:{
                    time: {
                      type: 'string',
                      required: true
                    },
                    value: {
                      type: 'number',
                      required: true
                    }
                  }
                } //items
              }

            }

          }, //items
          'minItems': 1,
          'uniqueItems': true
        }
      }

    }
  }

}

//
// {
//   "payload": {
//   "data": [
//   {
//   "dataKey" : "582a4b5e8cd48d060770c8f8",
//   "deviceKey": "582a50f293bcda0676227ee6",
//   "measurements":[ {"time": 12345678, "value": 0.456} ]
//   }
//   ]
//   }
//   }

var VariableDataSchema = {

  type: 'object',
  properties: {
    payload: {
      type: 'object',
      required: true,
      properties: {

        data: {
          type: 'array',
          required: true,
          items: {

            type: 'object',
            properties: {

              deviceKey: {
                type: 'string',
                required: true
              },
              measurements:{
                type: 'array',
                items: {
                  type: 'object',
                  properties:{

                    time: {
                      type: 'number',
                      required: true
                    },
                    value: {
                      type: 'number',
                      required: true
                    }
                  }
                }
              }
            }
          },
          'minItems': 1,
          'uniqueItems': true
        }

      }
    }

  }
}

// {
//   "payload": {
//   "data": [
//   {
//   "deviceKey": "582a50f293bcda0676227ee6",
//   "measurements":[ {"time": 12345678, "value": 0.556},
//   {"time": 12345678, "value": 1.456},
//   {"time": 12345678, "value": 2.456},
//   {"time": 12345678, "value": 3.456}]
//   }
//   ]
//   }
//   }


var DeviceDataSchema = {

  type: 'object',
  properties: {
    payload: {
      type: 'object',
      required: true,
      properties: {

        data: {
          type: 'array',
          required: true,
          items: {
            type: 'object',
            properties: {

              measurements:{
                type: 'array',
                items: {
                  type: 'object',
                  properties:{

                    time: {
                      type: 'number',
                      required: true
                    },
                    value: {
                      type: 'number',
                      required: true
                    }
                  }
                }
              }

            }
          },
          'minItems': 1,
          'uniqueItems': true
        }

      }
    }

  }

}


// {
// “payload”: {
//  “data”:[ {“time”: number, “val”: number} ]
// },
// “metadata”: { … }
// }

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

var GetDataSchema = {

  type: 'object',
  properties: {
    EPOCH_START: {
      type: 'string',
      pattern: '^(0|[1-9][0-9]*)$',
      required: true
    },
    EPOCH_END: {
      type: 'string',
      pattern: '^(0|[1-9][0-9]*)$',
      required: false
    }
  }

}

var GetStatisticsSchema = {

  type: 'object',
  properties: {
    EPOCH_START: {
      pattern: '^(0|[1-9][0-9]*)$',
      required: true
    },
    EPOCH_END: {
      pattern: '^(0|[1-9][0-9]*)$',
      required: false
    },
    MEAN : {
      pattern: '^(true|false|TRUE|FALSE|0|1)$'
    },
    MEDIAN : {
      pattern: '^(true|false|TRUE|FALSE|0|1)$'
    },
    MODE : {
      pattern: '^(true|false|TRUE|FALSE|0|1)$'
    }
  }

}

var YearSchema = {

  type: 'object',
  properties: {
    year: {
      pattern: yearPattern,
      required: true
    },
    type: {
      pattern: allowedTypes,
      required: true
    }
  }

}

var MonthSchema = {

  type: 'object',
  properties: {
    month: {
      pattern: monthPattern,
      required: true
    },
    year: {
      pattern: yearPattern,
      required: true
    },
    type: {
      pattern: allowedTypes,
      required: true
    }
  }

}

var DaySchema = {

  type: 'object',
  properties: {
    day: {
      pattern: dayPattern,
      required: true
    },
    month: {
      pattern: monthPattern,
      required: true
    },
    year: {
      pattern: yearPattern,
      required: true
    },
    type: {
      pattern: allowedTypes,
      required: true
    }
  }

}

var WeekDaySchema = {

  type: 'object',
  properties: {
    weekDay: {
      pattern: weekDayPattern,
      required: true
    },
    year: {
      pattern: yearPattern,
      required: true
    },
    type: {
      pattern: allowedTypes,
      required: true
    }
  }

}

var WeekDayHourSchema = {

  type: 'object',
  properties: {
    hour: {
      pattern: hourPattern,
      required: true
    },
    offset: {
      pattern: offsetPattern,
      required: false
    },
    weekDay: {
      pattern: weekDayPattern,
      required: true
    },
    year: {
      pattern: yearPattern,
      required: true
    },
    type: {
      pattern: allowedTypes,
      required: true
    }
  }

}

var RangeDaySchema = {

  type: 'object',
  properties: {
    y1 : {
      type: 'string',
      pattern: yearPattern,
      required: true
    },
    m1 : {
      type: 'string',
      pattern: monthPattern,
      required: true
    },
    d1 : {
      type: 'string',
      pattern: dayPattern,
      required: true
    },
    y2 : {
      type: 'string',
      pattern: yearPattern,
      required: true
    },
    m2 : {
      type: 'string',
      pattern: monthPattern,
      required: true
    },
    d2 : {
      type: 'string',
      pattern: dayPattern,
      required: true
    },
    type: {
      pattern: allowedTypes,
      required: true
    }
  }

}

var RangeDayHourSchema = {

  type: 'object',
  properties: {
    y1 : {
      type: 'string',
      pattern: yearPattern,
      required: true
    },
    m1 : {
      type: 'string',
      pattern: monthPattern,
      required: true
    },
    d1 : {
      type: 'string',
      pattern: dayPattern,
      required: true
    },
    y2 : {
      type: 'string',
      pattern: yearPattern,
      required: true
    },
    m2 : {
      type: 'string',
      pattern: monthPattern,
      required: true
    },
    d2 : {
      type: 'string',
      pattern: dayPattern,
      required: true
    },
    hour: {
      pattern: hourPattern,
      required: true
    },
    type: {
      pattern: allowedTypes,
      required: true
    }
  }

}



exports.StreetSchema = StreetSchema;
exports.VariableSchema = VariableSchema;
exports.DeviceSchema = DeviceSchema;
exports.DataSchema = DataSchema;
exports.VariableDataSchema = VariableDataSchema;
exports.DeviceDataSchema = DeviceDataSchema;
exports.GetDataSchema = GetDataSchema;
exports.GetStatisticsSchema = GetStatisticsSchema;

exports.YearSchema = YearSchema;
exports.MonthSchema = MonthSchema;
exports.DaySchema = DaySchema;
exports.WeekDaySchema = WeekDaySchema;
exports.WeekDayHourSchema = WeekDayHourSchema;
exports.RangeDaySchema = RangeDaySchema;
exports.RangeDayHourSchema = RangeDayHourSchema;
