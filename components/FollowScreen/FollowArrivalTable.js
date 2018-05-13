import React, { Component } from 'react';
import {
  Dimensions,
  ListView,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import Button from 'react-native-button';
import Util from '../util';
import sharedStyles from '../SharedStyles';

const infoButtonImages = {
  'deleted': require('../../img/time-empty.png'),
  'arriveFirst': require('../../img/time-arrive-first.png'),
  'arriveSecond': require('../../img/time-arrive-second.png'),
  'arriveThird': require('../../img/time-arrive-third.png'),
  'arriveContinues': require('../../img/time-arrive-continues.png'),
  'departFirst': require('../../img/time-depart-first.png'),
  'departSecond': require('../../img/time-depart-second.png'),
  'departThird': require('../../img/time-depart-third.png')
};


const PanelType = Object.freeze({
  'time': 1,
  'certainty': 2,
  'estrus': 3,
  'isWithIn5m': 4,
  'isNearestNeighbor': 5,
  'grooming': 6
});

class Panel extends Component {
  render() {
    const optionButtons = this.props.options.map((o, i) => {
      return (<Button
          key={o}
          onPress={()=> {
            this.props.onValueChange(this.props.values[i]);
          }}
          style={styles.panelOptionButton}
          >{o}</Button>);
    });
    return (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text>{this.props.title}</Text>
          {optionButtons}
        </View>
    );
  }
}


export default class FollowArrivalTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedChimp: null,
      panelType: PanelType.time,
      arrival: this.props.followArrivals
    };

    this.panels = {};
    const arrivalButtons = ['deleted', 'arriveFirst', 'arriveSecond', 'arriveThird', 'arriveContinues']
        .map((t, i) => this.createInfoPanelButton(t, i, false));
    const departureButtons = ['departFirst', 'departSecond', 'departThird']
        .map((t, i) => this.createInfoPanelButton(t, i, true));

    this.panels[PanelType.time] = arrivalButtons.concat(departureButtons);

    const certaintyOrder = ['null', 'certain', 'uncertain', 'nestCertain', 'nestUncertain'];
    const certaintyOptions = certaintyOrder.map((c, i) => Util.certaintyLabelsUser[c]);
    const certaintyValues = certaintyOrder.map((c, i) => Util.certaintyLabels[c]);

    const estrusOrder = ['a', 'b', 'c', 'd', 'e'];
    const estrusOptions = estrusOrder.map((e, i) => Util.estrusLabelsUser[e]);
    const estrusValues = estrusOrder.map((e, i) => Util.estrusLabels[e]);

    this.panels[PanelType.certainty] =
        (<Panel
            title={"Certainty:"}
            options={certaintyOptions}
            values={certaintyValues}
            onValueChange={(v) => {this.props.updateArrival('certainty', v);}}
        />);
    this.panels[PanelType.estrus] =
        (<Panel
            title={"Uvimbe:"}
            options={estrusOptions}
            values={estrusValues}
            onValueChange={(v) => {this.props.updateArrival('estrus', v)}}
        />);
    this.panels[PanelType.isWithIn5m] =
        (<Panel
            title={"Ndani ya 5m:"}
            options={['✓', '']}
            values={[true, false]}
            onValueChange={(v) => {this.props.updateArrival('isWithin5m', v)}}
        />);
    this.panels[PanelType.isNearestNeighbor] =
        (<Panel
            title={"Jirani wa karibu:"}
            options={['✓', '']}
            values={[true, false]}
            onValueChange={(v) => {this.props.updateArrival('isNearestNeighbor', v)}}
        />);
    this.panels[PanelType.grooming] =
        (<Panel
            title={"Grooming:"}
            options={['None', 'Give', 'Receive', 'Mutual']}
            values={['N', 'G', 'R', 'M']}
            onValueChange={(v) => {this.props.updateArrival('grooming', v)}}
        />);

  }

  _onPanelButtonPress = (time) => {
    const selectedChimp = this.props.selectedChimp;
    if (selectedChimp !== null) {
      if (!(selectedChimp in this.props.followArrivals)) {
        if (time.startsWith('arrive')) { this.props.createNewArrival(selectedChimp, time); }
      } else {
        this.props.updateArrival('time', time)
      }
    }
  }

  _onRowPress = (c) => {
    this.props.onSelectChimp(c.name);
  }

  createInfoPanelButton = (n, i, isDeparture) => {
    return (
      <TouchableOpacity
          key={n}
          style={{width: 50, height: 50, paddingTop: 5, paddingLeft: 5}}
          onPress={() => {
            this._onPanelButtonPress(n)}
          }
      >
        <Image
            style={{
              width: 40, height: 40
            }}
            source={infoButtonImages[n]}
        />
      </TouchableOpacity>
    );
  }

  createChimpRow = (c, i) => {
    const isSelected = c.name === this.props.selectedChimp;
    const isFocal = c.name === this.props.focalChimpId;
    const isMale = c.sex === 'M';
    const chimpButtonStyles = isSelected ? chimpButtonStylesSelected : (isFocal ? chimpButtonStylesFocal : chimpButtonStylesNonFocal);
    const hasFollowed = c.name in this.state.arrival;
    if (!hasFollowed) {
      return (
          <TouchableOpacity
              key={c.name}
              onPress={()=> {
                this._onRowPress(c);
                this.setState({panelType: PanelType.time});
              }}
              style={styles.chimpRow}>
              <Button style={chimpButtonStyles} onPress={()=> {
                this._onRowPress(c);
                this.setState({panelType: PanelType.time});
              }} >{c.name}</Button>
          </TouchableOpacity>
      );
    }

    const followArrival = this.state.arrival[c.name];
    const certaintyLabel = Util.certaintyLabelsDb2UserMap[followArrival.certainty];
    const estrusLabel = Util.estrusLabelsDb2UserMap[followArrival.estrus];
    const isWithin5mLabel = followArrival.isWithin5m ? '✓' : '';
    const isNearestNeighborLabel = followArrival.isNearestNeighbor ? '✓' : '';
    const groomingLabel = followArrival.grooming === 'N' ? '' : followArrival.grooming.charAt(0);

    if (isMale) {
      return (
          <TouchableOpacity
              key={c.name}
              style={styles.chimpRow}
              onPress={() => {
                this._onRowPress(c)
                this.setState({panelType: PanelType.time});
              }}
          >
              <Button style={chimpButtonStyles} onPress={() => {
                this._onRowPress(c)
                this.setState({panelType: PanelType.time});
              }}>{c.name}</Button>

              <Image source={infoButtonImages[followArrival.time]}/>

              <Button style={[styles.followArrivalTableBtn]} onPress={() => {
                this._onRowPress(c)
                this.setState({panelType: PanelType.certainty});
              }} >{certaintyLabel}</Button>

              <Button style={[styles.followArrivalTableBtn]} onPress={() => {
                this._onRowPress(c)
                this.setState({panelType: PanelType.isWithIn5m});
              }} >{isWithin5mLabel}</Button>

              <Button style={[styles.followArrivalTableBtn]} onPress={() => {
                this._onRowPress(c)
                this.setState({panelType: PanelType.isNearestNeighbor});
              }} >{isNearestNeighborLabel}</Button>

              <Button style={[styles.followArrivalTableBtn]} onPress={() => {
                this._onRowPress(c)
                this.setState({panelType: PanelType.grooming});
              }} >{groomingLabel}</Button>
          </TouchableOpacity>
      );
    }
    return (
        <TouchableOpacity
            key={c.name}
            style={styles.chimpRow}
            onPress={() => {
              this._onRowPress(c)
              this.setState({panelType: PanelType.time});
            }}
        >
            <Button style={chimpButtonStyles} onPress={() => {
              this._onRowPress(c)
              this.setState({panelType: PanelType.time});
            }} >{c.name}</Button>

            <Image source={infoButtonImages[followArrival.time]}/>

            <Button style={[styles.followArrivalTableBtn]} onPress={() => {
              this._onRowPress(c)
              this.setState({panelType: PanelType.certainty});
            }} >{certaintyLabel}</Button>

            <Button style={[styles.followArrivalTableBtn]} onPress={() => {
              this._onRowPress(c)
              this.setState({panelType: PanelType.estrus});
            }} >{estrusLabel}</Button>

            <Button style={[styles.followArrivalTableBtn]} onPress={() => {
              this._onRowPress(c)
              this.setState({panelType: PanelType.isWithIn5m});
            }} >{isWithin5mLabel}</Button>

            <Button style={[styles.followArrivalTableBtn]} onPress={() => {
              this._onRowPress(c)
              this.setState({panelType: PanelType.isNearestNeighbor});
            }} >{isNearestNeighborLabel}</Button>

            <Button style={[styles.followArrivalTableBtn]} onPress={() => {
              this._onRowPress(c)
              this.setState({panelType: PanelType.grooming});
            }} >{groomingLabel}</Button>
        </TouchableOpacity>
    );
  }

  render() {

    const femaleChimps = this.props.femaleChimpsSorted;
    const maleChimps = this.props.maleChimpsSorted;

    const femaleChimpRows = femaleChimps.map(this.createChimpRow);
    const maleChimpRows = maleChimps.map(this.createChimpRow);

    return (
        <View style={styles.container}>
          <View style={styles.infoPanel}>
              {this.panels[this.state.panelType]}
          </View>
          <View style={{flexDirection: 'row', height: 700}}>
            <View style={[styles.male]}>
              <View style={styles.followButtonLabelGroup}>
                <Text style={styles.followButtonLabel}>C</Text>
                <Text style={styles.followButtonLabel}>5m</Text>
                <Text style={styles.followButtonLabel}>JK</Text>
                <Text style={styles.followButtonLabel}>G</Text>
              </View>
              <ScrollView
                contentContainerStyle={[styles.list, {paddingRight: 5}]}
              >
                <View style={[styles.chimpRowGroup, styles.male]}>
                  {maleChimpRows}
                </View>
              </ScrollView>
            </View>
            <View style={[styles.female, styles.chimpRowGroupFemale]}>
              <View style={styles.followButtonLabelGroup}>
                <Text style={styles.followButtonLabel}>C</Text>
                <Text style={styles.followButtonLabel}>U</Text>
                <Text style={styles.followButtonLabel}>5m</Text>
                <Text style={styles.followButtonLabel}>JK</Text>
                <Text style={styles.followButtonLabel}>G</Text>
              </View>
              <ScrollView
                  contentContainerStyle={[styles.list, {paddingLeft: 5}]}
              >
                <View style={[styles.chimpRowGroup]}>
                  {femaleChimpRows}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
    );
  }
}

const padding = 10;
const unitWidth = (Dimensions.get('window').width - 5 * padding) / 13.0;
const maleWidth = unitWidth * 6 + 1.5 * padding;
const femaleWidth = unitWidth * 7 + 1.5 * padding;


const styles = StyleSheet.create({
  Button: {
    backgroundColor: '#ececec',
    elevation: 0,
    borderRadius: 0
  },
  container: {
    alignSelf: 'stretch',
    paddingLeft: padding,
    paddingRight: padding
  },
  list: {
    paddingBottom: 90
  },
  infoPanel: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    marginBottom: 10,
    borderWidth: 1,
    paddingTop: 10,
    paddingBottom: 10
  },
  followButtonLabelGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 20,
  },
  followButtonLabel: {
    width: unitWidth + 5,
    textAlign: 'center',
    fontWeight: "500"
  },
  borderBottom: {
    borderBottomColor: 'black',
    borderBottomWidth: 2,
  },
  male: {
    width: maleWidth
  },
  female: {
    width: femaleWidth
  },
  panelOptionButton: {
    width: 70,
    backgroundColor: '#ececec',
    color: 'black',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 3,
    paddingRight: 3,
    marginLeft: 2,
    marginRight: 2,
    borderColor: '#ddd',
    borderWidth: 1,
    flex: 1,
    fontSize: 14,
  },
  chimpRowGroup: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  chimpRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    height: 40
  },

  followArrivalTableBtn: {
    width: unitWidth,
    backgroundColor: '#ececec',
    color: 'black',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 3,
    paddingRight: 3,
    borderColor: '#ddd',
    borderWidth: 1,
    flex: 1,
    fontSize: 14,
  },
  chimpRowGroupFemale: {
    borderLeftColor: 'black',
    borderLeftWidth: 2,
  }
});

const chimpButtonStylesNonFocal = styles.followArrivalTableBtn;
const chimpButtonStylesFocal = [styles.followArrivalTableBtn, sharedStyles.btnPrimary];
const chimpButtonStylesSelected = [styles.followArrivalTableBtn, sharedStyles.btnSuccess];
