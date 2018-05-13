//import state from './state';
import LocalizedStrings from 'react-native-localization';
import defaultStrings from '../data/strings';

const initialState = {
  count: 0,
  gpsTrackerOn: false,
  gpsTimerInterval: 15*60*1000,
  gpsStatus: '',
  lastGpsPosition: null, // position.timestamp, position.coords.latitude, longitude, altitude, accuracy
  gpsTimerId: null,
  gpsTrialNumber: 0,
  gpsCurrentFollowTime: "",
  selectedLanguage: "en",
  localizedStrings: new LocalizedStrings(defaultStrings),
  enStrings: defaultStrings.en,
  swStrings: defaultStrings.sw,
  selectedLanguageStrings: defaultStrings.en,
  reloadFollowArrivalsObject: false
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
    case 'CHANGE_LANGUAGE_ENGLISH':
      return {
        ...state,
        selectedLanguage: action.payload,
        selectedLanguageStrings: state.enStrings
      }
    case 'CHANGE_LANGUAGE_SWAHILI':
      return {
        ...state,
        selectedLanguage: action.payload,
        selectedLanguageStrings: state.swStrings
      }
    case 'LOAD_LOCALIZED_STRINGS':
      return {
        ...state,
        localizedStrings: action.localizedStrings,
        enStrings: action.enStrings,
        swStrings: action.swStrings
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
    case 'RELOAD_FOLLOW_ARRIVALS_OBJECT':
      return {
        ...state,
        reloadFollowArrivalsObject: action.payload
      }

    default:
      return state;
    }
}
