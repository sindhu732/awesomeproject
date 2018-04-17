import React, { Component } from 'react';
import {
  BackAndroid,
  Button,
  DatePickerAndroid,
  NativeModules,
  ToastAndroid,
  TouchableHighlight,
  Text,
  View
} from 'react-native';
import _ from 'lodash';
import format from 'string-format';
import sharedStyles from '../SharedStyles';
import RNFS from 'react-native-fs';
import realm from '../../models/realm';
import distance from 'gps-distance';

const Mailer = NativeModules.RNMail;
import { zip } from 'react-native-zip-archive';
import Orientation from 'react-native-orientation';
import Util from '../util';
import * as actions from '../../reduxmgmt/actions';
import { connect } from 'react-redux';

import assert from 'assert';

class ExportDataScreen extends Component {

  constructor(props) {
    super(props);

    const defaultStartDate = new Date();
    defaultStartDate.setHours(0, 0, 0, 0);

    const defaultEndDate = new Date();
    defaultEndDate.setHours(23, 59, 59, 999);

    this.state = {
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      status: ""
    };
  }

  setStartDate(date) {
    date.setHours(0, 0, 0, 0);
    this.setState({startDate: date});
  }

  setEndDate(date) {
    date.setHours(23, 59, 59, 999);
    this.setState({endDate: date});
  }

  componentDidMount() {
    Orientation.lockToPortrait();
  };

  render() {
    const strings = this.props.selectedLanguageStrings;

    const follows = realm.objects('Follow')
        .filtered('date >= $0 AND date <= $1', this.state.startDate, this.state.endDate);

    // TODO: uncomment line 66, 67
    // create a path you want to write to
    const dirPath = RNFS.ExternalDirectoryPath + '/follow-data';
    const zipPath = RNFS.ExternalDirectoryPath + '/follow-data.zip';

    const totalFollows = follows.length;

    let exportButtonStyles = [sharedStyles.btn, styles.menuBtn];
    if (totalFollows === 0) {
      exportButtonStyles.push(sharedStyles.btnDisabled);
    }

    return (
      <View style={styles.container}>
        <View style={styles.dateInputGroup}>
          <TouchableHighlight
              onPress={this.showDatePicker.bind(this, 'startDate', {date: this.state.startDate})}>
            <Text style={[styles.dateInput, styles.dateInputText]}>
              {Util.getDateString(this.state.startDate)}
            </Text>
          </TouchableHighlight>
          <Text style={styles.dateInput}> - </Text>
          <TouchableHighlight
              onPress={this.showDatePicker.bind(this, 'endDate', {date: this.state.endDate})}>
            <Text style={[styles.dateInput, styles.dateInputText]}>
              {Util.getDateString(this.state.endDate)}
            </Text>
          </TouchableHighlight>
        </View>

        <Text style={styles.followCountText}>{totalFollows} Follows</Text>

        <Button
            disabled={follows.length === 0}
            onPress={() => {
              this.exportButtonPressed(follows, dirPath, zipPath);
            }} title={strings.ExportData_ExportButtonTitle}
            style={exportButtonStyles}>
        </Button>

        <Text style={styles.followCountText}>{this.state.status}</Text>

      </View>
    );
  }

  showDatePicker = async (stateKey, options) => {
    try {
      let newState = {};
      const {action, year, month, day} = await DatePickerAndroid.open(options);
      if (action === DatePickerAndroid.dismissedAction) {
        // newState[stateKey + 'Text'] = 'dismissed';
      } else {
        let date = new Date(year, month, day);
        // newState[stateKey + 'Text'] = date.toLocaleDateString();
        newState[stateKey] = date;
        if (stateKey === 'startDate') {
          this.setStartDate(date);
        } else if (stateKey === 'endDate') {
          this.setEndDate(date);
        }
      }
    } catch ({code, message}) {
      console.warn(`Error in example '${stateKey}': `, message);
    }
  }

  async exportButtonPressed(follows, dirPath, zipPath) {
    this.setState({status: "Starting export"});

    // TODO: uncomment 135-142, 144-155
    if (await RNFS.exists(dirPath)) {
      await RNFS.unlink(dirPath);
    }
    if (await RNFS.exists(zipPath)) {
      await RNFS.unlink(zipPath);
    }

    RNFS.mkdir(dirPath);

    await this.exportFollows(follows, dirPath);
    let result = await RNFS.readDir(`${dirPath}`);

    console.log(`zip ${dirPath} into ${RNFS.DocumentDirectoryPath}/myFile.zip`);
    await zip(dirPath, zipPath)
      .then((path) => {
        this.setState({status: "Zip completed"});
        console.log(`zip completed at ${path}`);
        this.openEmailClient(path);
      })
      .catch((error) => {
        console.log(error)
      });
  }

  async exportFollows(follows, path) {
    for (let i = 0; i < follows.length; ++i) {
      await this.exportFollow(follows[i], path);
    }
  }

  async exportFollow(follow, path) {
    const prefix = 'export';

    const followOutput = this._getFollowOutput(follow);
    const followArrivals = this._getFollowArrivals(follow);
    const foods = this._getFoods(follow);
    const species = this._getSpecies(follow);
    const locations = this._getLocations(follow);

    const followArrivalsByChimpId = this._groupFollowArrivalsByChimpId(followArrivals);
    const followIntervals = this._getFollowIntervals(followArrivalsByChimpId);
    const groomingFollowArrivals = this._getGroomingFollowArrivals(followArrivals);
    const armsReachFollowArrivals = this._getArmsReachFollowArrivals(followArrivals);
    const fiveMeterFollowArrivals = this._getFiveMeterFollowArrivals(followArrivals);
    const locationOutputs = this._getLocationOutputs(locations);

    await this._exportFollow(followOutput, path, prefix);
    await this._exportFollowArrivals(followIntervals, path, prefix);
    await this._exportFoods(foods, path, prefix);
    await this._exportSpecies(species, path, prefix);
    await this._exportGrooming(groomingFollowArrivals, path, prefix);
    await this._exportArmsReach(armsReachFollowArrivals, path, prefix);
    await this._exportFiveMeter(fiveMeterFollowArrivals, path, prefix);
    await this._exportMapLocation(locationOutputs, path, prefix);
  }

  _getFollowOutput(follow) {
    this.setState({status: "Getting follows"});
    return {
        date: Util.getDateString(follow.date),
        focalId: follow.focalId,
        communityId: follow.community,
        startTime: Util.getTimeOutput(follow.startTime),
        amObserver1: follow.amObserver1,
        day: follow.day,
        month: follow.month,
        year: follow.year
      };
  }

  _getFollowArrivals(follow) {
    let data = this._getFollowData(follow, 'FollowArrival');
    let followArrivals = [];
    for (let i = 0; i < data.length; ++i) {
      followArrivals.push(data[i]);
    }
    this.setState({status: "Getting follow arrivals"});
    return followArrivals;
  }

  _getFoods(follow) {
    const follow_food = this._getFollowData(follow, 'Food');
    this.setState({status: "Getting foods"});
    return follow_food
      .map((fo, i) => ({
        date: Util.getDateString(fo.date),
        focalId: fo.focalId,
        startTime: Util.getTimeOutputUsingSuffix(fo.startTime),
        endTime: Util.getTimeOutputUsingSuffix(fo.endTime),
        foodName: fo.foodName,
        foodPart: fo.foodPart
      }));
  }

  _getSpecies(follow) {
    const follow_species = this._getFollowData(follow, 'Species');
    this.setState({status: "Getting species"});
    return follow_species
      .map((fo, i) => ({
        date: Util.getDateString(fo.date),
        focalId: fo.focalId,
        startTime: Util.getTimeOutputUsingSuffix(fo.startTime),
        endTime: Util.getTimeOutputUsingSuffix(fo.endTime),
        speciesName: fo.speciesName,
        speciesCount: fo.speciesCount
      }));
  }

  _getLocations(follow) {
    this.setState({status: "Getting locations"});
    return this._getFollowData(follow, 'Location');
  }

  _getFollowData(follow, className) {
    return realm.objects(className)
        .filtered('focalId = $0 AND date = $1', follow.focalId, follow.date);
  }

  _groupFollowArrivalsByChimpId(followArrivals) {
    let followArrivalsByChimpId = {}
    for (let i = 0; i < followArrivals.length; ++i) {
      const fa = followArrivals[i];
      const chimpId = fa.chimpId;
      if (!followArrivalsByChimpId.hasOwnProperty(chimpId)) {
        followArrivalsByChimpId[chimpId] = [];
      }
      followArrivalsByChimpId[chimpId].push(fa);
    }
    this.setState({status: "Getting follow arrival by the Chimp Id"});
    return followArrivalsByChimpId;
  }

  _getFollowIntervals(followArrivalsByChimpId) {
    let followIntervals = [];
    for (const chimpId in followArrivalsByChimpId) {
      arrivals = followArrivalsByChimpId[chimpId];
      let intervals = []
      let isArrivalContinues = false;
      let lastStartTime = null;
      let lastStartFollowArrival = null;
      let previousFollowArrival = null; // For certainty change
      let lastCertaintyOutput = Util.getCertaintyOutput(arrivals[0].certainty);
      for (const arrival of arrivals) {
        if (!isArrivalContinues) {
          if (arrival.time.startsWith("arrive")) {
            const timePart = arrival.time.substring("arrive".length);
            lastStartTime = Util.getFollowArrivalTime(arrival.followStartTime, timePart);
            lastStartFollowArrival = arrival;
            isArrivalContinues = true;
          }
        } else if (arrival.time.startsWith("depart")) {
          const timePart = arrival.time.substring("depart".length);
          const intervalEndTime = Util.getFollowArrivalTime(arrival.followStartTime, timePart);
          const duration = Util.getTimeDifference(intervalEndTime, lastStartTime);
          intervals.push({
            date: Util.getDateString(arrival.date),
            focalId: arrival.focalId,
            chimpId: arrival.chimpId,
            seqNum: intervals.length + 1,
            certainty: Util.getCertaintyOutput(arrival.certainty),
            nesting: Util.getNestingOutput(lastStartFollowArrival.certainty, arrival.certainty),
            cycle: Util.getCycleOutput(arrival.estrus),
            startTime: Util.getTimeOutput(lastStartTime),
            endTime: Util.getTimeOutput(intervalEndTime),
            duration: duration,
          });
          isArrivalContinues = false;
        } else if (arrival.time === 'arriveContinues') {
          const certaintyOutput = Util.getCertaintyOutput(arrival.certainty);
          if (lastCertaintyOutput != certaintyOutput) {
            const previousIntervalDbTime = Util.getPreviousDbTime(arrival.followStartTime);
            const followEndTime = Util.getIntervalLastMinuteDbTime(previousIntervalDbTime);
            const duration = Util.getTimeDifference(followEndTime, lastStartTime);
            intervals.push({
              date: Util.getDateString(arrival.date),
              focalId: arrival.focalId,
              chimpId: arrival.chimpId,
              seqNum: intervals.length + 1,
              certainty: lastCertaintyOutput,
              nesting: Util.getNestingOutput(lastStartFollowArrival.certainty, previousFollowArrival.certainty),
              cycle: Util.getCycleOutput(lastStartFollowArrival.estrus),
              startTime: Util.getTimeOutput(lastStartTime),
              endTime: Util.getTimeOutput(followEndTime),
              duration: duration,
            });
            lastStartFollowArrival = arrival;
            lastStartTime = arrival.followStartTime;
            lastCertaintyOutput = certaintyOutput;
          }
        }
        previousFollowArrival = arrival;
      }
      followIntervals = followIntervals.concat(intervals);
    }
    this.setState({status: "Getting follow intervals"});
    return followIntervals;
  }

  _getGroomingFollowArrivals(followArrivals) {
    this.setState({status: "Getting grooming follows"});
    return followArrivals
      .filter((fa) => Util.hasGrooming(fa.grooming))
      .map((fa, i) => ({
        date: Util.getDateString(fa.date),
        focalId: fa.focalId,
        startTime: Util.getTimeOutput(fa.followStartTime),
        chimpId: fa.chimpId,
        grooming: fa.grooming
      }));
  }

  _getArmsReachFollowArrivals(followArrivals) {
    this.setState({status: "Getting arms reach follows"});
    return followArrivals
      .filter((fa) => fa.isNearestNeighbor)
      .map((fa, i) => ({
        date: Util.getDateString(fa.date),
        focalId: fa.focalId,
        startTime: Util.getTimeOutput(fa.followStartTime),
        chimpId: fa.chimpId
      }));
  }

  _getFiveMeterFollowArrivals(followArrivals) {
    this.setState({status: "Getting 5m follows"});
    return followArrivals
      .filter((fa) => fa.isWithin5m)
      .map((fa, i) => ({
        date: Util.getDateString(fa.date),
        focalId: fa.focalId,
        startTime: Util.getTimeOutput(fa.followStartTime),
        chimpId: fa.chimpId
      }));
  }

  _getLocationOutputs(locations) {

    locations = _.values(locations);
    const dists = [];
    for (let i = 0; i < locations.length; ++i) {
      if (i === locations.length - 1) {
        dists.push(0.0);
        break;
      }
      const from = locations[i];
      const to = locations[i + 1];
      const d = distance(from.latitude, from.longitude, to.latitude, to.longitude);
      dists.push(d * 1000.0);
    }

    this.setState({status: "Getting location outputs"});

    return locations.map((loc, i) =>
      ({
        date: Util.getDateString(loc.date),
        focalId: loc.focalId,
        followStartTime: Util.getTimeOutput(loc.followStartTime),
        seqNum: i + 1,
        distanceToNext: dists[i],
        x: loc.longitude,
        y: loc.latitude,
        communityId: Util.getCommunityIdOutput(loc.community)
      })
    );
  }

  async _exportFollow(follow, path, prefix) {
    let followOutput = _.extend({}, follow);
    followOutput.communityId = Util.getCommunityIdOutput(followOutput.community);
    const csvFilePath = `${path}/${prefix}-follow.csv`;
    const csvFields = [
      'FOL_date', // display only date
      'FOL_B_AnimID',
      'FOL_CL_community_id',
      'FOL_time_begin', // convert to English time
      'FOL_am_observer1',
      'FOL_day',
      'FOL_month',
      'FOL_year'
    ];

    const objectFields = [
      'date', 'focalId', 'communityId', 'startTime', 'amObserver1', 'day', 'month', 'year'
    ];

    this.setState({status: "Exporting follows"});
    await this._exportObjectsToCsv([followOutput], csvFilePath, csvFields, objectFields);
  }

  async _exportFollowArrivals(followArrivals, path, prefix) {
    const csvFilePath = `${path}/${prefix}-follow-arrival.csv`;

    const csvFields = [
      'FA_FOL_date',
      'FA_FOL_B_focal_AnimID',
      'FA_B_arr_AnimID',
      'FA_seq_num',
      'FA_type_of_certainty',
      'FA_type_of_nesting',
      'FA_type_of_cycle',
      'FA_time_start',
      'FA_time_end',
      'FA_duration_of_obs',
    ];
    const objectFields = [
      'date', 'focalId', 'chimpId', 'seqNum', 'certainty',
      'nesting', 'cycle', 'startTime', 'endTime', 'duration'
    ];

    this.setState({status: "Exporting follow arrivals"});
    await this._exportObjectsToCsv(followArrivals, csvFilePath, csvFields, objectFields);
  }

  async _exportFoods(foods, path, prefix) {
    const csvFilePath = `${path}/${prefix}-food.csv`;
    const csvFields = [
      'FB_FOL_date', // display only date
      'FB_FOL_B_AnimId',
      'FB_begin_feed_time', // convert to English time
      'FB_end_feed_time', // convert to English time
      'FB_FL_local_food_name',
      'FB_FPL_local_food_part'
    ];
    const objectFields = [
      'date', 'focalId', 'startTime', 'endTime', 'foodName', 'foodPart'
    ];

    this.setState({status: "Exporting foods"});
    await this._exportObjectsToCsv(foods, csvFilePath, csvFields, objectFields);
  }

  async _exportSpecies(species, path, prefix) {
    const csvFilePath = `${path}/${prefix}-other-species.csv`;
    const csvFields = [
      'OS_FOL_date', // display only date
      'OS_FOL_B_focal_AnimId',
      'OS_time_begin', // convert to English time
      'OS_time_end', // convert to English time
      'OS_OSL_local_species_name',
      'OS_duration'
    ];
    const objectFields = [
      'date', 'focalId', 'startTime', 'endTime', 'speciesName', 'speciesCount'
    ];

    this.setState({status: "Exporting species"});
    await this._exportObjectsToCsv(species, csvFilePath, csvFields, objectFields);
  }

  async _exportGrooming(followArrivals, path, prefix) {
    const csvFilePath = `${path}/${prefix}-groom-scan-15.csv`;
    const csvFields = [
      'GRM15_date',
      'GRM15_focal',
      'GRM15_scan_time',
      'GRM15_partner_ID',
      'GRM15_direction'
    ];
    const objectFields = [
      'date', 'focalId', 'startTime', 'chimpId', 'grooming'
    ];

    this.setState({status: "Exporting grooming"});
    await this._exportObjectsToCsv(followArrivals, csvFilePath, csvFields, objectFields);
  }

  async _exportArmsReach(followArrivals, path, prefix) {
    const csvFilePath = `${path}/${prefix}-arms-reach.csv`;
    const csvFields = [
      'AR_date',
      'AR_focal',
      'AR_scan_time',
      'AR_partner_ID'
    ];
    const objectFields = [
      'date', 'focalId', 'startTime', 'chimpId'
    ];

    this.setState({status: "Exporting Arms Reach"});
    await this._exportObjectsToCsv(followArrivals, csvFilePath, csvFields, objectFields);
  }

  async _exportFiveMeter(followArrivals, path, prefix) {
    const csvFilePath = `${path}/${prefix}-five-meter.csv`;
    const csvFields = [
      '5M_date',
      '5M_focal',
      '5M_scan_time',
      '5M_partner_ID'
    ];
    const objectFields = [
      'date', 'focalId', 'startTime', 'chimpId'
    ];

    this.setState({status: "Exporting 5m"});
    await this._exportObjectsToCsv(followArrivals, csvFilePath, csvFields, objectFields);
  }

  async _exportMapLocation(locationOutputs, path, prefix) {
    const csvFilePath = `${path}/${prefix}-map-location.csv`;
    const csvFields = [
      'FML_FOL_date',
      'FML_FOL_B_focal_AnimID',
      'FML_time',
      'FML_seq_num',
      'FML_x_coord',
      'FML_y_coord',
      'FML_meters_to_next_seq_num',
      'FML_community_id',
    ];
    const objectFields = [
      'date', 'focalId', 'followStartTime', 'seqNum', 'x', 'y', 'distanceToNext','communityId'
    ];

    this.setState({status: "Exporting Map locations"});
    await this._exportObjectsToCsv(locationOutputs, csvFilePath, csvFields, objectFields);
  }

  async _exportObjectsToCsv(objects, filePath, csvFields, objectFields) {
    const fileExists = await RNFS.exists(filePath);

    var csvContent = "";
    if (!fileExists) {
      csvContent += csvFields.join(",");
    }
    assert(csvFields.length === objectFields.length);
    for (let i = 0; i < objects.length; ++i) {
      object = objects[i];
      const data = objectFields.map((of, i) => object[of].toString());
      csvContent += '\n' + data.join(",");
    }
    if (fileExists) {
      await RNFS.appendFile(filePath, csvContent, 'utf8');
    } else {
      await RNFS.writeFile(filePath, csvContent, 'utf8');
    }
  }

  openEmailClient(attachmentPath) {
    console.log(format("=== openEmailClient {0} ===", attachmentPath));
    this.setState({status: "Opening email client"});
    Mailer.mail({
      subject: 'JGI DigiTiki Data Export',
      recipients: [],
      ccRecipients: [],
      bccRecipients: [],
      body: '',
      attachment: {
        path: attachmentPath,  // The absolute path of the file from which to read data.
        type: 'zip',   // Mime Type: jpg, png, doc, ppt, html, pdf
        name: 'data.zip',   // Optional: Custom filename for attachment
      }
    }, (error, event) => {
      if(error) {
        ToastAndroid.show(strings.ExportData_SetUpEmailPrompt, ToastAndroid.SHORT);
        this.setState({status: "Error opening email client"});
        console.log(error);
      }
    });
  }
}

const mapStateToProps = (state) => {
    return {
      selectedLanguageStrings: state.selectedLanguageStrings
    }
}

export default connect(mapStateToProps, actions)(ExportDataScreen);

const styles = {
  container: {
    flex: 1,
    width: undefined,
    height: undefined,
    backgroundColor:'white',
    alignItems: 'center',
    paddingTop: 30
  },
  header: {
    alignSelf: "stretch",
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 15,
    fontSize: 18,
    textAlign: 'left',
    backgroundColor: '#ececec',
    color: 'black'
  },
  description: {
    alignSelf: 'stretch',
    marginTop: 100,
    marginBottom: 30,
    fontSize: 44,
    textAlign: 'center',
    lineHeight: 40,
    color: 'black'
  },
  menuBtn: {
    width: 500,
    marginTop: 20,
    marginBottom: 20
  },
  dateInputGroup: {
    flexDirection: 'row',
  },
  dateInput: {
    fontSize: 20,
    marginLeft: 10,
    marginRight: 10
  },
  dateInputText: {
    borderBottomWidth: 1,
    paddingLeft: 10,
    paddingRight: 10
  },
  followCountText: {
    marginTop: 10,
    fontSize: 15
  }
};
