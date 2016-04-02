"use strict";

// wait for onCodeGo event before trying to run harness routines
kidcompy.lifecycleEvents.addOnCodeGoHandler(function() {
  var kidcompyHost = new kidcompy.KidcompyHost("test");

  kidcompyHost.flipBuffers[0].playfields[0].fillRectangle(0, 0, 10, 10, "#0000ff");
  kidcompyHost.flipBuffers[0].playfields[1].fillRectangle(10, 10, 10, 10, "#00ff00");
  kidcompyHost.flipBuffers[0].playfields[2].fillRectangle(20, 20, 10, 10, "#ff0000");
  kidcompyHost.flipBuffers[0].playfields[3].fillRectangle(30, 30, 10, 10, "#0000ff");
  kidcompyHost.flipBuffers[0].playfields[4].fillRectangle(40, 40, 10, 10, "#00ff00");
  kidcompyHost.flipBuffers[0].playfields[5].fillRectangle(50, 50, 10, 10, "#ff0000");
  kidcompyHost.flipBuffers[0].playfields[6].fillRectangle(60, 60, 10, 10, "#0000ff");
  kidcompyHost.flipBuffers[0].playfields[7].fillRectangle(70, 70, 10, 10, "#00ff00");

  kidcompyHost.flipBuffers[1].playfields[0].fillRectangle(80, 80, 10, 10, "#0000ff");
  kidcompyHost.flipBuffers[1].playfields[1].fillRectangle(90, 90, 10, 10, "#00ff00");
  kidcompyHost.flipBuffers[1].playfields[2].fillRectangle(100, 100, 10, 10, "#ff0000");
  kidcompyHost.flipBuffers[1].playfields[3].fillRectangle(110, 110, 10, 10, "#0000ff");
  kidcompyHost.flipBuffers[1].playfields[4].fillRectangle(120, 120, 10, 10, "#00ff00");
  kidcompyHost.flipBuffers[1].playfields[5].fillRectangle(130, 130, 10, 10, "#ff0000");
  kidcompyHost.flipBuffers[1].playfields[6].fillRectangle(140, 140, 10, 10, "#0000ff");
  kidcompyHost.flipBuffers[1].playfields[7].fillRectangle(150, 150, 10, 10, "#00ff00");

  kidcompyHost.flipBuffers[0].playfields[0].paintCharacter(5, 20, "A".charCodeAt(0), true, "#000");
  kidcompyHost.flipBuffers[0].playfields[0].paintCharacter(6, 20, "B".charCodeAt(0), false, "#000");
  kidcompyHost.flipBuffers[0].playfields[0].paintCharacter(7, 20, "C".charCodeAt(0), true, "#000");
  kidcompyHost.flipBuffers[0].playfields[0].paintCharacter(8, 20, "D".charCodeAt(0), false, "#000");
});
