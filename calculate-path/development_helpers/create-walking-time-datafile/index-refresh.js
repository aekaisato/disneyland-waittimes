// import 'here-js-api/scripts/mapsjs-core.js';
// import 'here-js-api/scripts/mapsjs-service.js';
import fs from "fs";
import api_creds from "./api-key.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import fetch from "node-fetch";
const dl = require("../shared/dl.json");
const ca = require("../shared/ca.json");
const dlExisting = require("./dl_walking_fixed.json");
const caExisting = require("./ca_walking_fixed.json");

// let platform = new H.service.Platform({
//   'apiKey': api_creds.api_key
// });

// let router = platform.getRoutingService(null, 8);
// let routingParameters = {
//   transportMode: "pedestrian",
//   origin: "insert coords here",
//   destination: "insert coords here",
// };

async function calculateRouteAsync(routingParams) {
  // return new Promise(resolve => {
  //   router.calculateRoute(routingParams, (res) => resolve(res), (err) => resolve(err));
  // })
  const baseUrl = "https://router.hereapi.com/v8/routes?";
  let url = baseUrl;
  url += "transportMode=" + routingParams.transportMode;
  url += "&origin=" + routingParams.origin;
  url += "&destination=" + routingParams.destination;
  url += "&apiKey=" + api_creds.api_key;
  url += "&return=summary";

  let res = await fetch(url);
  return res.json();
}

async function generateParkWalkingTimes(parkObj, existsObj) {
  let walkingTimes = {};
  let day = parkObj[Object.keys(parkObj)[0]];
  let totalCalc = (0.5*Object.keys(day).length*(Object.keys(day).length+1));
  let n = 0;
  for (let i = 0; i < Object.keys(day).length; i++) {
    console.log(i);
    console.log(day[i]);
    console.log();
    if (day[i]) {
      let origin = day[i].meta.latitude + "," + day[i].meta.longitude;
      for (let j = i+1; j < Object.keys(day).length; j++) {
        let destination = day[j].meta.latitude + "," + day[j].meta.longitude;
        console.log("origin: " + origin + ", index: " + i);
        console.log("destination: " + destination + ", index: " + j);
        let key = day[i].id + " " + day[j].id;
        let value;
        if (existsObj[key]) {
          value = existsObj[key] * 60;
        } else {
          let res = await calculateRouteAsync({transportMode: "pedestrian", origin, destination});
          value = res.routes[0].sections[0].summary.duration;
        }
        // console.log(res);
        // console.log(res.routes[0].sections);
        console.log("duration (s): " + value);
        console.log("duration (m): " + (value / 60));
        walkingTimes[key] = value / 60;
        console.log("completed " + ++n + "/" + totalCalc + " walking time queries");
        console.log();
      }
    }
  }
  return walkingTimes;
}

let walkingTimesDl = await generateParkWalkingTimes(dl, dlExisting);
fs.writeFileSync("./dl_walking_with_entrance_mod.json", JSON.stringify(walkingTimesDl, null, 2));
let walkingTimesCa = await generateParkWalkingTimes(ca, caExisting);
fs.writeFileSync("./ca_walking_with_entrance_mod.json", JSON.stringify(walkingTimesCa, null, 2));
