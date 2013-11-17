db = {}

socket = io.connect(window.location.href)

db.get = (id, callback) ->
  query = {id}
  socket.emit "get", query, (data) ->
    callback(data)


db.set = (id, data, callback) ->
  query = {id, data}
  socket.emit "set", query, (data) ->
    callback(data)


module.exports = db