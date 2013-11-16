require("./components/loadAll.coffee")
Drag = require("./polyfill.coffee")
Create = require("./create.coffee")

setup = ->
  drag = new Drag()
  create = new Create()

$(setup)