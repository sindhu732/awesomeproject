import React, { Component } from 'react';
import {
  AppRegistry,
  BackAndroid,
  Dimensions,
  Image,
  StyleSheet,
  TouchableHighlight,
  Text,
  TextInput,
  Navigator,
  NativeModules,
  View
} from 'react-native';
import Orientation from 'react-native-orientation';

import realm from '../../models/realm';
import sharedStyles from '../SharedStyles';
import strings from '../../data/strings';
import SummaryScreenHeader from './SummaryScreenHeader';
import SummaryScreenTable from './SummaryScreenTable';
import assert from 'assert';
import Util from '../util';

export default class SummaryScreen extends Component {

  componentDidMount() {
    Orientation.lockToLandscapeLeft();
  }

  componentWillUnmount() {
    Orientation.lockToPortrait();
  }

  render() {

    // TODO: filter using follow.id
    const followArrivals = realm.objects('FollowArrival')
        .filtered('focalId = $0 AND date = $1', this.props.navigation.state.params.follow.focalId, this.props.navigation.state.params.follow.date);

    // TODO: filter using follow.id
    //const foodObjects = realm.objects('Food').filtered('focalId = $0 AND date = $1', this.props.navigation.state.params.follow.focalId, this.props.navigation.state.params.follow.date);

    const foodObjects = realm.objects('Food').filtered('followId = $0', this.props.navigation.state.params.follow.id);

    const food = foodObjects
      .map((fo, i) => ({
        date: Util.getDateString(fo.date),
        focalId: fo.focalId,
        startTime: Util.getTimeOutput(fo.startTime),
        endTime: Util.getTimeOutput(fo.endTime),
        foodName: fo.foodName,
        foodPart: fo.foodPart
      }));
    console.log(food);

    // TODO: filter using follow.id
    //const speciesObjects = realm.objects('Species').filtered('focalId = $0 AND date = $1', this.props.navigation.state.params.follow.focalId, this.props.navigation.state.params.follow.date);
    const speciesObjects = realm.objects('Species').filtered('followId = $0', this.props.navigation.state.params.follow.id);

    const species = speciesObjects
      .map((fo, i) => ({
        date: Util.getDateString(fo.date),
        focalId: fo.focalId,
        startTime: Util.getTimeOutput(fo.startTime),
        endTime: Util.getTimeOutput(fo.endTime),
        speciesName: fo.speciesName,
        speciesCount: fo.speciesCount
    }));
    console.log(species);

    let followStartTimes = [this.props.navigation.state.params.follow.startTime];
    followStartTimes = followStartTimes.concat(followArrivals.map((fa, i) => fa.followStartTime));
    followStartTimes.sort();
    const lastFollowStartTime = followStartTimes.length === 0 ? this.props.navigation.state.params.follow.startTime : followStartTimes.pop();

    const followStartTime = this.props.navigation.state.params.follow.startTime;
    const followDate = this.props.navigation.state.params.follow.date;

    let followArrivalSummary = {};
    for (let i = 0; i < this.props.screenProps.chimps.length; ++i) {
      const c = this.props.screenProps.chimps[i];
      followArrivalSummary[c.name] = [];
    }

    for (var i = 0; i < followArrivals.length; ++i) {
      const fa = followArrivals[i];
      assert(fa.chimpId in followArrivalSummary);
      followArrivalSummary[fa.chimpId].push(fa);
    }

    let updatedFollowArrivals = {} // TODO:

    return(
        <View style={styles.container}>
          <SummaryScreenHeader
            focalChimpId={this.props.navigation.state.params.follow.focalId}
            researcherName={this.props.navigation.state.params.follow.amObserver1}
            followDate={followDate}
            followStartTime={followStartTime}
            followEndTime={lastFollowStartTime}
          />
          <SummaryScreenTable
            focalChimpId={this.props.navigation.state.params.follow.focalId}
            community={this.props.navigation.state.params.follow.community}
            chimps={this.props.screenProps.chimps}
            followStartTime={followStartTime}
            followEndTime={lastFollowStartTime}
            times={this.props.screenProps.times}
            food={food}
            species={species}
            onFollowTimeSelected={(t) => {
              this.props.navigation.navigate('FollowScreen', {
                follow: this.props.navigation.state.params.follow,
                followTime: t,
                followArrivals: updatedFollowArrivals
              });
            }}
            followArrivalSummary={followArrivalSummary}
          />
        </View>
    );
  }
}

const containerPaddingHorizontal = 5;
const styles = {
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: containerPaddingHorizontal,
    paddingRight: containerPaddingHorizontal,
    width: undefined,
    height: undefined,
    alignItems: 'center',
  },
};
