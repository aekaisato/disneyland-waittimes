import { parse, parseISO } from "date-fns";

export class RideNode {
  rideId;
  tentativeDistance;
  tentativeTime;

  constructor(rideId, tentativeDistance)
  {
    if (tentativeDistance == undefined || tentativeDistance == null)
    {
      this.tentativeDistance = Number.MAX_SAFE_INTEGER;
    } else {
      this.tentativeDistance = tentativeDistance;
    }
    this.rideId = rideId;
    // this.isVisited = false;
  }

  getDistance(dateTimeISO, otherRideId) {
    let distance = this.getWalkingTime(otherRideId) + this.getEstimatedWaitTime(dateTimeISO) + this.getRideLength();
    return distance;
  }

  getWalkingTime(otherRideId) {
    return 0 // Math.random() * 5;
  }

  getEstimatedWaitTime(dateTimeISO) {
    let temp = ( 1 / (Number.parseInt(this.rideId.substring(this.rideId.length - 1)) + 1)) ;
    // console.log(temp)
    temp = temp * (60 * parseISO(dateTimeISO).getHours()) + parseISO(dateTimeISO).getMinutes();
    return Math.floor(temp);
  }

  getRideLength() {
    return 0 // Math.random() * 10;
  }
}