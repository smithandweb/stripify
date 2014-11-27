var through = require("through")
  , falafel = require("falafel")

module.exports = function (file) {
  if (/\.json$/.test(file)) return through()

  var data = ""

  return through(
    function (buf) {
      data += buf
    },
    function () {
      try {
        this.queue(String(parse(data)))
      } catch (er) {
        this.emit("error", new Error(er.toString().replace("Error: ", "") + " (" + file + ")"))
      }
      this.queue(null)
    }
  )
}

function parse (data) {
  return falafel(data, function (node) {
    if (node.type != "DebuggerStatement" && (node.type != "CallExpression" || !isTrackFunc(node.callee))) return;
    node.update("")
  })
}

function isTrackFunc (node) {
  return isTrack(node) && isFunc(node.property)
}

function isTrack (node) {
  if (!node) return false
  if (node.type != "MemberExpression") return false
  return node.object.type == "Identifier" && node.object.name == "track"
}

var trackApi = ["track","identify","person"]

function isFunc (node) {
  return node.type == "Identifier"
    && (trackApi.indexOf(node.name) > -1)
}