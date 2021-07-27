import React, { useEffect, useState } from "react";
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
  const [rideArray, setRideArray] = useState([]);
  useEffect(
    () => createRideArray(parkSelection, rideSelection, startDate),
    [parkSelection, rideSelection, startDate]
  );

  async function createRideArray(parkStr, id, selectedDate) {
    let startTime = startOfDay(selectedDate);
    let endTime = add(startOfDay(selectedDate), { days: 1 });

    let url =
      "https://disneyland-waittimes-api.vercel.app/api/get-rideOverInterval";
    url +=
      "?park=" + (parkStr.includes("california") ? "california" : "disneyland");
    url += "&id=" + id;
    url += "&startTime=" + startTime.toISOString();
    url += "&endTime=" + endTime.toISOString();
    let parkObj = await (await fetch(url)).json();

    if (selectedDate === undefined || selectedDate === null) {
      selectedDate = new Date();
    }
    let arr = [];
    const keys = Object.keys(parkObj);
    for (let keyIndex in keys) {
      let date = parseISO(keys[keyIndex]);
      let x = date.getHours() + ":" + date.getMinutes();
      x = keys[keyIndex];
      let y = parkObj[keys[keyIndex]].waitTime;
      arr.push({ x, y });
    }
    console.log(arr);
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i].y > 0) {
        break;
      } else {
        arr.splice(i, 1);
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
    setRideArray(arr);
    return arr;
  }

  // let parkObj;
  let rideOptions;
  if (parkSelection === "california adventure") {
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
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-evenly",
          width: "100%",
        }}
      >
        <div>
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date);
              // createRideArray(parkSelection, rideSelection, date);
            }}
          />
        </div>
        <select
          value={parkSelection}
          onChange={(event) => {
            setParkSelection(event.target.value);
            let parkObj = event.target.value
              .toLowerCase()
              .includes("california")
              ? california
              : disneyland;
            let rideId = parkObj[Object.keys(parkObj)[0]][0].id;
            setRideSelection(rideId);
            // createRideArray(event.target.value, rideId, startDate);
          }}
        >
          <option value="disneyland">Disneyland</option>
          <option value="california adventure">California Adventure</option>
        </select>
        <select
          value={rideSelection}
          onChange={(event) => {
            setRideSelection(event.target.value);
            // createRideArray(parkSelection, event.target.value, startDate);
          }}
        >
          {rideOptions}
        </select>
      </div>
      <div style={{ height: "90vh" }}>
        <VictoryChart>
          <VictoryAxis
            tickCount={rideArray.length / 3}
            style={{ tickLabels: { fontSize: 8 } }}
            tickLabelComponent={
              <VictoryLabel
                angle={-45}
                text={({ datum }) => {
                  datum = rideArray[datum - 1];
                  if (datum === undefined || datum === null) {
                    return "";
                  }
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
            data={rideArray}
            // interpolation="natural"
          />
        </VictoryChart>
      </div>
    </div>
  );
}

export default App;
