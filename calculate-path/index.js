// import { RideNode } from "./src/rideNode";
import { PathSearch, getTimeOfPath } from "./src/path-search.js";

let pathSearch = new PathSearch(["test0", "test1", "test2", "test3", "test4", "test5", "test6", "test7", "test8", /* "test9", "test10" */], "disneyland", new Date());
// pathSearch.pathSearchBubble(0);
console.time("bruteForce");
let brute = pathSearch.pathSearchBruteForceMeta();
console.timeEnd("bruteForce");
console.time("bubble");
let bubble = pathSearch.pathSearchBubble();
console.timeEnd("bubble");

// let bruteT = 0;
// let bubbleT = 0;

// for (let i = 0; i < brute.length; i++) {
//   bruteT += brute[i].tentativeDistance;
//   bubbleT += bubble[i].tentativeDistance;
// }

console.log("brute force method: " + getTimeOfPath(brute));
console.log("bubble method: " + getTimeOfPath(bubble));
