import React, { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  CheckBox,
  Text,
  View
} from 'react-native';
import Orientation from 'react-native-orientation';
import loaderHandler from 'react-native-busy-indicator/LoaderHandler';
import _ from 'lodash';
import realm from '../../models/realm';
import Util from '../util';
import sharedStyles from '../SharedStyles';
import BackgroundTimer from 'react-native-background-timer';
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';

import * as actions from '../../reduxmgmt/actions';
import { connect } from 'react-redux';

import FollowArrivalTable from './FollowArrivalTable';
import FollowScreenHeader from './FollowScreenHeader';
import ItemTrackerModal from './ItemTrackerModal';

const ModalType = Object.freeze({
  none: 0,
  food: 1,
  species: 2
});

class FollowScreen extends Component {

  intervalId: ?number = null;
  watchId: ?number = null;

  componentDidMount() {
    Orientation.lockToPortrait();
    if(this.props.navigation.state.params.trackGps) {
      console.log("GPS tracker already ON");
      this.restartTimer();
    } else if (this.props.gpsTrackerOn) {
      console.log("GPS tracking ON and active");
    } else {
      Alert.alert(
          'GPS Tracker',
          'Do you want to record GPS positions for this follow?',
          [
            {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {text: 'Yes', onPress: () => {
              this.props.trackGps(); // gpsTrackerOn: true
              this.restartTimer(); // TODO: move to actions
              }
            }
          ],
          { cancelable: false }
        );
    }
  }

  // componentWillUpdate() {
  //   console.log("componentWillUpdate");
  //   if(this.props.reloadFollowArrivalsObject) {
  //     // TODO: reloadFollowArrivalsObject
  //     console.log("Update FollowArrival");
  //     this.props.reloadFollowArrivalsObject(false);
  //   }
  // }

  // componentDidUpdate() {
  //   console.log("componentDidUpdate");
  // }

  componentWillUnmount() {
    BackgroundTimer.clearInterval(intervalId);
    navigator.geolocation.clearWatch(watchId);
    BackgroundTimer.clearInterval(this.props.gpsIntervalId);
  }

  stopTimer() {
    this.props.setGPSStatus("OFF");
    BackgroundTimer.clearInterval(intervalId);
    navigator.geolocation.clearWatch(watchId);
    BackgroundTimer.clearInterval(this.props.gpsIntervalId);
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
  }

  constructor(props) {

    super(props);

    const focalId = this.props.navigation.state.params.follow.focalId;
    const date = this.props.navigation.state.params.follow.date;
    const community = this.props.navigation.state.params.follow.community;
    const followStartTime = this.props.navigation.state.params.followTime;
    const chimps = this._unpackChimps(this.props.navigation.state.params.follow.chimps);
    const food = this._unpackValuePairs(this.props.navigation.state.params.follow.food);
    const foodParts = this._unpackValuePairs(this.props.navigation.state.params.follow.foodParts);
    const species = this._unpackValuePairs(this.props.navigation.state.params.follow.chimps);

    const existingLocations = realm.objects('Location')
            .filtered('focalId = $0 AND date = $1',
              focalId, date);

    if (existingLocations.length === 0) {
      console.log("No GPS locations in Realm");
      //this.recordLocation();
    } else {
      console.log("Existing location records");
      console.log(existingLocations);
    }

    if (this.props.navigation.state.params.followArrivals !== undefined && this.props.navigation.state.params.followArrivals !== null) {
      // Write follows from previous into db
      console.log("Got follow arrival from previous", this.props.navigation.state.params.followArrivals);
      realm.write(() => {
        Object.keys(this.props.navigation.state.params.followArrivals).forEach((key, index) => {
          const fa = this.props.navigation.state.params.followArrivals[key];

          const followArrivals = realm.objects('FollowArrival')
            .filtered('focalId = $0 AND date = $1 AND followStartTime = $2 AND chimpId = $3',
              focalId, date, followStartTime, fa.chimpId);
          if (followArrivals.length === 0) {
            const newArrival = realm.create('FollowArrival', {
              followId: this.props.navigation.state.params.follow.id,
              id: new Date().getUTCMilliseconds().toString(),
              date: this.props.navigation.state.params.follow.date,
              followStartTime: this.props.navigation.state.params.followTime,
              focalId: this.props.navigation.state.params.follow.focalId,
              chimpId: fa.chimpId,
              time: fa.time,
              certainty: fa.certainty,
              estrus: fa.estrus,
              isWithin5m: fa.isWithin5m,
              isNearestNeighbor: fa.isNearestNeighbor,
              grooming: fa.grooming
            });
          } else {
            const followArrival = followArrivals[0];
            followArrival.time = fa.time;
            followArrival.certainty = fa.certainty;
            followArrival.estrus = fa.estrus;
            followArrival.isWithin5m = fa.isWithin5m;
            followArrival.isNearestNeighbor = fa.isNearestNeighbor;
            followArrival.grooming = followArrival.grooming;
          }
        });
      });
    }

    loaderHandler.showLoader('Loading More');

    let followArrivals = {};
    // TODO: Populate followArrival in db
    // TODO: filter using followId
    const allFollowArrival = realm.objects('FollowArrival')
        .filtered('focalId = $0 AND date = $1 AND followStartTime = $2', focalId, date, this.props.navigation.state.params.followTime);
    for (let i = 0; i < allFollowArrival.length; i++) {
      const arrival = allFollowArrival[i];
      followArrivals[arrival.chimpId] = arrival;
    }

    // TODO: Populate food in db
    // TODO: filter using followId
    const allFood = realm.objects('Food')
        .filtered('focalId = $0 AND date = $1', focalId, date);

    let activeFood = [];
    let finishedFood = [];

    for (let i = 0; i < allFood.length; i++) {
      const food = allFood[i];
      if (food.endTime === 'ongoing') {
        activeFood.push(food);
      } else {
        finishedFood.push(food);
      }
    }

    // Populate species in db
    // TODO: filter using followId
    const allSpecies = realm.objects('Species')
        .filtered('focalId = $0 AND date = $1', focalId, date);

    let activeSpecies = [];
    let finishedSpecies = [];

    for (let i = 0; i < allSpecies.length; i++) {
      const species = allSpecies[i];
      if (species.endTime === 'ongoing') {
        activeSpecies.push(species);
      } else {
        finishedSpecies.push(species);
      }
    }

    const maleChimpsSorted = this.getSortedChimps(this.props.navigation.state.params.follow.chimps, 'M', followArrivals);
    const femaleChimpsSorted = this.getSortedChimps(this.props.navigation.state.params.follow.chimps, 'F', followArrivals);

    this.state = {
      modalVisible: false,
      activeFood: activeFood,
      finishedFood: finishedFood,
      activeSpecies: activeSpecies,
      finishedSpecies: finishedSpecies,
      modalMainList: [],
      modalSubList: [],
      modalType: ModalType.none,
      itemTrackerInitialStartTime: null,
      itemTrackerInitialEndTime: null,
      itemTrackerInitialMainSelection: null,
      itemTrackerInitialSecondarySelection: null,
      itemTrackerItemId: null,
      followArrivals: followArrivals,
      selectedChimp: null,
      initialPosition: 'unknown',
      lastPosition: 'unknown',
      maleChimpsSorted: maleChimpsSorted,
      femaleChimpsSorted: femaleChimpsSorted,
      currentFollowTime: this.props.navigation.state.params.followTime
     };
  };

  restartTimer() {
    console.log("Timer started for: ", this.props.gpsTimerInterval);
    this.getGPSnow(this.state.currentFollowTime);

    intervalId = BackgroundTimer.setInterval(() => {
        const followTimeIndex = this.props.screenProps.times.indexOf(this.state.currentFollowTime);
        const nextFollowTime = followTimeIndex !== this.props.screenProps.times.length - 1 ? this.props.screenProps.times[followTimeIndex + 1] : null;
        this.setState({currentFollowTime: nextFollowTime});
        this.getGPSnow(nextFollowTime);
      }, this.props.gpsTimerInterval);

    this.props.gpsTimerId = intervalId;
  }

  getGPSnow(followStartTime) {
    console.log("Get GPS now");
    this.props.setGPSStatus('Searching');

    const followId = this.props.navigation.state.params.follow.id;
    const focalId = this.props.navigation.state.params.follow.focalId;
    const date = this.props.navigation.state.params.follow.date;
    const community = this.props.navigation.state.params.follow.community;

    watchId = navigator.geolocation.getCurrentPosition((position) => {
        console.log("Wrote to Realm ", followStartTime, focalId);
        this.props.setGPSStatus('OK');

        if(this.props.gpsTrialNumber != 0) {
          this.props.resetGpsTrialNumber();
        }

        realm.write(() => {
          const newLocation = realm.create('Location', {
            followId: followId,
            date: date,
            focalId: focalId,
            followStartTime: followStartTime,
            community: community,
            timestamp: position.timestamp,
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            altitude: position.coords.altitude,
            accuracy: position.coords.accuracy
          });
        });
      }, (error) => {
          console.log("Couldn't get lock");
          this.props.setGPSStatus('Not found');

          // (0,0), (1, 3), (2, 6), (3, 9)
          this.props.incrementGpsTrialNumber();

          if(this.props.gpsTrialNumber == 2) {
            realm.write(() => {
              const newLocation = realm.create('Location', {
                followId: followId,
                date: date,
                focalId: focalId,
                followStartTime: followStartTime,
                community: community,
                timestamp: position.timestamp,
                longitude: 0.0,
                latitude: 0.0,
                altitude: 0.0,
                accuracy: 0.0
              });
            });
          }

          // Will not search again after minute 12
          if(this.props.gpsTrialNumber < 4) {
            this.getGPSnow(followStartTime);
          }
      },
      {
        enableHighAccuracy: true, // FINE_LOCATION
        timeout: 2*60*1000, // wait for signal for 2 minutes, then call ErrorCallback
        maximumAge: 3*60*1000
      }
    );
    console.log("Watch ID^ ", watchId);
  }

  getSortedChimps(chimps, sex, followArrivals) {
    const sexChimps = chimps.filter((c) => c.sex === sex);
    const presentChimps = sexChimps.filter((c) => followArrivals[c.name] !== undefined);
    const unpresentChimps = sexChimps.filter((c) => followArrivals[c.name] === undefined);
    return presentChimps.sort(Util.compareChimp).concat(unpresentChimps.sort((Util.compareChimp)));
  };

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  updateItemTrackerData(type, data) {
    switch (type) {
      case ModalType.food:
        this.setState({
          modalType: ModalType.food,
          modalMainList: this.props.screenProps.food,
          modalSubList: this.props.screenProps.foodParts,
          itemTrackerInitialStartTime: data ? data.startTime : null,
          itemTrackerInitialEndTime: data ? data.endTime : null,
          itemTrackerInitialMainSelection: data ? data.foodName : null,
          itemTrackerInitialSecondarySelection: data ? data.foodPart : null,
          itemTrackerItemId: data ? data.id : null,
        });
        break;
      case ModalType.species:
        this.setState({
          modalType: ModalType.species,
          modalMainList: this.props.screenProps.species,
          modalSubList: this.props.screenProps.speciesNumbers,
          itemTrackerInitialStartTime: data ? data.startTime : null,
          itemTrackerInitialEndTime: data ? data.endTime : null,
          itemTrackerInitialMainSelection: data ? data.speciesName : null,
          itemTrackerInitialSecondarySelection: data ? data.speciesCount : null,
          itemTrackerItemId: data ? data.id : null,
        });
        break;
    }
  }

  editFood(foodId, foodList) {
    const food = foodList.filter((f) => f.id === foodId)[0];
    this.updateItemTrackerData(ModalType.food, food);
    this.setModalVisible(true);
  }

  editSpecies(speciesId, speciesList) {
    const species = speciesList.filter((s) => s.id === speciesId)[0];
    this.updateItemTrackerData(ModalType.species, species);
    this.setModalVisible(true);
  }

  navigateToFollowTime(step, followTime, followArrivals) {
    if (followArrivals !== null) {
      let updatedFollowArrivals = {};
      const keys = Object.keys(followArrivals);

      // arriveFirst
      for (let i = 0; i < keys.length; ++i) {
        const k = keys[i];
        const fa = followArrivals[k];
        if (fa.time.startsWith('arrive')) {
          let newFa = _.extend({}, fa);
          newFa.time = 'arriveContinues';
          newFa.isWithin5m = false;
          newFa.isNearestNeighbor = false;
          newFa.grooming = 'N';
          newFa.certainty = Util.getCertaintyLabelWithoutNesting(newFa.certainty);
          updatedFollowArrivals[k] = newFa;
        }

        // TODO: change state -- don't create duplicate components
        console.log("Interval number, ", this.props.navigation.state.params.intervalNumber + step);
        this.props.navigation.navigate('FollowScreen', {
          follow: this.props.navigation.state.params.follow,
          followTime: followTime,
          followArrivals: updatedFollowArrivals,
          trackGps: false,
          intervalNumber: this.props.navigation.state.params.intervalNumber + step
        });
      }

    } else {
      console.log("Interval number restarted, ", 0);

      this.props.navigation.navigate('FollowScreen', {
        follow: this.props.navigation.state.params.follow,
        followTime: followTime,
        followArrivals: followArrivals,
        trackGps: true,
        intervalNumber: 0
      });
    }
  }

  presentEndFollowAlert() {
    const strings = this.props.selectedLanguageStrings;
    Alert.alert(
        strings.Follow_EndFollowAlertTitle,
        strings.Follow_EndFollowAlertMessage,
        [
          {text: strings.Follow_EndFollowActionNo, onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: strings.Follow_EndFollowActionYes, onPress: this.endFollow.bind(this)}
        ],
        { cancelable: false }
      );
  }

  endFollow() {
    console.log(intervalId, watchId,  this.props.navigation.state.params.follow.gpsFirstTimeoutId);
    BackgroundTimer.clearInterval(intervalId);
    navigator.geolocation.clearWatch(watchId);

    realm.write(() => {
      this.props.navigation.state.params.follow.endTime = this.props.navigation.state.params.followTime;
    });

    if (this.props.navigation.state.params.follow.gpsFirstTimeoutId !== undefined) {
      console.log("stop gps timeout");
      BackgroundTimer.clearTimeout(this.props.navigation.state.params.follow.gpsFirstTimeoutId);
    }
    if (this.props.navigation.state.params.follow.gpsIntervalId !== undefined) {
      console.log("stop gps interval timer");
      BackgroundTimer.clearInterval(this.props.navigation.state.params.follow.gpsIntervalId);
    }

    // Go back to Menu
    this.props.navigation.navigate('MenuScreen');
  }

  render() {
    const strings = this.props.selectedLanguageStrings;
    const beginFollowTime = this.props.navigation.state.params.follow.startTime;
    const beginFollowTimeIndex = this.props.screenProps.times.indexOf(beginFollowTime);
    const followTimeIndex = this.props.screenProps.times.indexOf(this.props.navigation.state.params.followTime);
    const previousFollowTime = followTimeIndex !== beginFollowTimeIndex ? this.props.screenProps.times[followTimeIndex - 1] : null;
    const nextFollowTime = followTimeIndex !== this.props.screenProps.times.length - 1 ? this.props.screenProps.times[followTimeIndex + 1] : null;

    return(
      <View style={styles.container}>

        <ItemTrackerModal
            title={this.state.modalMainList == this.props.screenProps.food ? "Food" : "Species"}
            strings={strings}
            visible={this.state.modalVisible}
            mainList={this.state.modalMainList}
            secondaryList={this.state.modalSubList}
            beginFollowTime={this.props.navigation.state.params.followTime}
            initialStartTime={this.state.itemTrackerInitialStartTime}
            initialEndTime={this.state.itemTrackerInitialEndTime}
            initialMainSelection={this.state.itemTrackerInitialMainSelection}
            initialSecondarySelection={this.state.itemTrackerInitialSecondarySelection}
            itemId={this.state.itemTrackerItemId}
            onDismiss={()=>{this.setModalVisible(false)}}
            onSave={(data, isEditing)=>{
              const className = this.state.modalType === ModalType.food ? 'Food' : 'Species';
              const mainFieldName = this.state.modalType === ModalType.food ? 'foodName' : 'speciesName';
              const secondaryFieldName = this.state.modalType === ModalType.food ? 'foodPart' : 'speciesCount';
              let newActiveList = this.state.modalType === ModalType.food ? this.state.activeFood : this.state.activeSpecies;
              let newFinishedList = this.state.modalType === ModalType.food ? this.state.finishedFood : this.state.finishedSpecies;

              realm.write(() => {

                // When Food starts and ends in the same interval
                // -- same startInterval and endInterval
                // OR food was started in the current interval
                // -- startInterval = this intervalNumber
                // endInterval is temporarily this intervalNumber
                // TODO: edit endInterval when it actually ends
                if (!isEditing) {
                  let objectDict = {
                    followId: this.props.navigation.state.params.follow.id,
                    id: new Date().getUTCMilliseconds(),
                    date: this.props.navigation.state.params.follow.date,
                    focalId: this.props.navigation.state.params.follow.focalId,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    startInterval: this.props.navigation.state.params.intervalNumber,
                    endInterval:  this.props.navigation.state.params.intervalNumber,
                    intervalNumber: [this.props.navigation.state.params.intervalNumber, this.props.navigation.state.params.intervalNumber]
                  };
                  objectDict[mainFieldName] = data.mainSelection;
                  objectDict[secondaryFieldName] = data.secondarySelection;

                  // Food or Species
                  const newObject = realm.create(className, objectDict);

                  if (data.endTime === 'ongoing') {
                    newActiveList.push(newObject);
                    if (this.state.modalType === ModalType.food) {
                      this.setState({activeFood: newActiveList});
                    } else {
                      this.setState({activeSpecies: newActiveList});
                    }
                  } else {
                    newFinishedList.push(newObject);
                    if (this.state.modalType === ModalType.food) {
                      this.setState({finishedFood: newFinishedList});
                    } else {
                      this.setState({finishedSpecies: newFinishedList});
                    }
                  }
                }
                // When food ends in a different interval
                else {
                  let object = newActiveList.filter((o) => o.id === data.itemId)[0];
                  object.startTime = data.startTime;
                  object.endTime = data.endTime;
                  object.startInterval = data.startInterval? data.startInterval: 0;
                  object.endInterval = this.props.navigation.state.params.intervalNumber;
                  object.intervalNumber = [object.startInterval, this.props.navigation.state.params.intervalNumber];
                  object[mainFieldName] = data.mainSelection;
                  object[secondaryFieldName] = data.secondarySelection;

                  if (data.endTime !== 'ongoing') {
                    const index = newActiveList.indexOf(object);
                    newActiveList.splice(index, 1);
                    newFinishedList.push(object);
                    if (this.state.modalType === ModalType.food) {
                      this.setState({activeFood: newActiveList, finishedFood: newFinishedList});
                    } else {
                      this.setState({activeSpecies: newActiveList, finishedSpecies: newFinishedList});
                    }
                  }
                }
              });
            }}
        />

        <View style={styles.mainMenu}>
          <Button
            style={[sharedStyles.btn, sharedStyles.btnSpecial, styles.btnInGroup]}
            onPress={()=>{
              this.props.navigation.navigate('SummaryScreen', {
                follow: this.props.navigation.state.params.follow
              });
            }} title={strings.Follow_SeeSummaryButtonTitle}>
          </Button>
          <Button
            style={[sharedStyles.btn, sharedStyles.btnSpecial, styles.btnInGroup]}
            onPress={this.presentEndFollowAlert.bind(this)} title={strings.Follow_EndFollowButtonTitle} >
          </Button>
          <Text style={styles.btnStatus}>GPS Status: { this.props.gpsStatus }</Text>
          <CheckBox
            value={this.props.gpsTrackerOn}
            onValueChange={() => {
                if(this.props.gpsTrackerOn) {
                  console.log("Stop GPS");
                  this.stopTimer();
                } else {
                  console.log("Turn on GPS");
                  this.restartTimer();
                }
                this.props.toggleGPS();
              }
            }/>
          <Text style={styles.btnStatus}>Track GPS</Text>
        </View>

        <FollowScreenHeader
            styles={styles.followScreenHeader}
            strings={strings}
            follow={this.props.navigation.state.params.follow}
            followTime={this.props.navigation.state.params.followTime}
            activeFood={this.state.activeFood.map((f, i) => {return {id: f.id, name: f.foodName + ' ' + f.foodPart}})}
            finishedFood={this.state.finishedFood.map((f, i) => ({id: f.id, name: f.foodName + ' ' + f.foodPart}))}
            activeSpecies={this.state.activeSpecies.map((s, i) => ({id: s.id, name: s.speciesName}))}
            finishedSpecies={this.state.finishedSpecies.map((s, i) => ({id: s.id, name: s.speciesName}))}
            onPreviousPress={()=> {
              const followArrivals =
                  Object.keys(this.state.followArrivals).map(key => this.state.followArrivals[key]);

              this.navigateToFollowTime(-1, previousFollowTime, _.extend(this.state.followArrivals)); // TODO
            }}
            onNextPress={()=>{
              const followArrivals =
                  Object.keys(this.state.followArrivals).map(key => this.state.followArrivals[key]);
              const hasNearest = followArrivals.some((fa, i) => fa.isNearestNeighbor);
              const hasWithin5m = followArrivals.some((fa, i) => fa.isWithin5m);
              const hasOpenFood = this.state.activeFood.length !== 0;
              const hasOpenSpecies = this.state.activeSpecies.length !== 0;

              if (!hasNearest || !hasWithin5m || hasOpenFood || hasOpenSpecies) {
                let alertMessages = [];
                if (!hasNearest) { alertMessages.push(strings.Follow_NextDataValidationAlertMessageNoNearest); }
                if (!hasWithin5m) { alertMessages.push(strings.Follow_NextDataValidationAlertMessageNoWithIn5m); }
                if (hasOpenFood) { alertMessages.push(strings.Follow_NextDataValidationAlertMessageOpenFood); }
                if (hasOpenSpecies) { alertMessages.push(strings.Follow_NextDataValidationAlertMessageOpenSpecies); }
                alertMessages.push(strings.Follow_NextDataValidationAlertMessagePrompt);
                const alertMessage = alertMessages.join('\n');

                Alert.alert(
                    strings.Follow_NextDataValidationAlertTitle,
                    alertMessage,
                    [
                      {text: strings.Follow_NextDataValidationAlertCancel,
                        onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                      {text: strings.Follow_NextDataValidationAlertConfirm,
                        onPress: () => {
                          this.navigateToFollowTime(1, nextFollowTime, _.extend(this.state.followArrivals));
                        }},
                    ],
                    {cancelable: true}
                );
              } else {
                this.navigateToFollowTime(1, nextFollowTime, _.extend(this.state.followArrivals))
              }
            }}
            onFoodTrackerSelected={()=>{
              this.updateItemTrackerData(ModalType.food, null);
              this.setModalVisible(true);
            }}

            onSpeciesTrackerSelected={()=>{
              this.updateItemTrackerData(ModalType.species, null);
              this.setModalVisible(true);
            }}

            onSelectActiveFood={(fid) => {
              this.editFood(fid, this.state.activeFood);
            }}

            onSelectFinishedFood={(fid) => {
              if (fid === null) { return; }
              this.editFood(fid, this.state.finishedFood);
            }}

            onSelectActiveSpecies={(sid) => {
              this.editSpecies(sid, this.state.activeSpecies);
            }}

            onSelectFinishedSpecies={(sid) => {
              if (sid === null) { return; }
              this.editSpecies(sid, this.state.finishedSpecies);
            }}
        />

         <FollowArrivalTable
            styles={styles.followArrivalTable}
            chimps={this.props.navigation.state.params.follow.chimps}
            maleChimpsSorted={this.state.maleChimpsSorted}
            femaleChimpsSorted={this.state.femaleChimpsSorted}
            focalChimpId={this.props.navigation.state.params.follow.focalId}
            followDate={this.props.navigation.state.params.follow.date}
            followArrivals={this.state.followArrivals}
            selectedChimp={this.state.selectedChimp}
            onSelectChimp={(c) => {this.setState({selectedChimp: c});}}
            createNewArrival={(chimpId, time) => {
              realm.write(() => {
                const newArrival = realm.create('FollowArrival', {
                  followId: this.props.navigation.state.params.follow.id,
                  id: new Date().getUTCMilliseconds().toString(),
                  date: this.props.navigation.state.params.follow.date,
                  followStartTime: this.props.navigation.state.params.followTime,
                  focalId: this.props.navigation.state.params.follow.focalId,
                  chimpId: chimpId,
                  time: time,
                  certainty: parseInt(Util.certaintyLabels.certain),
                  estrus: parseInt(Util.estrusLabels.a),
                  isWithin5m: false,
                  isNearestNeighbor: false,
                  grooming: 'N'
                });
                let newFollowArrivals = this.state.followArrivals;
                newFollowArrivals[chimpId] = newArrival;
                this.setState({followArrivals: newFollowArrivals});
              });
            }}
            updateArrival={(field, value) => {
              const chimpId = this.state.selectedChimp;
              if (chimpId !== null) {
                if(value != "deleted") {
                  let arrival = this.state.followArrivals[chimpId];

                  realm.write(() => {
                    //id = this.state.followArrivals[chimpId].id;
                    arrival[field] = value;

                    // update State
                    let newFollowArrivals = this.state.followArrivals;
                    newFollowArrivals[chimpId] = arrival;
                    this.setState({followArrivals: newFollowArrivals});
                  });
                } else {
                  // TODO: delete the follow
                  let arrival = this.state.followArrivals[chimpId];
                  realm.write(() => {
                    realm.delete(arrival);
                  });

                  // update State
                  let newFollowArrivals = this.state.followArrivals;
                  delete newFollowArrivals[chimpId];
                  this.setState({followArrivals: newFollowArrivals});
                  this.props.reloadFollowArrivalsObject(true);
                }
              }
            }}
        />
        <ActivityIndicator/>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    gpsTrackerOn: state.gpsTrackerOn,
    gpsStatus: state.gpsStatus,
    lastGpsPosition: state.lastGpsPosition,
    gpsTimerInterval: state.gpsTimerInterval,
    gpsTimerId: state.gpsTimerId,
    gpsTrialNumber: state.gpsTrialNumber,
    selectedLanguageStrings: state.selectedLanguageStrings,
    reloadFollowArrivalsObject: state.reloadFollowArrivalsObject
  }
}

export default connect(mapStateToProps, actions)(FollowScreen);

const styles = {
  container: {
    width: undefined,
    height: undefined,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor:'white',
  },
  mainMenu: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    paddingTop: 6,
    paddingBottom: 6,
    marginLeft: 12,
    marginRight: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'gray',
  },
  followScreenHeader: {
    alignSelf: 'stretch',
    paddingLeft: 12,
    paddingRight: 12,
    height: 150,
    backgroundColor: 'pink'
  },
  followArrivalTable: {
    flex: 1,
    height: 200,
    alignSelf: 'stretch'
  },
  btnInGroup: {
    marginRight: 8
  },
  btnStatus: {
    marginRight: 8,
    marginTop: 5
  }
};

// recordLocation() {
//   this.saveLocation(navigator.geolocation);
//   const now = new Date();
//   const minutes = now.getMinutes();
//   const seconds = now.getSeconds();
//   const secondsToGo = (saveLocationInterval * 60) - (minutes * 60 + seconds) % (saveLocationInterval * 60);
//   console.log(secondsToGo);
//
//   const timeoutId = BackgroundTimer.setTimeout(() => {
//     const intervalId = BackgroundTimer.setInterval(() => {
//       console.log("Get location");
//       this.saveLocation(navigator.geolocation);
//     }, saveLocationInterval * 60 * 1000);
//     realm.write(() => {
//       this.props.navigation.state.params.follow.gpsIntervalId = intervalId;
//     });
//   }, secondsToGo * 1000);
//
//   realm.write(() => {
//     this.props.navigation.state.params.follow.gpsFirstTimeoutId = timeoutId;
//   });
// };

// saveLocation(geolocation) {
//   const focalId = this.props.navigation.state.params.follow.focalId;
//   const date = this.props.navigation.state.params.follow.date;
//   const community = this.props.navigation.state.params.follow.community;
//   const followStartTime = this.props.navigation.state.params.followTime;
//
//   geolocation.getCurrentPosition(
//       (position) => {
//         this.setState({ currentGeolocation: [position.coords.longitude, position.coords.latitude] });
//         realm.write(() => {
//           const newLocation = realm.create('Location', {
//             date: date,
//             focalId: focalId,
//             followStartTime: followStartTime,
//             community: community,
//             timestamp: position.timestamp,
//             longitude: position.coords.longitude,
//             latitude: position.coords.latitude,
//             altitude: position.coords.altitude,
//             accuracy: position.coords.accuracy
//           });
//         });
//       },
//       (error) => {
//         alert(JSON.stringify(error));
//         console.log("Couldn't get lock");
//         this.setState({ currentGeolocation: ['x', 'x']});
//         this.recordLocation();
//       },
//       {enableHighAccuracy: true, timeout: 10000}
//   );
// }
