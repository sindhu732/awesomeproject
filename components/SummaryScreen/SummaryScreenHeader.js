import React, { Component } from 'react';
import {
  AppRegistry,
  BackAndroid,
  Button,
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
import Util from '../util';

export default class SummaryScreenHeader extends Component {
  render() {

    const followDate = Util.getDateString(this.props.followDate);
    const followStartTime = Util.dbTime2UserTime(this.props.followStartTime);
    const followEndTime = Util.dbTime2UserTime(this.props.followEndTime);

    return(
        <View style={styles.container}>
          <Text style={styles.titleText}>GOMBE STREAM RESEARCH CENTRE - KASEKELA COMMUNITY TIKI</Text>
          <View style={styles.descriptionGroup}>
            <Text style={styles.descriptionText}>{followDate} {followStartTime} - {followEndTime}</Text>
            <Text style={styles.descriptionText}>Target: {this.props.focalChimpId}</Text>
            <Text style={styles.descriptionText}>Researcher: {this.props.researcherName}</Text>
          </View>
        </View>
    );
  }
}

const styles = {
  container: {
    borderBottomWidth: 1,
    flexDirection: 'column',
    alignSelf: 'stretch',
    paddingBottom: 10,
  },
  descriptionGroup: {
    flexDirection: 'row'
  },
  descriptionText: {
    marginRight: 10
  }
}
