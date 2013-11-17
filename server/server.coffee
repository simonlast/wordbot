http = require("http")
connect = require("connect")
express = require("express")
build = require("./build")
sio = require('socket.io')
levelup = require('levelup')

db = levelup("./store", {valueEncoding: "json"})

build.watch()

app = express()
oneDay = 86400000

app.use connect.static(__dirname + "/../public",
  maxAge: oneDay
)

server = http.createServer(app)

io = sio.listen server, log: false

server.listen 80

io.sockets.on 'connection', (socket) ->

  socket.on "set", (data, fn) ->
    db.put data.id, data.data, (err) ->
      console.log "set: ", data, typeof data
      if err?
        console.log(err)
        fn({err: err.message})
      else
        fn({})


  socket.on "get", (data, fn) ->
    db.get data.id, (err, value) ->
      console.log "got: ", value, typeof value
      if err?
        console.log(err)
        fn({err: err.message})
      else
        fn({value: value})