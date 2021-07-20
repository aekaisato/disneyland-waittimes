const fs = require('fs');
const Themeparks = require("themeparks");
const Disneyland = new Themeparks.Parks.DisneylandResortMagicKingdom();
const CaliforniaAdventure = new Themeparks.Parks.DisneylandResortCaliforniaAdventure();
let dlObj = {};
let caObj = {};
const startTime = new Date().toISOString();
const dlFileName = "disneyland_waittimes_" + startTime;
const caFileName = "californiaadventure_waittimes_" + startTime;

async function checkWaitTimes()
{
  const time = new Date().toISOString();
  let rideTimesDL = await Disneyland.GetWaitTimes();
  let rideTImesCA = await CaliforniaAdventure.GetWaitTimes();
  console.log(rideTimesDL);
  console.log(rideTImesCA);
  dlObj = {...dlObj, [time]: {...rideTimesDL}};
  caObj = {...caObj, [time]: {...rideTImesCA}};
  if (!fs.existsSync('./waittimes'))
  {
    fs.mkdirSync('./waittimes');
  }
  fs.writeFileSync('./waittimes/' + dlFileName + '.json', JSON.stringify(dlObj));
  fs.writeFileSync('./waittimes/' + caFileName + '.json', JSON.stringify(caObj));
}

checkWaitTimes();
setInterval(function() { checkWaitTimes() }, 600000);
