import React, { Component } from 'react';
import {
  Button,
  Text,
  Modal,
  Picker,
  View
} from 'react-native';
import Util from '../util';
import sharedStyles from '../SharedStyles';

export default class ItemTrackerModal extends Component {

  state = {
    startTime: this.props.startTime,
    endTime: this.props.endTime,
    startInterval: this.props.startInterval,
    endInterval: this.props.endInterval,
    mainSelection: this.props.mainSelection,
    secondarySelection: this.props.secondarySelection,
    isEditing: this.props.startTime !== null,
    itemId: this.props.itemId ? this.props.itemId : null
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      startTime: nextProps.initialStartTime,
      endTime: nextProps.initialEndTime,
      startInterval: nextProps.initialStartInterval,
      endInterval: nextProps.initialEndInterval,
      mainSelection: nextProps.initialMainSelection,
      secondarySelection: nextProps.initialSecondarySelection,
      isEditing: nextProps.initialStartTime !== null,
      itemId: nextProps.itemId ? nextProps.itemId : null
    });
  }

  render() {
    const strings = this.props.strings;
    const mainPickerItems = this.props.mainList.map((e, i) => {
      return (<Picker.Item key={i} label={e[1]} value={e[0]} />);
    });

    const secondaryPickerItems = this.props.secondaryList.map((e, i) => {
      return (<Picker.Item key={i} label={e[1]} value={e[0]} />);
    });

    let isTrackedBefore = false;
    if (this.state.startTime !== undefined && this.state.startTime !== null) {
      isTrackedBefore = Util.compareUserTime(this.state.startTime, Util.dbTime2UserTime(this.props.beginFollowTime)) === -1;
    }

    let timePickerItems = Util.getTrackerTimes(Util.dbTime2UserTime(this.props.beginFollowTime))
        .map((e, i) => {
          return (<Picker.Item key={i} label={e} value={e} />);
        });
    if (isTrackedBefore) {
      timePickerItems.unshift((<Picker.Item key={-1} label={this.state.startTime} value={this.state.startTime} />));
    }
    timePickerItems.unshift((<Picker.Item key={-2} label={strings.TimeFormat} value='ongoing' />));

    return (
        <Modal
            style={styles.modal}
            animationType={"slide"}
            transparent={false}
            visible={this.props.visible}
            onRequestClose={() => {alert("Modal has been closed.")}}
        >
          <View style={{marginTop: 22}}>
            <View style={styles.modalHeader}>
              <Button
                  style={sharedStyles.btn}
                  styleDisabled={{opacity: 0.5}}
                  disabled={
                    [this.state.mainSelection, this.state.secondarySelection, this.state.startTime]
                        .some(x => x === null) || (this.state.endTime !== 'ongoing' && this.state.endTime < this.state.startTime)
                  }
                  onPress={() => {
                    const data = {
                      itemId: this.state.itemId,
                      mainSelection: this.state.mainSelection,
                      secondarySelection: this.state.secondarySelection,
                      startTime: this.state.startTime,
                      endTime: this.state.endTime !== null ? this.state.endTime : 'ongoing',
                      startInterval: this.state.startInterval,
                      endInterval: this.state.endInterval !== null ? this.state.endInterval : 0,
                    };
                    this.props.onSave(data, this.state.isEditing);
                    this.props.onDismiss();
                  }} title={strings.ItemTracker_Save} ></Button>

              <Text style={[sharedStyles.text.size.title, sharedStyles.text.color.normal]}>
                {this.props.title}
              </Text>

              <Button
                  style={sharedStyles.btn}
                  onPress={() => {
                    this.props.onDismiss();
                  }} title={strings.ItemTracker_Cancel} ></Button>
            </View>

            <View style={styles.timeSelectionGroup}>
              <Picker
                  selectedValue={this.state.startTime}
                  onValueChange={(v)=>{
                    this.setState({
                      startTime: v
                    })}
                  }
                  style={styles.timeSelectionPicker}
              >
                {timePickerItems}
              </Picker>
              <Text style={styles.timeSelectionToText}>{strings.ItemTracker_TimeTo}</Text>
              <Picker
                  selectedValue={this.state.endTime}
                  onValueChange={(v)=>{
                    this.setState({endTime: v})}
                  }
                  style={styles.timeSelectionPicker}
              >
                {timePickerItems}
              </Picker>
            </View>

            <Picker
                selectedValue={this.state.mainSelection}
                onValueChange={(v)=>{
                  this.setState({mainSelection: v})}
                }>
              {mainPickerItems}
            </Picker>

            <Picker
                selectedValue={this.state.secondarySelection}
                onValueChange={(v)=>{
                  this.setState({secondarySelection: v})}
                }>
              {secondaryPickerItems}
            </Picker>
          </View>
        </Modal>
    );
  }
}

const styles = {
  modal: {
    flex: 1
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    alignItems: 'center',
    height: 40,
    paddingLeft: 12,
    paddingRight: 12
  },
  headerRow: {
    flex:1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    alignItems: 'center',
    height: 50,
  },
  timeSelectionGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  timeSelectionToText: {
    fontSize: 16
  },
  timeSelectionPicker: {
    width: 250
  }
};
