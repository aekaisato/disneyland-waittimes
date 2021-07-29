// import { RideNode } from "./src/rideNode";
import { PathSearch, getTimeOfPath, getPath, getICal } from "./src/algorithm/path-search.js";
import { startOfDay, setHours, sub } from "date-fns";
import fs from "fs";

// let pathSearch = new PathSearch(["test0", "test1", "test2", "test3", "test4", "test5", "test6", "test7", "test8", /* "test9", "test10" */], "disneyland", new Date());
let pathSearch = new PathSearch(
  [
    "DisneylandResortMagicKingdom_353377",
    "DisneylandResortMagicKingdom_353405",
    "DisneylandResortMagicKingdom_353435",
    "DisneylandResortMagicKingdom_353389",
  ],
  "disneyland",
  sub(setHours(new Date(), 8), {days: 1})
);

// pathSearch.pathSearchBubble(0);
// console.time("bruteForce");
// let brute = pathSearch.pathSearchBruteForceMeta();
// console.timeEnd("bruteForce");
console.time("bubble");
let bubble = await pathSearch.pathSearchBubble();
console.timeEnd("bubble");

// let bruteT = 0;
// let bubbleT = 0;

// for (let i = 0; i < brute.length; i++) {
//   bruteT += brute[i].tentativeDistance;
//   bubbleT += bubble[i].tentativeDistance;
// }

// console.log("brute force method: " + getTimeOfPath(brute));
fs.writeFileSync("./bubble_test.json", JSON.stringify(bubble));
console.log("bubble method: " + await getTimeOfPath(bubble, sub(setHours(new Date(), 8), {days: 1})));
let bubbleObj = await getPath(bubble);
console.log();
fs.writeFileSync("./bubble_test_f.json", JSON.stringify(bubbleObj));
let bubbleCalendar = getICal(bubbleObj);
fs.writeFileSync("./bubble_test_c.ics", bubbleCalendar.toString())
