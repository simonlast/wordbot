require("./db.coffee")
require("./components/loadAll.coffee")

setup = ->
  require("./polyfill.coffee")
  require("./create.coffee")
  require("./Controller.coffee")
  require("./persist.coffee")

window.addEventListener('WebComponentsReady', setup)