// import dl from "./dl.json";
// import ca from "./ca.json";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const dl = require("../shared/dl.json");
const ca = require("../shared/ca.json");
import fs from "fs";

function createObj(src) {
  let obj = {};
  let index = Object.keys(src)[0];
  for (let i = 0; i < Object.keys(src[index]).length; i++) {
    let ride = src[index][i];
    obj[ride.id] = {name: ride.name, /* waitTime: "", */ rideLength: "", longitude: ride.meta.longitude, latitude: ride.meta.latitude}
  }
  return obj;
}

let dlObj = createObj(dl);
let caObj = createObj(ca);

fs.writeFileSync("./disneyland_data_template.json", JSON.stringify(dlObj, null, 2));
fs.writeFileSync("./california_data_template.json", JSON.stringify(caObj, null, 2));