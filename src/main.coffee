require("./components/loadAll.coffee")
Drag = require("./polyfill.coffee")
Create = require("./create.coffee")
Controller = require("./controller.coffee")

setup = ->
  drag = new Drag()
  create = new Create()
  controller = new Controller()

$(setup)