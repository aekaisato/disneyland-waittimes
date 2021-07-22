import { RideNode } from "./ride-node.js";
import _ from "lodash";
import { add } from "date-fns";

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
    if (startId == undefined || startId == null) {
      startId = "//replace_this_with_park_opening//";
    }
    this.startNode = new RideNode(startId, 0);
    this.allNodes.unshift(this.startNode);
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
