levelup = require('levelup')

db = levelup("./store", {valueEncoding: "json"})


get = (id, callback) ->
  db.get(id, callback)


set = (id, data, callback) ->
  db.put(id, data, callback)


module.exports = {get, set}