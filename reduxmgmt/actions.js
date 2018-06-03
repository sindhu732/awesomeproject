import store from '../App';
import LocalizedStrings from 'react-native-localization';

export const increment = () => {
  return {
    type: 'INCREMENT'
  };
};

export const decrement = () => {
  return {
    type: 'DECREMENT'
  }
};

export const reset = () => {
  return {
    type: 'RESET'
  }
};

export const setIntervalId = (id) => {
  return {
    type: 'SET_INTERVAL_ID',
    payload: id
  }
};

export const setWatchId = (id) => {
  return {
    type: 'SET_WATCH_ID',
    payload: id
  }
};

export const trackGps = () => {
  return {
    type: 'TRACK_GPS'
  }
};

export const turnOnGPS = () => {
  return {
    type: 'TURN_ON_GPS'
  }
};

export const turnOffGPS = () => {
  return {
    type: 'TURN_OFF_GPS'
  }
};

export const toggleGPS = () => {
  return {
    type: 'TOGGLE_GPS'
  }
};

export const incrementGpsTrialNumber = () => {
  return {
    type: 'INCREMENT_GPS_TRIAL_NUMBER'
  }
};

export const resetGpsTrialNumber = () => {
  return {
    type: 'RESET_GPS_TRIAL_NUMBER'
  }
};

export const setGPSStatus = (status) => {
  return {
    type: 'SET_GPS_STATUS',
    payload: status
  }
};

export const setGpsTimerId = (id) => {
  return {
    type: 'SET_GPS_TIMER_ID',
    payload: id
  }
};

export const changeLanguage = (language) => {
  if (language == "en") {
    return {
      type: 'CHANGE_LANGUAGE_ENGLISH',
      payload: language
    }
  } else if (language == "sw") {
    return {
      type: 'CHANGE_LANGUAGE_SWAHILI',
      payload: language
    }
  }

};

export const loadLocalizedStrings = (enStrings, swStrings) => {

  let localizedStrings = new LocalizedStrings({'en': enStrings, 'sw': enStrings});

  return {
    type: 'LOAD_LOCALIZED_STRINGS',
    localizedStrings: localizedStrings,
    enStrings: enStrings,
    swStrings: swStrings
  }
};

export const loadEnglishStrings = (strings) => {
  return {
    type: 'LOAD_ENGLISH_STRINGS',
    payload: strings
  }
};

export const loadSwahiliStrings = (strings) => {
  return {
    type: 'LOAD_SWAHILI_STRINGS',
    payload: strings
  }
};

export const reloadFollowArrivalsObject = (bool) => {
  return {
    type: 'RELOAD_FOLLOW_ARRIVALS_OBJECT',
    payload: bool
  }
};

// export const deletedFollowArrivals = (chimp) => {
//   return {
//     type: 'DELETED_FOLLOW_ARRIVALS',
//     payload: chimp
//   }
// };

export const reduxState = () => {
  return (dispatch, getState) => {
    const { counter } = getState();

    if (counter % 2 === 0) {
      return;
    }

    dispatch(increment());
  };
}

// export const restartTimer = () => {
//   return (dispatch, getState) => {
//     dispatch(getGPSnow(this.state.currentFollowTime));
//
//     intervalId = BackgroundTimer.setInterval(() => {
//         const followTimeIndex = this.props.screenProps.times.indexOf(this.state.currentFollowTime);
//         const nextFollowTime = followTimeIndex !== this.props.screenProps.times.length - 1 ? this.props.screenProps.times[followTimeIndex + 1] : null;
//         this.setState({currentFollowTime: nextFollowTime});
//         this.getGPSnow(nextFollowTime);
//       }, this.props.gpsTimerInterval);
//   }
// }
