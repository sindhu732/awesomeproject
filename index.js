import React, { Component } from 'react';
import {
  AsyncStorage,
  AppRegistry,
  StyleSheet,
} from 'react-native';
import { Provider } from 'react-redux';
import { connect } from 'react-redux';
import store from './reduxmgmt/store.js';

import deviceLog, {LogView, InMemoryAdapter} from 'react-native-device-log';

import { StackNavigator } from 'react-navigation';

import LocalizedStrings from 'react-native-localization';
import assert from 'assert';
import _ from 'lodash';
import RNFS from 'react-native-fs';

import ExportDataScreen from './components/ExportDataScreen/ExportDataScreen';
import FollowListScreen from './components/FollowListScreen/FollowListScreen';
import FollowScreen from './components/FollowScreen/FollowScreen';
import GPSTestScreen from './components/GPSTestScreen';
import MenuScreen from './components/MenuScreen/MenuScreen';
import NewFollowScreen from './components/NewFollowScreen/NewFollowScreen';
import SettingsScreen from './components/SettingsScreen/SettingsScreen';
import SummaryScreen from './components/SummaryScreen/SummaryScreen';

import times from './data/time-list.json';
import defaultChimps from './data/chimp-list.json';
import defaultFood from './data/food-list.json';
import defaultFoodParts from './data/food-part-list.json';
import defaultSpecies from './data/species-list.json';
import speciesNumbers from './data/species-number-list.json';
import defaultStrings from './data/strings';

const defaultLanguage = 'en';

deviceLog.init(AsyncStorage, {
  //Options (all optional):
  logToConsole : false, //Send logs to console as well as device-log
  logRNErrors : true, // Will pick up RN-errors and send them to the device log
}).then(() => {
  //When the deviceLog has been initialized we can clear it if we want to:
  deviceLog.clear();
});
//The device-log contains a timer for measuring performance:
deviceLog.startTimer('start-up');

export default class JGIDigiTiki extends Component {

  constructor(props) {
    super(props);

    this.state = {
      language: defaultLanguage,
      localizedStrings: new LocalizedStrings(defaultStrings),
      enStrings: defaultStrings.en,
      swStrings: defaultStrings.sw,
      chimps: defaultChimps,
      food: defaultFood,
      foodParts: defaultFoodParts,
      species: defaultSpecies,
      speciesNumbers: speciesNumbers,
      times: times
    };

    this._loadCustomData('chimp-list.json', 'chimps');
    this._loadCustomData('food-list.json', 'food');
    this._loadCustomData('species-list.json', 'species');
    this._loadCustomData('species-number.json', 'species');
    this._loadCustomData('food-part-list.json', 'foodParts');
  }

  componentWillMount() {
    this._loadLocalizedStrings();
    this._loadDefaultLanguage();
  }

  async _updateLocalizedString(language, key, newString) {
    await AsyncStorage.setItem(`@JGIDigiTiki:strings_${language}_${key}`, newString);
    this._loadLocalizedStrings();
  }

  async _loadDefaultLanguage() {
    try {
      const language = await AsyncStorage.getItem('@JGIDigiTiki:language');
      if (language !== null) {
        this._setLanguage(language);
        return;
      }
      await AsyncStorage.setItem('@JGIDigiTiki:language', defaultLanguage);
      this._setLanguage(defaultLanguage);
    } catch(error) {
      console.error(error);
    }
  }

  async _loadLocalizedStrings() {
    try {
      let enStrings = {};
      for (const key in defaultStrings.en) {
        const storageKey = `@JGIDigiTiki:strings_en_${key}`;
        let enString = await  AsyncStorage.getItem(storageKey);
        if (enString === null) {
          enString = defaultStrings.en[key]
          await AsyncStorage.setItem(storageKey, enString);
        }
        enStrings[key] = enString;
      }
      assert(Object.keys(enStrings).length === Object.keys(defaultStrings.en).length);

      let swStrings = {};
      for (const key in defaultStrings.sw) {
        const storageKey = `@JGIDigiTiki:strings_sw_${key}`;
        let swString = await  AsyncStorage.getItem(storageKey);
        if (swString === null) {
          swString = defaultStrings.sw[key]
          await AsyncStorage.setItem(storageKey, swString);
        }
        swStrings[key] = swString;
      }
      assert(Object.keys(swStrings).length === Object.keys(defaultStrings.sw).length);

      this.setState({
        enStrings: enStrings,
        swStrings: swStrings,
        localizedStrings: new LocalizedStrings({'en': enStrings, 'sw': swStrings})
      });
    } catch(error) {
      console.error(error);
    }
  }

  _setLanguage(language) {
    if (language !== this.state.language) {
      this.state.localizedStrings.setLanguage(language);
      this.setState({language: language});
    }
  }

  async _loadCustomData(fileName, fieldName) {
    const filePath = RNFS.ExternalStorageDirectoryPath + '/Download/' + fileName;
    if (await RNFS.exists(filePath)) {
      console.log("custom data file for " + fieldName + " exists");
      let customData = await RNFS.readFile(filePath);
      customData = JSON.parse(customData);

      let newState = {};
      newState[fieldName] = customData;
      this.setState(newState);
    }
  }

  _unpackChimps(chimps) {
    return chimps.map((c, i) => ({
     name: c.name,
     sex: c.sex
    }));
  }

  _unpackValuePairs(valuePairs) {
    return valuePairs.map((vp, i) => [
      vp.dbValue === 'NULL' ? null : vp.dbValue,
      vp.userValue
    ]);
  };

  //       case 'SummaryScreen':
  //         const cs = this._unpackChimps(route.follow.chimps);

  render() {
    return (
      <Provider store={store}>
        <Navstack screenProps={this.state}/>
      </Provider>
    );
  }
}

const Navstack = StackNavigator({
  MenuScreen: { screen: MenuScreen,
    navigationOptions: {
      headerLeft: null
    }
  },
  NewFollowScreen: { screen: NewFollowScreen },
  FollowScreen: { screen: FollowScreen,
    navigationOptions:  {
      headerLeft: null
    }
  },
  FollowListScreen: { screen: FollowListScreen },
  ExportDataScreen: { screen: ExportDataScreen },
  SummaryScreen: { screen: SummaryScreen },
  SettingsScreen: { screen: SettingsScreen },
  GPSTestScreen: { screen: GPSTestScreen },
}, {
  initialRouteName: 'MenuScreen',
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('JGIDigiTiki', () => JGIDigiTiki);
