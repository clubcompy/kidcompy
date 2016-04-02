var fs = require('fs'),
  readline = require("readline"),
  _ = require("lodash");

var rl = readline.createInterface({
  input: fs.createReadStream('./kid-SCII.txt', 'utf8')
});

var kidsciiCharacterData = "",
  kidsciiCharacterMaps = [];

rl.on('line', (line) => {
  line = line.trim();

  if(line.length === 0 || line.startsWith("#")) return;

  var titleLine = /([0-9]+)\:[\s]*(.*)/.exec(line),
    /** @type {KidsciiCharacter} */
    kidsciiCharacterMap,
    reversedLine;

  if(titleLine) {
    kidsciiCharacterMap = {
      code: parseInt(titleLine[1], 10),
      screenName: titleLine[2],
      offset: kidsciiCharacterData.length
    };

    kidsciiCharacterMaps.push(kidsciiCharacterMap);
  }
  else {
    kidsciiCharacterMap = _.last(kidsciiCharacterMaps);

    kidsciiCharacterMap.nybbleCount = kidsciiCharacterMap.nybbleCount || (line.length > 8 ? 4 : 2);
    reversedLine = line.split("").reverse().join("");
    kidsciiCharacterData += _.padLeft(parseInt(reversedLine, 2).toString(16), kidsciiCharacterMap.nybbleCount, "0");
  }
}).on("close", () => {
  var kidscii = {
    data: kidsciiCharacterData,
    maps: kidsciiCharacterMaps
  };

  fs.writeFileSync("kid-SCII.js", "// generated file, do not modify.  run `node buildKidsciiJson.js` to regenerate\n\n// jscs: disable\nmodule.exports = " + JSON.stringify(kidscii, null, "  ") + ";\n");
});
