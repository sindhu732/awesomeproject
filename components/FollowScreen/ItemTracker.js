import React, { Component } from 'react';
import {
  AppRegistry,
  Button,
  StyleSheet,
  Modal,
  Picker,
  View
} from 'react-native';
import sharedStyles from '../SharedStyles';

export default class ItemTracker extends Component {
  state = {
    dummyActiveItem: null,
    dummyFinishedItem: null
  };

  render() {

    const activePickerItems = [this.props.activeListTitle].concat(this.props.activeItems)
        .map((item, i) => {
          return (<Picker.Item
            key={i}
            label={i !== 0 ? item.name : item}
            value={i !== 0 ? item.id : null} />);
        });

    const finishedPickerItems = [this.props.finishedListTitle].concat(this.props.finishedItems)
        .map((item, i) => {
          return (<Picker.Item
            key={i}
            label={i !== 0 ? item.name : item}
            value={i !== 0 ? item.id : null} />);
        });

    return (
        <View style={styles.row}>
          <Button
              style={sharedStyles.btn}
              onPress={()=>{this.props.onTrigger();}} title={this.props.title}></Button>

          <Picker style={[styles.picker, activePickerItems.length === 1 ? styles.hidden : {}]}
                  onValueChange={(v) => {
                    if (v !== null) {
                      this.props.onSelectActiveItem(v);
                    }
                  }}
                  selectedValue={this.state.dummyActiveItem}
          >
            {activePickerItems}
          </Picker>

          <Picker style={[styles.picker, finishedPickerItems.length === 1 ? styles.hidden : {}]}
                  onValueChange={(v) => {this.props.onSelectFinishedItem(v);}}
                  selectedValue={this.state.dummyFinishedItem}
          >
            {finishedPickerItems}
          </Picker>

        </View>
    )
  }
}

const styles = {
  row: {
    flex:1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    alignItems: 'center',
    height: 50,
  },
  picker: {
    width: 200,
    height: 35
  },
  hidden: {
    height: 0,
    width: 0,
    opacity: 0
  }
};
