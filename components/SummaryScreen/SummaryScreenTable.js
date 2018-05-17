import React, { Component } from 'react';
import {
  AppRegistry,
  BackAndroid,
  Dimensions,
  Image,
  ScrollView,
  TouchableHighlight,
  Text,
  TextInput,
  View
} from 'react-native';
import assert from 'assert';
import { Col, Row, Grid } from "react-native-easy-grid";

import Orientation from 'react-native-orientation';
import realm from '../../models/realm';
import sharedStyles from '../SharedStyles';
import strings from '../../data/strings';
import Util from '../util';
import times from '../../data/time-list.json';

class SummaryScreenTableCell extends Component {

  render() {
    let cellStyles = [styles.cell];
    if (this.props.shouldHighlight) {
      cellStyles.push(styles.cellHighlight);
    }

    if (this.props.isSwelled) {
      cellStyles.push(styles.cellSwelled);
    }

    return (
      <View style={cellStyles}>
        <Text style={styles.cellCertaintyText}>{this.props.certaintyText}</Text>
      </View>
    );
  }
}

class SummaryScreenTableChimpCol extends Component {

  render() {
    const cells = ([...Array(this.props.rows||0)])
        .map((v, i) => {
            const index = this.props.timeIndices.indexOf(i);
            return (<SummaryScreenTableCell
              key={i}
              shouldHighlight={index !== -1}
              certaintyText={this.props.certaintyTexts[index]}
              isSwelled={this.props.isSwelleds[index]}
            />);
        });

    let titleStyles = [styles.chimpColTitle];
    if (this.props.isFocalChimp) {
      titleStyles.push(sharedStyles.btnPrimary);
    }

    return (
        <View style={styles.chimpCol}>
          <View style={titleStyles}>
            <Text style={styles.chimpColTitleText}>{this.props.chimpId}</Text>
          </View>
          {cells}
        </View>
    );
  }

}

export default class SummaryScreenTable extends Component {

  createChimpCol(chimpId, i, rows, isFocalChimp) {

    assert(chimpId in this.props.followArrivalSummary);
    const timeIndices = this.props.followArrivalSummary[chimpId]
        .map((fa, i) => this.props.times.indexOf(fa.followStartTime) - this.props.times.indexOf(this.props.followStartTime))
    const certaintyTexts = this.props.followArrivalSummary[chimpId]
        .map((fa, i) => fa.certainty <= 2 ? Util.certaintyLabelsDb2UserMap[fa.certainty] : "");
    const isSwelleds = this.props.followArrivalSummary[chimpId]
      .map((fa, i) => (fa.estrus == 100));

    return (
      <SummaryScreenTableChimpCol
          key={i}
          chimpId={chimpId}
          rows={rows}
          isFocalChimp={isFocalChimp}
          isSwelleds={isSwelleds}
          timeIndices={timeIndices}
          certaintyTexts={certaintyTexts}
        />
    );
  }

  createItemCol(title, rows, intervals) {
    const cells = ([...Array(intervals)])
        .map((v, i) => (
          <SummaryScreenTableCell key={i} certaintyText={rows[i]} />
        ));
    return (
        <View style={styles.itemCol}>
          <View style={styles.chimpColTitle}>
            <Text style={styles.itemColTitleText}>{title}</Text>
          </View>
          {cells}
        </View>
    );
  }

  createTimeRow(dbTime, i, onTimeSelected, shouldAllowAction) {
    return (
        <TouchableHighlight
            key={i}
            style={styles.timeRow}
            onPress={()=>{
              if (shouldAllowAction === true) {
                onTimeSelected(dbTime);
              }
            }}>
          <Text style={styles.timeRowText}>{Util.dbTime2UserTime(dbTime)} </Text>
        </TouchableHighlight>
    );
  }

  createTimedList(category, items, intervals) {
    let itemList = [];

    for (var i = 0; i < intervals; i++) {
      itemList[i] = []
    }

    if (category == "Food") {
      for (var k in items) {
        let n = k.endInterval - k.startInterval + 1;
        let food = items[k].foodName + " " + items[k].foodPart;
        for (var i = items[k].startInterval; i <= items[k].endInterval; i++) {
          itemList[i].push(food);
        }
      }
    }

    if (category == "Species") {
      for (var k in items) {
        let n = k.endInterval - k.startInterval + 1;
        let species = items[k].speciesName + " " + items[k].speciesCount;
        for (var i = items[k].startInterval; i <= items[k].endInterval; i++) {
          itemList[i].push(species);
        }
      }
    }

    let rowText = []
    for (var k in itemList) {
        rowText.push(itemList[k].join(", "));
    }
    return rowText;
  }

  render() {

    const startTimeIndex = this.props.times.indexOf(this.props.followStartTime);
    const endTimeIndex = this.props.times.indexOf(this.props.followEndTime);
    const timeLength = endTimeIndex - startTimeIndex + 1;
    const timeCol = this.props.times.slice(startTimeIndex, endTimeIndex + 2)
        .map((t, i) => {
          const isLast = i === (timeLength);
          // Disable action for the last time.
          return this.createTimeRow(t, i, this.props.onFollowTimeSelected, !isLast);
        });

    const intervals = endTimeIndex - startTimeIndex + 1;

    const maleChimpCols = this.props.chimps.filter((c) => c.sex == 'M' && c.community == this.props.community)
                  .map((c, i) => this.createChimpCol(c.name, i, intervals, c.name === this.props.focalChimpId));

    const femaleChimpCols = this.props.chimps.filter((c) => c.sex == 'F' && c.community == this.props.community)
        .map((c, i) => this.createChimpCol(c.name, i, intervals, c.name === this.props.focalChimpId));

    const foodList = this.createTimedList("Food", this.props.food, intervals);
    const speciesList = this.createTimedList("Species", this.props.species, intervals);
    const foodCol = this.createItemCol("Food", foodList, intervals);
    const speciesCol = this.createItemCol("Species", speciesList, intervals);

    return(
        <View style={styles.container}>
          <ScrollView
            style={styles.verticalScrollView}>
            <ScrollView
              horizontal={true}>
              <View style={styles.timeGroups}>
                {timeCol}
              </View>
              <View style={styles.colGroup}>
                {maleChimpCols}
              </View>
              <View style={styles.colGroup}>
                {foodCol}
              </View>
              <View style={styles.colGroup}>
                {femaleChimpCols}
              </View>
              <View style={styles.colGroup}>
                {speciesCol}
              </View>
              <View style={styles.timeGroups}>
                {timeCol}
              </View>
            </ScrollView>
          </ScrollView>
        </View>
    );
  }
}

const styles = {
  container: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    paddingTop: 10,
    paddingBottom: 30
  },
  verticalScrollView: {
    marginBottom: 30
  },
  chimpColTitle: {
    borderBottomWidth: 1,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    borderWidth: 0.5,
  },
  chimpColTitleText: {
    transform: [{ rotate: '270deg'}],
    width: 50,
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold'
  },
  colGroup: {
    flexDirection: 'row',
  },
  chimpCol: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    width: 30,
  },
  itemCol: {
    width: 100,
  },
  itemColTitleText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timeRow: {
    marginBottom: 13,
  },
  timeRowText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#33b5e5'
  },
  cell: {
    height: 30,
    borderWidth: 0.5,
  },
  cellHighlight: {
    backgroundColor: '#ddd'
  },
  cellSwelled: {
    backgroundColor: '#F48FB1',
  },
  timeGroups: {
    paddingTop: 42,
    width: 40
  },
  cellCertaintyText: {
    textAlign: 'center'
  }
}
