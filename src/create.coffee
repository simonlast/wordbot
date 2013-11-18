util = require("./util.coffee")


class Create

  constructor: ->
    @nodeContainer = document.querySelector(".node-container")

    @initListeners_()


  initListeners_: ->
    $doc = $(document)
    $doc.on("dblclick", ".graph", @addNewNode_)


  addNewNode_: (e) =>
    $target = $(e.target)
    closestNode = $target.closest("p-node")[0]

    if not closestNode?
      node = document.createElement("p-node")
      node.setAttribute("node-id", uuid())
      @nodeContainer.appendChild(node)
      box = util.getElOuterBox(node)

      $(node).css({
        left: (e.pageX - box.width/2) + "px"
        top: (e.pageY - box.height/2) + "px"
      })

      node.setup()

      # Auto select input
      node.querySelector("input").select()


module.exports = new Create()