//import state from './state';
const initialState = {
  count: 0,
  gpsTrackerOn: false,
  gpsTimerInterval: 15*60*1000, // save in constants.js
  gpsStatus: 'Not found',
  lastGpsPosition: null, // position.timestamp, position.coords.latitude, longitude, altitude, accuracy
  selectedLanguage: "en"
};

// REDUCERS
export default (state = initialState, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + 1
      };
    case 'DECREMENT':
      return {
        ...state,
        count: state.count - 1
      };
    case 'RESET':
      return {
        ...state,
        count: 0
      };
    case 'TRACK_GPS':
      return {
        ...state,
        gpsTrackerOn: true,
        gpsStatus: 'Searching'
      }
    case 'TURN_ON_GPS':
      return {
        ...state,
        gpsTrackerOn: true
      }
    case 'TURN_OFF_GPS':
      return {
        ...state,
        gpsTrackerOn: false
      }
    case 'TOGGLE_GPS':
      return {
        ...state,
        gpsTrackerOn: !state.gpsTrackerOn
      }
    case 'SET_GPS_STATUS':
      return {
        ...state,
        gpsStatus: action.payload
      }
    case 'CHANGE_LANGUAGE':
      return {
        ...state,
        selectedLanguage: action.payload
      }
    default:
      return state;
    }
}
