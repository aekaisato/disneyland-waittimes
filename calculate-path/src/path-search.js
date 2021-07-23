import { RideNode } from "./ride-node.js";
import _ from "lodash";
import { add, parseISO } from "date-fns";

export class PathSearch {
  allNodes;
  currentNode;
  startNode;
  startTime;

  constructor(rideIds, park, time, startId) {
    if (time == undefined || time == null) {
      this.startTime = new Date();
    } else {
      this.startTime = time;
    }
    this.allNodes = [];
    for (let i = 0; i < rideIds.length; i++) {
      this.allNodes.push(new RideNode(rideIds[i]));
    }
    // if (startId == undefined || startId == null) {
    //  startId = "//replace_this_with_park_opening//";
    // }
    // this.startNode = new RideNode(startId, 0);
    // this.allNodes.unshift(this.startNode);
  }

  pathSearchBruteForceMeta() {
    let nodes = _.cloneDeep(this.allNodes);
    let allRoutesObj = { allRoutes: [] }; // misleading and from old code, actually just stores shortest path in allRoutesObj.allRoutes[0]
    let route = [];
    this.pathSearchBruteForce(route, nodes, allRoutesObj);
    console.log(allRoutesObj.allRoutes[0].route);
    return allRoutesObj.allRoutes[0].route;
  }

  pathSearchBruteForce(r, citiesNotInRoute, allRoutesObj) {
    if (!citiesNotInRoute.length == 0) {
      for (let i = 0; i < citiesNotInRoute.length; i++) {
        let justRemoved = citiesNotInRoute.shift();
        let newRoute = _.cloneDeep(r);
        newRoute.push(justRemoved);

        this.pathSearchBruteForce(newRoute, citiesNotInRoute, allRoutesObj);
        citiesNotInRoute.push(justRemoved);
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
          prev = "//replace_this_with_park_opening//";
        }
        let distance = r[i].getDistance(time.toISOString(), prev);
        r[i].tentativeDistance = distance;
        r[i].tentativeTime = time.toISOString();
        length += distance;
        time = add(time, { minutes: distance });
      }
      routeObj.length = length;
      if (allRoutesObj.allRoutes.length == 0) {
        allRoutesObj.allRoutes.push(routeObj);
      } else if (allRoutesObj.allRoutes[0].length > routeObj.length) {
        allRoutesObj.allRoutes[0] = routeObj;
      }
    }
  }

  pathSearchBubble(iterations) {
    let nodes = _.cloneDeep(this.allNodes);
    let startTime = new Date(this.startTime);
    for (let i = 0; i < nodes.length; i++) {
      let prev = nodes[i - 1];
      if (i == 0) {
        prev = "//replace_this_with_park_opening//";
      }
      // console.log(startTime);
      let distance = nodes[i].getDistance(startTime.toISOString(), prev);
      nodes[i].tentativeDistance = distance;
      nodes[i].tentativeTime = startTime.toISOString();
      startTime = add(startTime, { minutes: distance });
    }
    for (let n = 0; n < iterations; n++) {
      // console.log("iteration: " + (n + 1));
      for (let i = 0; i < nodes.length; i++) {
        let bestSwitch = {
          index: i,
          value: 0,
          currentNew: nodes[i].tentativeDistance,
          otherNew: nodes[i].tentativeDistance,
          currentNewTime: nodes[i].tentativeTime, 
          otherNewTime: nodes[i].tentativeTime,
        };
        for (let j = 0; j < nodes.length; j++) {
          // iterate thru swaps, check each swap by finding the total each time, select best swap from there, recalculate all orders (or reassign nodes to a temp obj with all of the swaps in place)

          /* // more code that does the wrong thing
          let currentNewTime = nodes[j].tentativeTime;
          let currentNew = nodes[i].getDistance(currentNewTime, nodes[i - 1]);
          let otherNewTime = nodes[i].tentativeTime;
          let otherNew = nodes[j].getDistance(otherNewTime, nodes[j - 1]);
          // console.log("c " + currentNewTime + " " + currentNew);
          // console.log("o " + otherNewTime + " " + otherNew);
          let switchValue =
            nodes[i].tentativeDistance -
            currentNew -
            (otherNew - nodes[j].tentativeDistance);
          // console.log(switchValue);
          if (switchValue > bestSwitch.value) {
            bestSwitch.index = j;
            bestSwitch.value = switchValue;
            bestSwitch.currentNew = currentNew;
            bestSwitch.otherNew = otherNew;
            bestSwitch.currentNewTime = currentNewTime;
            bestSwitch.otherNewTime = otherNewTime;
          }
        //*/
        }
        nodes[i].tentativeDistance = bestSwitch.currentNew;
        nodes[i].tentativeTime = bestSwitch.currentNewTime;
        nodes[bestSwitch.index].tentativeDistance = bestSwitch.otherNew;
        nodes[bestSwitch.index].tentativeTime = bestSwitch.otherNewTime;
        let temp = nodes[i];
        nodes[i] = nodes[bestSwitch.index];
        nodes[bestSwitch.index] = temp;
      }
    }
    console.log(nodes);
    return nodes;
  }

  /* // really freaking bad code, gonna replace it
  findShortestPath() {
    let possiblePaths = [];
    let destinationNode;
    for (let n = 0; n < this.allNodes.length; n++) {
      let unvisitedSet = _.cloneDeep(this.allNodes);
      let allNodesCopy = _.cloneDeep(this.allNodes);
      let currentNodes = [];
      currentNodes.push(unvisitedSet[0]);
      let pathNodes = new Array(this.allNodes.length);
      for (let i = 0; i < pathNodes.length; i++) {
        pathNodes[i] = -1;
      }
      // pathNodes.push(unvisitedSet[0]);
      let currentTime = this.startTime;
      if (this.allNodes[n] != this.startNode) {
        destinationNode = this.allNodes[n];
        let isCompleted = false;
        while (!isCompleted) {
          let currentDistance = Number.MAX_SAFE_INTEGER;
          for (let i = 0; i < unvisitedSet.length; i++) {
            if (
              currentNodes[currentNodes.length - 1].rideId !=
              unvisitedSet[i].rideId
            ) {
              currentDistance = unvisitedSet[i].getDistance(
                currentTime.toISOString(),
                currentNodes[currentNodes.length - 1].rideId
              );
              unvisitedSet[i].tentativeDistance = Math.min(
                unvisitedSet[i].tentativeDistance,
                currentDistance
              );
              let allIndex = -1;
            for (let i = 0; i < this.allNodes.length; i++) {
              if (this.allNodes[i].rideId == currentNodes[currentNodes.length - 1].rideId) {
                allIndex = i;
                break;
              }
            }
              allNodesCopy[allIndex].tentativeDistance = Math.min(unvisitedSet[i.tentativeDistance, currentDistance]);
            }
          }
          unvisitedSet.splice(
            unvisitedSet.indexOf(currentNodes[currentNodes.length - 1]),
            1
          );
          if (
            currentNodes[currentNodes.length - 1].rideId ==
            destinationNode.rideId
          ) {
            let foundPath = [];
            let u;
            for (let i = 0; i < this.allNodes.length; i++) {
              if (this.allNodes[i].rideId == currentNodes[currentNodes.length - 1].rideId) {
                u = i;
                break;
              }
            }
            while (u != undefined) {
              foundPath.unshift(this.allNodes[u]);
              u = pathNodes[u];
            }
            foundPath.shift();
            possiblePaths.push(foundPath);
            isCompleted = true;
          } else {
            let index = 0;
            for (let i = 1; i < unvisitedSet.length; i++) {
              if (
                unvisitedSet[index].tentativeDistance >
                unvisitedSet[i].tentativeDistance
              ) {
                index = i;
              }
            }
            let allIndex = -1;
            for (let i = 0; i < this.allNodes.length; i++) {
              if (this.allNodes[i].rideId == currentNodes[currentNodes.length - 1].rideId) {
                allIndex = i;
                break;
              }
            }
            pathNodes[index] = allIndex;
            console.log(pathNodes[index]);
            currentNodes.push(unvisitedSet[index]);
            // pathNodes.push(unvisitedSet[index]);
            currentTime = add(currentTime, { minutes: currentDistance });
          }
        }
      }
    }
    console.log(possiblePaths);
    let index = 0;
    for (let i = 1; i < possiblePaths.length; i++) {
      let indexTotal = 0;
      let iTotal = 0;
      for (let j = 0; j < possiblePaths[index].length; j++) {
        indexTotal += possiblePaths[index][j].tentativeDistance;
      }
      for (let j = 0; j < possiblePaths[i].length; j++) {
        iTotal += possiblePaths[i][j].tentativeDistance;
      }
      if (indexTotal > iTotal) {
        index = i;
      }
    }
    console.log(possiblePaths[index]);
    return possiblePaths[index];
  }
  //*/
}
