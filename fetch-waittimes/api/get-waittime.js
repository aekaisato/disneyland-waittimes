import { parseISO, closestTo } from "date-fns";

const dl = require("../waittimes/dl.json");
const ca = require("../waittimes/ca.json");

module.exports = (req, res) => {
  console.log("query");
  console.log(req.query);
  const { id, time, park } = req.query;
  let parkObj;
  if (park.includes("california")) {
    console.log("using california adventure");
    parkObj = ca;
  } else {
    console.log("using disneyland");
    parkObj = dl;
  }
  // console.log("park obj (sorry)");
  // console.log(parkObj);
  let timesISO = Object.keys(parkObj);
  console.log("time keys");
  console.log(timesISO);
  let times = [];
  for (let i = 0; i < timesISO.length; i++) {
    times.push(parseISO(timesISO[i]));
  }
  console.log("times from keys");
  console.log(times);
  let parsedTime = parseISO(time);
  console.log("parsed time");
  console.log(parsedTime);
  let closestTime = closestTo(parsedTime, times);
  console.log("closest time");
  console.log(closestTime);
  let result = parkObj[closestTime.toISOString()][id]
  console.log("result");
  console.log(result);

  res.json({
    ...result
  })
}
