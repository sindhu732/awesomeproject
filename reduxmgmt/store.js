import { combineReducers, createStore } from 'redux';

//import state from './state';

const initialState = {
  count: 0
}

// REDUCERS
export const counter = (state = initialState, action) => {
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
    default:
      return state;
    }
}

export const followsReducer = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
}

const reducer = combineReducers({ counter, followsReducer });
let store = createStore(reducer);

export default store;
