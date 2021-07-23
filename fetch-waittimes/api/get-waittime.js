import { parseISO, closestTo } from "date-fns";

const dl = "../waittimes/dl.json";
const ca = "../waittimes/ca.json";

module.exports = (req, res) => {
  const { id, time, park } = req.query;
  let parkObj;
  if (park.includes("california")) {
    parkObj = ca;
  } else {
    parkObj = dl;
  }
  let timesISO = Object.keys(parkObj);
  let times = [];
  for (let i = 0; i < timesISO.length; i++) {
    times.push(parseISO(timesISO[i]));
  }
  let closestTime = closestTo(parseISO(time), times);
  let result = parkObj[closestTime.toISOString()][id]

  res.json({
    ...result
  })
}
