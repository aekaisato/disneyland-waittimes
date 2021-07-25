import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const dl = require("./dl_walking.json");
const ca = require("./ca_walking.json");

function fixKeys(obj) { // the dl stuff was from before i made this a function
  let newDlObj = {};
  let dlKeys = Object.keys(obj);
  for (let i = 0; i < dlKeys.length; i++) {
    let key = dlKeys[i];
    let value = obj[dlKeys[i]];
    let index = key.indexOf("DisneylandResort", 1);
    key = key.substring(0, index) + " " + key.substring(index);
    newDlObj[key] = value;
  }
  return newDlObj;
}

let newDlObj = fixKeys(dl);
let newCaObj = fixKeys(ca);
fs.writeFileSync("./dl_walking_fixed.json", JSON.stringify(newDlObj));
fs.writeFileSync("./ca_walking_fixed.json", JSON.stringify(newCaObj));
