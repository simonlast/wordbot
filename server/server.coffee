http = require("http")
connect = require("connect")
express = require("express")
build = require("./build")
sio = require('socket.io')

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
	