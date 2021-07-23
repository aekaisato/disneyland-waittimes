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
  let times = Object.keys(parkObj);
  for (let i = 0; i < times.length; i++) {
    times[i] = parseISO(times[i]);
  }
  let closestTime = closestTo(parseISO(time), times);
  let result = parkObj[closestTime.toISOString()][id]

  res.json({
    ...result
  })
}
