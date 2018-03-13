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

export const setGPSStauts = (status) => {
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

export const reduxState = () => {
  return (dispatch, getState) => {
    const { counter } = getState();

    if (counter % 2 === 0) {
      return;
    }

    dispatch(increment());
  };
}
