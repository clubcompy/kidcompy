var fs = require('fs'),
  readline = require("readline");

var rl = readline.createInterface({
  input: fs.createReadStream('./kid-SCII.txt', 'utf8')
});

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

var kidsciiCharacterMaps = [];

rl.on('line', (line) => {
  line = line.trim();

  if(line.length === 0 || line.startsWith("#")) return;

  var titleLine = /([0-9]+)\:[\s]*(.*)/.exec(line);
  if(titleLine) {
    kidsciiCharacterMaps.push({
      code: parseInt(titleLine[1], 10),
      screenName: titleLine[2],
      charMap: ""
    });
  }
  else {
    kidsciiCharacterMaps[kidsciiCharacterMaps.length-1].charMap += pad(parseInt(line, 2).toString(16), line.length > 8 ? 4 : 2);
  }
}).on("close", () => {
  fs.writeFileSync("kid-SCII.json", JSON.stringify(kidsciiCharacterMaps, null, "  "));
});
