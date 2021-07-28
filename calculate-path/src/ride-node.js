import {
  parseISO,
  startOfDay,
  sub,
  add,
  isWithinInterval,
  intervalToDuration,
  closestTo,
} from "date-fns";
import { toUnit as durationToUnit } from "duration-fns";
import fetch from "node-fetch";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const dlWalking = require("./data/dl_walking_fixed.json");
const caWalking = require("./data/ca_walking_fixed.json");
const dlLength = require("./data/disneyland_ride_length_fixed.json");
const caLength = require("./data/california_ride_length.json");

export class RideNode {
  rideId;
  rideName;
  park;
  tentativeDistance;
  tentativeTime;
  cachedData;
  cachedDataRange;
  cachedEstWait;
  cachedWalkTime;
  cachedRideLength;

  constructor(rideId, tentativeDistance) {
    if (tentativeDistance == undefined || tentativeDistance == null) {
      this.tentativeDistance = Number.MAX_SAFE_INTEGER;
    } else {
      this.tentativeDistance = tentativeDistance;
    }
    this.rideId = rideId;
    if (rideId.toLowerCase().includes("california")) {
      this.park = "california";
    } else {
      this.park = "disneyland";
    }
    this.rideName = dlLength[rideId].name;
  }

  async getDistance(dateTimeISO, otherRideId) {
    let walkingTime = this.getWalkingTime(otherRideId);
    if (!walkingTime) {
      console.error(
        "walking time for " + this.rideId + " is undefined or null"
      );
      console.trace();
      process.exit(1);
    }
    console.log(otherRideId + " -> " + this.rideId);
    console.log(dateTimeISO)
    console.log("walk: " + walkingTime);
    let estWait = await this.getEstimatedWaitTime(
      add(parseISO(dateTimeISO), { minutes: walkingTime }).toISOString()
    );
    console.log("wait: " + estWait);
    if (!estWait) {
      console.error(
        "estimated wait for " + this.rideId + " is undefined or null"
      );
      console.trace();
      process.exit(1);
    }
    let rideLength = this.getRideLength();
    console.log("ride: " + rideLength);
    if (!rideLength) {
      console.error("ride length for " + this.rideId + " is undefined or null");
      console.trace();
      process.exit(1);
    }
    let distance = walkingTime + estWait + rideLength;
    console.log("calc: " + distance)
    console.log();
    this.tentativeDistance = distance;
    return distance;
  }

  getWalkingTime(otherRideId) {
    let key1 = (this.rideId + " " + otherRideId).trim();
    let key2 = (otherRideId + " " + this.rideId).trim();
    let walkingTimes;
    if (this.park.includes("california")) {
      walkingTimes = caWalking;
    } else {
      walkingTimes = dlWalking;
    }
    let keys = Object.keys(walkingTimes);
    for (let i = 0; i < keys.length; i++) {
      let keyW = keys[i].trim();
      if (keyW == key1 || keyW == key2) {
        this.cachedWalkTime = walkingTimes[keyW];
        return walkingTimes[keyW];
      }
    }
    return null;
  }

  async getEstimatedWaitTime(dateTimeISO) {
    let waitTimes = await this.getWaitTimes(dateTimeISO);
    let totalWaitTime = 0;
    if (waitTimes.length == 0) {
      return Number.MAX_SAFE_INTEGER;
    }
    // for (let i = 0; i < waitTimes.length; i++) {
    //   totalWaitTime += waitTimes[i].waitTime;
    // }
    // let avgWaitTime = totalWaitTime / waitTimes.length;
    waitTimes.sort((a, b) => {
      if (a.waitTime > b.waitTime) {
        return 1;
      } else if (b.waitTime > a.waitTime) {
        return -1;
      } else {
        return 0;
      }
    });
    let medianWaitTime;
    if (waitTimes.length % 2 == 0) {
      let index = [Math.floor(waitTimes.length / 2)];
      index.push(index[0] + 1);
      medianWaitTime = (waitTimes[index[0]] + waitTimes[index[1]]) / 2;
    } else {
      let index = Math.floor(waitTimes.length / 2) + 1;
      medianWaitTime = waitTimes[index];
    }
    let graphArr = [];
    let initTime = parseISO(waitTimes[0].time);
    for (let i = 0; i < waitTimes.length; i++) {
      graphArr.push({
        x: durationToUnit(
          intervalToDuration({
            start: initTime,
            end: parseISO(waitTimes[i].time),
          }),
          "hours"
        ),
        y: waitTimes[i].waitTime,
      });
    }
    graphArr.sort((a, b) => {
      if (a.y < b.y) {
        return 1;
      } else if (b.y > a.y) {
        return -1;
      } else {
        return 0;
      }
    });
    let m =
    (graphArr[graphArr.length - 1].y - graphArr[0].y) /
      (graphArr[graphArr.length - 1].x - graphArr[0].x);
    let y1 = graphArr[0].y;
    let r = (x) => {
      return x * m + y1;
    };
    let estimatedWaitTime = r(
      durationToUnit(
        intervalToDuration({start: initTime, end: parseISO(dateTimeISO)}),
        "hours"
      )
    );

    this.cachedEstWait = estimatedWaitTime;
    return estimatedWaitTime; 
    // this.cachedEstWait = medianWaitTime; // dont forget to change this
    // return medianWaitTime; // ofc do some more math and stuff to this later
  }

  async getWaitTimes(dateTimeISO, numOfDays) {
    if (!numOfDays) {
      numOfDays = 4;
    }
    let endDate = startOfDay(parseISO(dateTimeISO));
    let startDate = sub(endDate, { days: numOfDays });
    if (
      !this.cachedData || !this.cachedDataRange || !isWithinInterval(startOfDay(parseISO(dateTimeISO)), this.cachedDataRange)
    ) {
      let url =
      "https://disneyland-waittimes-api.vercel.app/api/get-rideOverInterval";
      url +=
        "?park=" +
          (this.park.includes("california") ? "california" : "disneyland");
      url += "&id=" + this.rideId;
      url += "&startTime=" + startDate.toISOString();
      url += "&endTime=" + endDate.toISOString();
      this.cachedData = await (await fetch(url)).json();
      this.cachedDataRange = {start: startDate, end: endDate};
    }
    let keys = Object.keys(this.cachedData);
    let arr = [];
    let tempDate = parseISO(dateTimeISO);
    for (let i = 0; i < keys.length; i++) {
      keys[i] = parseISO(keys[i]);
    }
    for (let n = 0; n < numOfDays; n++) {
      tempDate = sub(tempDate, { days: 1 });
      let foundIndex = closestTo(tempDate, keys)
      let dateIndex = foundIndex.toISOString();
      let storedTempDate = tempDate;
      while (!(this.cachedData[dateIndex] && this.cachedData[dateIndex].active)) {
        tempDate = add(tempDate, {minutes: 5});
        foundIndex = closestTo(tempDate, keys);
        dateIndex = foundIndex.toISOString();
      }
      arr.push({
        time: dateIndex,
        waitTime: this.cachedData[dateIndex].waitTime,
      });
      tempDate = storedTempDate;
    }
    return arr;
  }

  getRideLength() {
    let parkLength = (this.park.toLowerCase().includes("california")) ? caLength : dlLength;
    let length = parkLength[this.rideId].rideLength;
    this.cachedRideLength = length;
    return length;
  }
}
