const dl = require("../waittimes/dl.json");
const ca = require("../waittimes/ca.json");

module.exports = (req, res) => {
	const { park, id, startTime, endTime } = req.query;
	let parkObj;
	if (park.includes("california")) {
		parkObj = ca;	
	} else {
		parkObj = dl;
	}
	const keys = Object.keys(parkObj);
	let result = {};
	for (let i = 0; i < keys.length; i++) {
		if (keys[i] > startTime && keys[i] < endTime) {
			result[keys[i]] = parkObj[keys[i]];
		}
	}
	res.json(result);
}
