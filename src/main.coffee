require("./components/loadAll.coffee")
Drag = require("./polyfill.coffee")

setup = ->
  drag = new Drag()

window.onload = setup