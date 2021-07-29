import { RideNode } from "./ride-node.js";
import _ from "lodash";
import { add, parseISO, format } from "date-fns";
import ical from 'ical-generator';

export class PathSearch {
  allNodes;
  currentNode;
  startNode;
  startTime;

  constructor(rideIds, park, time, startId) {
    if (time === undefined || time === null) {
      this.startTime = new Date();
    } else {
      this.startTime = time;
    }
    this.allNodes = [];
    for (let i = 0; i < rideIds.length; i++) {
      this.allNodes.push(new RideNode(rideIds[i]));
    }
  }

  async pathSearchBruteForceMeta() {
    let nodes = _.cloneDeep(this.allNodes);
    let allRoutesObj = { allRoutes: [] }; // misleading and from old code, actually just stores shortest path in allRoutesObj.allRoutes[0]
    let route = [];
    await this.pathSearchBruteForce(route, nodes, allRoutesObj, (nodes[0].park));
    return allRoutesObj.allRoutes[0].route;
  }

  async pathSearchBruteForce(r, notInRoute, allRoutesObj, park) {
    if (!notInRoute.length === 0) {
      for (let i = 0; i < notInRoute.length; i++) {
        let justRemoved = notInRoute.shift();
        let newRoute = _.cloneDeep(r);
        newRoute.push(justRemoved);

        await this.pathSearchBruteForce(newRoute, notInRoute, allRoutesObj, park);
        notInRoute.push(justRemoved);
      }
    } else {
      let routeObj = { length: Number.MAX_SAFE_INTEGER, route: r };
      let length = 0;
      let time = new Date();
      for (let i = 0; i < r.length; i++) {
        let prev;
        if (i > 0) {
          prev = r[i - 1].rideId;
        } else {
          prev = "DisneylandResort" + ((park.toLowerCase().includes("california")) ? "CaliforniaAdventure" : "MagicKingdom") + "_ParkEntrance";
        }
        let distance = await r[i].getDistance(time.toISOString(), prev);
        r[i].tentativeDistance = distance;
        r[i].tentativeTime = time.toISOString();
        length += distance;
        time = add(time, { minutes: distance });
      }
      routeObj.length = length;
      if (allRoutesObj.allRoutes.length === 0) {
        allRoutesObj.allRoutes.push(routeObj);
      } else if (allRoutesObj.allRoutes[0].length > routeObj.length) {
        allRoutesObj.allRoutes[0] = routeObj;
      }
    }
  }

  async pathSearchBubble(iterations) {
    if (iterations === undefined || iterations === null) {
      iterations = Number.MAX_SAFE_INTEGER;
    }
    let nodes = _.cloneDeep(this.allNodes);
    let park = nodes[0].park;
    let startTime = new Date(this.startTime);
    let bestLength = 0;
    for (let i = 0; i < nodes.length; i++) {
      let prev = nodes[i - 1] ? nodes[i-1].rideId : "";
      if (i === 0) {
        prev = "DisneylandResort" + ((park.toLowerCase().includes("california")) ? "CaliforniaAdventure" : "MagicKingdom") + "_ParkEntrance";
      }
      let distance = await nodes[i].getDistance(startTime.toISOString(), prev);
      nodes[i].tentativeDistance = distance;
      bestLength += distance;

      nodes[i].tentativeTime = startTime.toISOString();
      startTime = add(startTime, { minutes: distance });
    }
    for (let n = 0; n < iterations; n++) {
      let lastNodes = _.cloneDeep(nodes);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
          let swapNodes = _.cloneDeep(nodes);
          let temp = swapNodes[i];
          swapNodes[i] = swapNodes[j];
          swapNodes[j] = temp;

          let startTime = new Date(this.startTime);
          let swapLength = 0;
          for (let k = 0; k < swapNodes.length; k++) {
            let prev = swapNodes[k - 1] ? swapNodes[k-1].rideId : "";
            if (k === 0) {
              prev = "DisneylandResort" + ((park.toLowerCase().includes("california")) ? "CaliforniaAdventure" : "MagicKingdom") + "_ParkEntrance";
            }
            let distance = await swapNodes[k].getDistance(
              startTime.toISOString(),
              prev
            );
            if (distance > 999999) { // yea ik this is dumb and bad but this is meant to be a hacky script so whatever
              bestLength = Number.MAX_SAFE_INTEGER;
              break;
            }  
            swapNodes[k].tentativeDistance = distance;
            swapLength += distance;
            swapNodes[k].tentativeTime = startTime.toISOString();
            startTime = add(startTime, { minutes: distance });
          }

          if (swapLength < bestLength) {
            nodes = swapNodes;
            bestLength = swapLength;
          }
        }
      }
      let isTheSame = true;
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].rideId !== lastNodes[i].rideId) {
          isTheSame = false;
          break;
        }
      }
      if (isTheSame) {
        break;
      }
    }
    return nodes;
  }

}

async function getTimeOfPath(nodes, startTime) {
  let swapNodes = nodes;
  if (startTime === undefined || startTime == null) {
    startTime = new Date(parseISO(nodes[0].tentativeTime));
  }
  let swapLength = 0;
  let park = swapNodes[0].park;
  for (let k = 0; k < swapNodes.length; k++) {
    let prev = swapNodes[k - 1] ? swapNodes[k-1].rideId : "";
    if (k === 0) {
      prev = "DisneylandResort" + ((park.toLowerCase().includes("california")) ? "CaliforniaAdventure" : "MagicKingdom") + "_ParkEntrance";
    }
    let distance = await swapNodes[k].getDistance(startTime.toISOString(), prev);
    swapNodes[k].tentativeDistance = distance;
    swapLength += distance;
    swapNodes[k].tentativeTime = startTime.toISOString();
    startTime = add(startTime, { minutes: distance });
  }
  return swapLength;
}

async function getPath(nodes, startTime) {
  let swapNodes = nodes;
  let finalObj = {
    park: null,
    globalStartTime: null,
    globalEndTime: null,
    length: null,
    route: [],
  }
  // startTime: null,
  // endTime: null,
  // walkTime: null,
  // estWaitTime: null,
  // rideLength: null
  let park = swapNodes[0].park;
  if (startTime === undefined || startTime === null) {
    startTime = new Date(parseISO(nodes[0].tentativeTime));
  }
  finalObj.park = park;
  finalObj.globalStartTime = startTime.toISOString();
  let swapLength = 0;
  for (let k = 0; k < swapNodes.length; k++) {
    let prev = swapNodes[k - 1] ? swapNodes[k-1].rideId : "";
    if (k === 0) {
      prev = "DisneylandResort" + ((park.toLowerCase().includes("california")) ? "CaliforniaAdventure" : "MagicKingdom") + "_ParkEntrance";
    }
    let distance = await swapNodes[k].getDistance(startTime.toISOString(), prev);
    finalObj.route.push({
      name: swapNodes[k].rideName,
      startTime: startTime.toISOString(),
      endTime: add(startTime, {minutes: distance}).toISOString(),
      walkTime: swapNodes[k].cachedWalkTime,
      estWaitTime: swapNodes[k].cachedEstWait,
      rideLength: swapNodes[k].cachedRideLength
    })
    swapNodes[k].tentativeDistance = distance;
    swapLength += distance;
    swapNodes[k].tentativeTime = startTime.toISOString();
    startTime = add(startTime, { minutes: distance });
  }
  finalObj.length = swapLength;
  finalObj.globalEndTime = add(parseISO(finalObj.globalStartTime), {minutes: swapLength}).toISOString();
  return finalObj;
}

function getICal(finalPath) {
  let keys = Object.keys(finalPath.route);
  const calendar = ical({name: "generated calendar - " + format(new Date(), "R-M-d") + " - " + finalPath.park})
  for (let i = 0; i < keys.length; i++) {
    let routeObj = finalPath.route[keys[i]]
    let walkStart = parseISO(routeObj.startTime);
    let walkEndWaitStart = add(walkStart, {minutes: routeObj.walkTime})
    let waitEndRideStart = add(walkEndWaitStart, {minutes: routeObj.estWaitTime});
    let rideEnd = add(waitEndRideStart, {minutes: routeObj.rideLength})
    
    calendar.createEvent({
      start: walkStart,
      end: walkEndWaitStart,
      summary: "Walk to " + routeObj.name,
      description: "est. duration is " + Math.round(routeObj.walkTime) + " minutes",
      location: routeObj.name,
      url: "https://www.toadtoad.xyz"
    })
    calendar.createEvent({
      start: walkEndWaitStart,
      end: waitEndRideStart,
      summary: "Wait in line for " + routeObj.name,
      description: "est. duration is " + Math.round(routeObj.estWaitTime) + " minutes",
      location: routeObj.name,
      url: "https://www.toadtoad.xyz"
    })
    calendar.createEvent({
      start: waitEndRideStart,
      end: rideEnd,
      summary: "Ride " + routeObj.name,
      description: "est. duration is " + Math.round(routeObj.rideLength) + " minutes",
      location: routeObj.name,
      url: "https://www.toadtoad.xyz"
    })
  }
  return calendar;
}

export { getTimeOfPath, getPath, getICal };
