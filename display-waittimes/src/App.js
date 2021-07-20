import React, { useState } from "react";
import ReactDOM from "react-dom";
// import * as V from 'victory';
import { VictoryChart, VictoryLine } from "victory";
import logo from "./logo.svg";
import "./App.css";
import disneyland from "./waittimes/dl";
import california from "./waittimes/ca";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function App() {
  const [startDate, setStartDate] = useState(new Date());
  const [parkSelection, setParkSelection] = useState("disneyland");
  const [rideSelection, setRideSelection] = useState(
    disneyland[Object.keys(disneyland)[0]][0].id
  );

  function createRideArray(parkObj, id) {
    console.log(id);
    let arr = [];
    const keys = Object.keys(parkObj);
    for (let keyIndex in keys) {
      let x = keys[keyIndex];
      let objIndex = Object.keys(parkObj[x]).find(
        (k) => parkObj[x][k].id == id
      );
      if (objIndex == undefined) {
        return [];
      }
      let y = parkObj[x][objIndex].waitTime;
      // console.log(y);
      arr.push({ x, y });
    }
    // console.log(arr);
    return arr;
  }

  let parkObj;
  let rideOptions;
  if (parkSelection == "california adventure") {
    parkObj = california;
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
    parkObj = disneyland;
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
        <VictoryLine data={createRideArray(parkObj, rideSelection)} />
      </VictoryChart>
    </div>
  );
}

export default App;
