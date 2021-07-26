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
	console.log(keys);
	let result = {};
	for (let i = 0; i < keys.length; i++) {
		if (keys[i] > startTime && keys[i] < endTime) {
			let obj = parkObj[keys[i]];
			console.log(keys[i]);
			for (let j = 0; j < Object.keys(obj).length; j++) {
				if (id == obj[j].id) {
					result[keys[i]] = obj[j];
				}
			}
		}	
	}
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.json(result);
}
