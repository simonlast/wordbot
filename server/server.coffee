http = require("http")
connect = require("connect")
express = require("express")
build = require("./build")
sio = require('socket.io')
path = require("path")
_ = require("underscore")
cons = require("consolidate")
shortId = require("shortId")

db = require("./db")



build.watch()

app = express()
oneDay = 86400000

app.use connect.static(__dirname + "/../public",
  maxAge: oneDay
)

app.engine("html", cons.underscore)
app.set("view engine", "html")
app.set("views", path.join(__dirname, "templates"))


app.get "/", (req, res) ->
  id = shortId.generate()
  res.redirect("/#{id}")


app.get "/:id", (req, res) ->
  db.get req.params.id, (err, data) ->
    if err?
      res.render("bot.html", {data: "null"})
    else
      dataString = JSON.stringify(data)
      res.render("bot.html", {data: dataString})


server = http.createServer(app)

io = sio.listen server, log: false

server.listen 80

io.sockets.on 'connection', (socket) ->

  socket.on "set", (data, fn) ->
    console.log "set: ", data, typeof data
    db.set data.id, data.data, (err) ->
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