

# delay = 0 # play one note every quarter second
# note = 50 # the MIDI note
# velocity = 127 # how hard the note hits
# # play the note
# MIDI.setVolume(0, 127)
# MIDI.noteOn(0, note, velocity, delay)
# MIDI.noteOff(0, note, delay + 0.75)


sound = {}

sound.load = ->
  sound.ready = false
  MIDI.loadPlugin({
    soundfontUrl: "/midi/soundfont/",
    instrument: "acoustic_grand_piano",
    callback: ->
      sound.ready = true
      MIDI.setVolume(0, 127)
  })

sound.play = (note) ->
  delay = 0 # play one note every quarter second
  velocity = 127 # how hard the note hits
  MIDI.noteOn(0, note, velocity, delay)
  MIDI.noteOff(0, note, delay + 0.75)

module.exports = sound