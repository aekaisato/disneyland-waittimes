import { createRequire } from "module";
const require = createRequire(import.meta.url);
const dl = require("./disneyland_data_template.json");
import fs from "fs";

let obj = {}
let keys = Object.keys(dl);
for (let i = 0; i < keys.length; i++) {
  let ride = dl[keys[i]];
  let rideLength = ride.rideLength;
  let minutes = rideLength.substring(0,rideLength.indexOf(":"));
  let seconds = rideLength.substring(rideLength.indexOf(":") + 1);
  minutes = Number.parseInt(minutes);
  seconds = Number.parseInt(seconds);
  let time = minutes + (Math.round(seconds / 6) / 10);
  ride.rideLength = time;
  obj[keys[i]] = ride;
}

fs.writeFileSync("./disneyland_ride_length_fixed.json", JSON.stringify(obj));
