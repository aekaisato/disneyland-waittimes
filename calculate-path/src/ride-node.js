import { parseISO } from "date-fns";

export class RideNode {
  rideId;
  tentativeDistance;

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
    return 0;
  }

  getEstimatedWaitTime(dateTimeISO) {
    return parseISO(dateTimeISO).getMinutes();
  }

  getRideLength() {
    return 0;
  }
}