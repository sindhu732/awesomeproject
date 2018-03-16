import store from '../App';

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

export const setGPSStatus = (status) => {
  return {
    type: 'SET_GPS_STATUS',
    payload: status
  }
};

export const changeLanguage = (language) => {
  return {
    type: 'CHANGE_LANGUAGE',
    payload: language
  }
};

export const loadLocalizedStrings = (strings) => {
  return {
    type: 'LOAD_LOCALIZED_STRINGS',
    payload: strings
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

export const reduxState = () => {
  return (dispatch, getState) => {
    const { counter } = getState();

    if (counter % 2 === 0) {
      return;
    }

    dispatch(increment());
  };
}
