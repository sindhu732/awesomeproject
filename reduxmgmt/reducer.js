//import state from './state';
const initialState = {
  count: 0,
  gpsTrackerOn: false,
  gpsTimerInterval: 15*60*1000,
  gpsStatus: '',
  lastGpsPosition: null, // position.timestamp, position.coords.latitude, longitude, altitude, accuracy
  gpsTimerId: null,
  gpsTrialNumber: 0,
  selectedLanguage: "en",
  localizedStrings: null,
  enStrings: null,
  swStrings: null
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
        gpsTrackerOn: true
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
    case 'INCREMENT_GPS_TRIAL_NUMBER':
      return {
        ...state,
        gpsTrialNumber: state.gpsTrialNumber + 1
      }
    case 'RESET_GPS_TRIAL_NUMBER':
      return {
        ...state,
        gpsTrialNumber: 0
      }
    case 'CHANGE_LANGUAGE':
      return {
        ...state,
        selectedLanguage: action.payload
      }
    case 'LOAD_LOCALIZED_STRINGS':
      return {
        ...state,
        localizedStrings: action.payload
      }
    case 'LOAD_ENGLISH_STRINGS':
      return {
        ...state,
        enStrings: action.payload
      }
    case 'LOAD_SWAHILI_STRINGS':
      return {
        ...state,
        swStrings: action.payload
      }

    default:
      return state;
    }
}
