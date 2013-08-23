require("./components/loadAll.coffee")
Drag = require("./polyfill.coffee")
sound = require("./sound.coffee")

setup = ->
  sound.load()
  drag = new Drag()
  $("body").append("<p-grid></pgrid>")


window.onload = setup