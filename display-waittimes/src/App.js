import React, { useState } from "react";
import { VictoryAxis, VictoryChart, VictoryLine, VictoryLabel } from "victory";
import "./App.css";
import disneyland from "./waittimes/dl";
import california from "./waittimes/ca";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseISO, add, startOfDay } from "date-fns";
// import { toDate, format, zonedTimeToUtc } from "date-fns-tz";

// const Themeparks = require("themeparks");
// const Disneyland = new Themeparks.Parks.DisneylandResortMagicKingdom();
// const CaliforniaAdventure =
//  new Themeparks.Parks.DisneylandResortCaliforniaAdventure();

function App() {
  const [startDate, setStartDate] = useState(new Date());
  const [parkSelection, setParkSelection] = useState("disneyland");
  const [rideSelection, setRideSelection] = useState(
    disneyland[Object.keys(disneyland)[0]][0].id
  );

  function createRideArray(parkStr, id, selectedDate) {
    let startTime = startOfDay(selectedDate);
    let endTime = add(startOfDay(selectedDate), { days: 1 });

    let parkObj;
    // let operating;
    if (parkStr == "california adventure") {
      parkObj = california;
      // operating = await CaliforniaAdventure.GetOpeningTimes();
    } else {
      parkObj = disneyland;
      // operating = await Disneyland.GetOpeningTimes();
    }
    // console.log(operating);

    if (selectedDate == undefined || selectedDate == null) {
      selectedDate = new Date();
    }
    console.log(id);
    let arr = [];
    const keys = Object.keys(parkObj);
    for (let keyIndex in keys) {
      let key = keys[keyIndex];
      let objIndex = Object.keys(parkObj[key]).find(
        (k) => parkObj[key][k].id == id
      );
      if (objIndex == undefined) {
        return [];
      }
      let date = parseISO(key);
      let x = date.getHours() + ":" + date.getMinutes();
      x = key;
      let y = parkObj[key][objIndex].waitTime;
      // console.log(y);
      arr.push({ x, y });
    }

    // console.log(selectedDate);
    // console.log(selectedDate.toISOString())

    // let startTimeStr = zonedTimeToUtc(
    //   startTime,
    //   "America/Los_Angeles"
    // ).toISOString();
    // let endTimeStr = zonedTimeToUtc(
    //   endTime,
    //   "America/Los_Angeles"
    // ).toISOString();

    let startTimeStr = startTime.toISOString();
    let endTimeStr = endTime.toISOString();

    let foundLastZero = false;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i].x > endTimeStr || arr[i].x < startTimeStr) {
        arr.splice(i, 1);
      } else if (!foundLastZero && arr[i].y == 0) {
        arr.splice(i, 1);
      } else {
        foundLastZero = true;
      }
    }

    for (let i = 0; i < arr.length; i++) {
      if (arr[i].y > 0) {
        break;
      } else {
        arr.splice(i, 1);
        i--;
      }
    }

    console.log(arr);
    return arr;
  }

  // let parkObj;
  let rideOptions;
  if (parkSelection == "california adventure") {
    // parkObj = california;
    rideOptions = Object.keys(california[Object.keys(disneyland)[0]]).map(
      (item, index) => {
        return (
          <option
            key={california[Object.keys(california)[0]][item].id}
            value={california[Object.keys(california)[0]][item].id}
          >
            {california[Object.keys(california)[0]][item].name}
          </option>
        );
      }
    );
  } else {
    // parkObj = disneyland;
    rideOptions = Object.keys(disneyland[Object.keys(disneyland)[0]]).map(
      (item, index) => {
        return (
          <option
            value={disneyland[Object.keys(disneyland)[0]][item].id}
            key={disneyland[Object.keys(disneyland)[0]][item].id}
          >
            {disneyland[Object.keys(disneyland)[0]][item].name}
          </option>
        );
      }
    );
  }

  return (
    <div className="App" style={{ padding: 20 }}>
      <div
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-evenly",
          width: "100%",
        }}
      >
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
        />
        <select
          value={parkSelection}
          onChange={(event) => {
            setParkSelection(event.target.value);
            setRideSelection(0);
          }}
        >
          <option value="disneyland">disneyland</option>
          <option value="california adventure">california adventure</option>
        </select>
        <select
          value={rideSelection}
          onChange={(event) => {
            setRideSelection(event.target.value);
          }}
        >
          {rideOptions}
        </select>
      </div>
      <VictoryChart>
        <VictoryAxis
          tickCount={
            createRideArray(parkSelection, rideSelection, startDate).length / 3
          }
          style={{ tickLabels: { fontSize: 8 } }}
          tickLabelComponent={
            <VictoryLabel
              angle={-45}
              text={({ datum }) => {
                console.log(datum);
                datum = createRideArray(
                  parkSelection,
                  rideSelection,
                  startDate
                )[datum - 1];
                let temp = parseISO(datum.x);
                let temp2 =
                  temp.getHours() +
                  ":" +
                  (Math.round(temp.getMinutes() / 10) * 10)
                    .toString()
                    .padStart(2, "0");
                return temp2;
              }}
            />
          }
        />
        <VictoryAxis dependentAxis />
        <VictoryLine
          data={createRideArray(parkSelection, rideSelection, startDate)}
          // interpolation="natural"
        />
      </VictoryChart>
    </div>
  );
}

export default App;
