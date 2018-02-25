import React, { Component } from 'react';
import {
  AppRegistry,
  Button,
  DatePickerAndroid,
  StyleSheet,
  TouchableHighlight,
  Text,
  TextInput,
  Modal,
  Navigator,
  Picker,
  View
} from 'react-native';
import ItemTracker from './ItemTracker';

import sharedStyles from '../SharedStyles';
import util from '../util';

export default class FollowScreenHeader extends Component {
  render() {

    const strings = this.props.strings;
    const isFirstFollow = this.props.followTime === this.props.follow.startTime;

    return (
        <View style={styles.followScreenHeader}>
          <View style={styles.followScreenHeaderInfoRow}>
            <Button
                style={[{opacity: (isFirstFollow ? 0.0 : 1.0)}, sharedStyles.btn]}
                onPress={this.props.onPreviousPress}
                disabled={isFirstFollow} title={strings.Follow_PreviousTimeInterval}></Button>
            <Text style={styles.followScreenHeaderMainText}>
              {util.dbTime2UserTime(this.props.followTime)}
            </Text>
            <Button
                style={sharedStyles.btn}
                onPress={this.props.onNextPress} title={strings.Follow_NextTimeInterval} ></Button>
          </View>
          <ItemTracker
              title='Food'
              activeListTitle='Active'
              finishedListTitle='Finished'
              activeItems={this.props.activeFood}
              finishedItems={this.props.finishedFood}
              onTrigger={this.props.onFoodTrackerSelected}
              onSelectActiveItem={this.props.onSelectActiveFood}
              onSelectFinishedItem={this.props.onSelectFinishedFood}
          />
          <ItemTracker
              title='Species'
              activeListTitle='Active'
              finishedListTitle='Finished'
              activeItems={this.props.activeSpecies}
              finishedItems={this.props.finishedSpecies}
              onTrigger={this.props.onSpeciesTrackerSelected}
              onSelectActiveItem={this.props.onSelectActiveSpecies}
              onSelectFinishedItem={this.props.onSelectFinishedSpecies}
          />
        </View>
    );
  }
}

const styles = {
  followScreenHeader: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 145,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 8
  },
  followScreenHeaderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    alignItems: 'center',
    height: 40
  },
  headerRow: {
    flex:1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    alignItems: 'center',
    height: 50,
  },
  followScreenHeaderMainText: {
    fontSize: 34,
    color: '#000'
  },
  btnInGroup: {
    marginRight: 8
  }
};
