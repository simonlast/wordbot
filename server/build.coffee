path = require("path")
fs = require("fs")
browserify = require("browserify")
watch = require("node-watch")
less = require('less')

dir = path.join(__dirname, "/../src/")
main = path.join(dir, "main.coffee")
out = path.join(__dirname, "/../public/assets/build.js")
coffee = require("coffee-script")
through = require("through")

lessFile = path.join(__dirname, "/../public/styles/style.less")
cssFile = path.join(__dirname, "/../public/styles/style.css")

br = browserify()
br.add main

br.transform (file) ->
  write = (buf) ->
    data += buf
  end = ->
    @queue coffee.compile(data)
    @queue null
  data = ""
  return through(write, end)

outStream = fs.createWriteStream(out)
exports.build = ->
  br.bundle().pipe outStream
  outStream = fs.createWriteStream(out)
  console.log "wrote " + out

buildStyles = ->
  fs.readFile lessFile, 'utf8', (err, data) ->
    less.render data, (err, css) ->
      fs.writeFile cssFile, css, 'utf8', ->
        console.log "wrote " + cssFile

exports.watch = ->
  exports.build()
  buildStyles()

  watch dir, ->
    exports.build()

  watch lessFile, ->
    buildStyles()

  
