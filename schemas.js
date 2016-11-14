  //JSON SCHEMAS

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

  var DataSchema = {

    type: 'object',
    properties: {
      
      payload: {
        type: 'object',
        required: true,
        properties: {
          
          data: {
             type: 'array',

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


//   {
// "payload": {
// "data": [
//   {
//   "dataKey": "datkey", 
//   "deviceKey": "devkey",
//   "measurements":[ {"time": "number", "value": 0.234345356}, {"time": "number", "value": 0.1234345356} ]
//   }
//   ]
// }
// }

  var VariableDataSchema = {

    type: 'object',
    properties: {
      payload: {
        type: 'object',
        required: true,      
        properties: {

          data: {
             type: 'array',
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
                          type: 'string',
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
  // “data”: [
  // {
  // “deviceKey”: string,
  // “measurements”:[ {“time”: number, “val”: number} ]
  // }
  // ]
  // },
  // “metadata”: { … }  
  // }

  var DeviceDataSchema = {

    type: 'object',
    properties: {
      payload: {
        type: 'object',
        required: true,      
        properties: {

          data: {
             type: 'array',
             items: {
                type: 'object',
                properties: {
                 
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

  exports.StreetSchema = StreetSchema;
  exports.VariableSchema = VariableSchema;
  exports.DeviceSchema = DeviceSchema;
  exports.DataSchema = DataSchema;
  exports.VariableDataSchema = VariableDataSchema;
  exports.DeviceDataSchema = DeviceDataSchema;

  // {
  // "payload": {
  // "data": [
  //   {
  //   "dataKey": "datkey", 
  //   "deviceKey": "devkey",
  //   "measurements":[ {"time": "number", "value": 0.234345356} ]
  //   }
  //   ]
  // }
  // }