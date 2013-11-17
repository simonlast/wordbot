require("./db.coffee")
require("./components/loadAll.coffee")
Drag = require("./polyfill.coffee")
Create = require("./create.coffee")
Controller = require("./controller.coffee")
Persist = require("./persist.coffee")

setup = ->
  drag = new Drag()
  create = new Create()
  controller = new Controller()
  persist = new Persist()

window.addEventListener('WebComponentsReady', setup)