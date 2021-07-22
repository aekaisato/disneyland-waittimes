// import { RideNode } from "./src/rideNode";
import { PathSearch } from "./src/path-search.js";

let pathSearch = new PathSearch(["test1", "test2", "test3"], "disneyland", new Date(), "test0");
pathSearch.findShortestPath();