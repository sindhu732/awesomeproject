import Realm from 'realm';

let Chimp = {
  name: 'Chimp',
  properties: {
    'name': 'string',
    'sex': 'string'
  }
}

let ValuePairObjectSchema = {
    name: 'ValuePairObject',
    properties: {
      dbValue: 'string',
      userValue: 'string'
    }
};

class Follow {}
Follow.className = 'Follow';
Follow.schema = {
  name: Follow.className,
  primaryKey: 'id',
  properties: {
    id: 'string',
    date: 'date',
    focalId: 'string',
    community: 'string',
    startTime: 'string',
    endTime: {type: 'string', optional: true},
    day: 'int',
    month: 'int',
    year: 'int',
    chimps: {type: 'list', objectType: 'Chimp'},
    food: {type: 'list', objectType: 'ValuePairObject'},
    foodParts: {type: 'list', objectType: 'ValuePairObject'},
    species: {type: 'list', objectType: 'ValuePairObject'},
    isBeginInNest: {type: 'bool', optional: true},
    isEndInNest: {type: 'bool', optional: true},
    duration: {type: 'int', optional: true},
    distance_traveled: {type: 'int', optional: true},
    amObserver1: 'string',
    amObserver2: {type: 'string', optional: true},
    pmObserver1: {type: 'string', optional: true},
    pmObserver2: {type: 'string', optional: true},
    gpsIntervalId: {type: 'int', optional: true},
    gpsFirstTimeoutId: {type: 'int', optional: true}
  }
};

class FollowArrival {}
FollowArrival.className = 'FollowArrival';
FollowArrival.schema = {
  name: FollowArrival.className,
  primaryKey: 'id',
  properties: {
    id: 'string',
    followId: 'string',
    date: 'date',
    followStartTime: 'string',
    focalId: 'string',
    chimpId: 'string',
    time: {type: 'string', optional: true},
    duration: {type: 'int', optional: true},
    certainty: 'int',
    estrus: 'int',
    isNearestNeighbor: 'bool',
    isWithin5m: 'bool',
    grooming: 'string'
  }
};

class Species {}
Species.className = 'Species';
Species.schema = {
  name: Species.className,
  primaryKey: 'id',
  properties: {
    id: 'int',
    followId: 'string',
    date: 'date',
    startTime: 'string',
    endTime: 'string',
    focalId: 'string',
    speciesName: 'string',
    speciesCount: 'int',
    startInterval: 'int',
    endInterval: 'int'
  }
};

class Food {}
Food.className = 'Food';
Food.schema = {
  name: Food.className,
  primaryKey: 'id',
  properties: {
    id: 'int',
    followId: 'string',
    date: 'date',
    startTime: 'string',
    endTime: 'string',
    focalId: 'string',
    foodName: 'string',
    foodPart: 'string',
    startInterval: 'int',
    endInterval: 'int'
  }
};

class Location {}
Location.className = 'Location';
Location.schema = {
  name: Location.className,
  properties: {
    followId: 'string',
    date: 'date',
    focalId: 'string',
    followStartTime: 'string',
    timestamp: 'int',
    longitude: 'float',
    latitude: 'float',
    altitude: 'float',
    accuracy: 'float',
    community: 'string'
  }
}

export default new Realm({
  schema: [Follow, FollowArrival, Species, Food, Location, Chimp, ValuePairObjectSchema], schemaVersion: 4
});
