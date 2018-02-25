import React, { Component } from 'react';
import {
    BackAndroid,
    Image,
    ScrollView,
    TouchableHighlight,
    Text,
    View
} from 'react-native';
import Orientation from 'react-native-orientation';

import realm from '../../models/realm';
import strings from '../../data/strings';
import Util from '../util';

export default class FollowListScreen extends Component {

  componentDidMount() {
    Orientation.lockToPortrait();
  }

  render() {

    const follows = realm.objects('Follow');
      //.filtered('endTime = $0', undefined);

    const rows = follows.map((f, i) => {
      return (
        <FollowListRow
          key={i}
          strings={this.props.screenProps.localizedStrings}
          onPress={() => {
            this.props.navigation.navigate('SummaryScreen', {
              follow: f
            });
          }}
          follow={f}
        >
        </FollowListRow>);
    });

    return(
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
        {rows.reverse()}
        </ScrollView>
      </View>
    );
  }
}

class FollowListRow extends Component {
  render() {
    const strings = this.props.strings;
    const follow = this.props.follow;
    const focalChimpId = follow.focalId;
    const researcherName = follow.amObserver1;
    const date = this.props.follow.date;
    const timeStart = this.props.follow.timeStart;

    const dateString = Util.getDateString(date);

    return(
        <TouchableHighlight
            style={styles.followRow}
            onPress={this.props.onPress}
        >
          <View style={styles.followRowInnerWrap}>
            <View style={styles.followRowTextBlock}>
              <Text style={styles.followRowMainText}>{dateString} {timeStart}</Text>
              <View style={styles.followRowDescriptionGroup}>
                <Text style={styles.followRowDescriptionText}>{strings.NewFollow_Target}: {focalChimpId}</Text>
                <Text style={styles.followRowDescriptionText}>{strings.NewFollow_ResearcherName}: {researcherName}</Text>
              </View>
            </View>
            <Image style={styles.followRowArrow} source={require('../../img/right-arrow.png')} />
          </View>
        </TouchableHighlight>
    );
  }
}

var styles = {
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor:'white',
    alignItems: 'center'
  },
  scrollView: {
    marginBottom: 20,
    alignSelf: 'stretch'
  },
  followRow: {
    alignSelf: 'stretch',
    marginLeft: 8,
    marginRight: 8,
    paddingTop: 8,
    paddingBottom: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#33b5e5',
    height: 100
  },
  followRowDescriptionGroup: {
    flexDirection: 'row'
  },
  followRowInnerWrap: {
    height: 60,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  followRowTextBlock: {
    width: 200
  },
  followRowMainText: {
    fontSize: 20,
    color: 'black'
  },
  followRowDescriptionText: {
    fontSize: 16,
    marginRight: 10,
  },
  followRowArrow: {
    marginTop: 20
  },
};
