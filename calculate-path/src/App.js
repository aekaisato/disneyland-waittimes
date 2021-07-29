import './App.css';
import { useState } from "react";
import dlNames from "./dl_names.json";
import caNames from "./ca_names.json";
import { PathSearch, getPath, getICal } from "./algorithm/path-search.js";
import { setHours, compareAsc, endOfToday } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function useForceUpdate() {
  const [value, setValue] = useState(0);
  if (value) {
    // worthless code just to get ride of no assigned value warnings
  }
  return () => setValue(value => value+1);
}

function App() {
  const [rideList, setRideList] = useState([]);
  const [currentPark, setCurrentParkObj] = useState(dlNames);
  const [currentParkStr, setCurrentParkStr] = useState("disneyland");
  const [currentRideSelection, setCurrentRideSelection] = useState(Object.keys(currentPark)[0]); 
  const [generatedCalendarStr, setGeneratedCalendarStr] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [useNow, setUseNow] = useState(false);

  const forceUpdate = useForceUpdate();

  const setCurrentPark = (parkStr) => {
    console.log(parkStr)
    setCurrentParkObj(parkStr.includes("california") ? caNames : dlNames);
    setCurrentParkStr(parkStr);
  }

  const addRideToList = (rideId) =>{
    let temp = rideList;
    temp.push(rideId);
    setRideList(temp);
    forceUpdate();
  }

  const generateCalendarFile = async (list) => {
    let date = setHours(currentDate, 8);
    if (useNow) {
      date = new Date();
    }
    let pathSearch = new PathSearch(list, currentPark, date);
    console.log("sorting...")
    let sorted = await pathSearch.pathSearchBubble();
    console.log("defining path...")
    let path = await getPath(sorted);
    console.log("generating calendar")
    let calendar = getICal(path);
    setGeneratedCalendarStr(calendar.toString());
  }

  return (
    <div className="App" style={{padding: 20}}>
      <h1 style={{fontSize: 18}}>the super stupid, rather pointless planning system for the disneyland resort</h1>
      <label>select the park: </label>
      <select value={currentParkStr} onChange={(event) => setCurrentPark(event.target.value)}>
        <option value="disneyland">disneyland</option>
        <option value="california adventure">california adventure</option>
      </select>
      <div>
        <label>pick a date (must be current date or prior for now :p): </label>
        <DatePicker selected={currentDate} onChange={(date) => {
          if (compareAsc(date, endOfToday()) <= 0) {
            setCurrentDate(date);
          }
        }} />
      </div>
        <label>ignore date and just use current date and time</label>
        <input type="checkbox" value={useNow} onChange={(event) => {
          setUseNow(event.target.value)
      }}></input>
      <form>
        <label>add ride to list: </label>
        <select onChange={(event) => setCurrentRideSelection(event.target.value)}>
          {Object.keys(currentPark).map((item) => (
            <option key={item} value={item}>{currentPark[item]}</option>
          ))}
        </select>
        <button type="button" onClick={() => addRideToList(currentRideSelection)}>add</button>
      </form>
      <div>
        <ul>
          {rideList.map((item) => (
            <li key={item} style={{innerWidth: "90%", display: "flex", flexDirection: "row", justifyContent: "space-around"}}>
              <p>{currentPark[item]}</p>
              <button type="button">remove</button>
            </li>
          ))}
        </ul>
      </div>
      <button style={{height: 80}} onClick={() => {
        if (rideList.length > 0) {
          generateCalendarFile(rideList)}
      }}
      >G E N E R A T E !</button>
      {(generatedCalendarStr.length > 0) ? (
        <div style={{flexDirection: "row", display: "flex", innerWidth: "90%", justifyContent: "space-around"}}>
          <p>generated ical file: </p>
          <button onClick={() => {
            const element = document.createElement("a");
            const file = new Blob([generatedCalendarStr], {type: "text/plain"}); // should i be using text/calendar??
            element.href = URL.createObjectURL(file);
            element.download = "generated calendar - " + currentParkStr + ".ics";
            document.body.appendChild(element);
            element.click();
          }}>download</button>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default App;
