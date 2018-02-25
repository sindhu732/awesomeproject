import React, {Component} from 'react';
import {
  BackAndroid,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { RadioButtons } from 'react-native-radio-buttons';
import assert from 'assert';

import SharedStyles from '../SharedStyles';

class LocalizedTextSettingRow extends Component {

  _onEndEditingHandler(language, text) {
    this.props.onLocalizedStringUpdated(language, this.props.localizedStringKey, text);
  }

  render() {
    return(
        <View style={styles.localizedTextSettingRow}>
          <Text>{this.props.localizedStringKey}</Text>
          <View style={styles.localizedTextSettingRowItemGroup}>
            <TextInput
                autoCorrect={false}
                style={styles.localizedTextSettingRowItem}
                onEndEditing={(event) => {this._onEndEditingHandler('en', event.nativeEvent.text)}}
            >
              {this.props.enString}
            </TextInput>
            <TextInput
                autoCorrect={false}
                style={styles.localizedTextSettingRowItem}
                onEndEditing={(event) => {this._onEndEditingHandler('sw', event.nativeEvent.text)}}
            >
              {this.props.swString}
            </TextInput>
          </View>
        </View>
    )
  }
}

export default class SettingsScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedLanguage: this.props.screenProps.language
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      selectedLanguage: nextProps.language
    });
  }

  componentWillMount() {
  }

  render() {

    const languageOptions = ["en", "sw"];

    function setSelectedOption(selectedOption){
      //this.props.onLanguageChanged(selectedOption);
      this.props.screenProps.language = selectedOption;
    }

    function renderOption(option, selected, onSelect, index){
      let optionStyles = [styles.languageOption];
      if (selected) {
        optionStyles.push(SharedStyles.btnPrimary, {color: 'white'});
      }

      return (
          <TouchableWithoutFeedback onPress={onSelect} key={index}>
            <View><Text style={optionStyles}>{option}</Text></View>
          </TouchableWithoutFeedback>
      );
    }

    function renderContainer(optionNodes){
      return <View style={styles.languageOptions}>{optionNodes}</View>;
    }

    let localizedTextSettingRows = [];
    for (const key in this.props.screenProps.enStrings) {
      localizedTextSettingRows.push(<LocalizedTextSettingRow
          key={key}
          onLocalizedStringUpdated={this.props.onLocalizedStringUpdated}
          localizedStringKey={key}
          enString={this.props.screenProps.enStrings[key]}
          swString={this.props.screenProps.swStrings[key]}
      />);
    }

    return(
     <View style={styles.container}>
       <Text>Settings</Text>
       <View style={styles.languageOptionsGroup}>
         <Text>Language: </Text>
         <RadioButtons
             options={ languageOptions }
             onSelection={setSelectedOption.bind(this) }
             selectedOption={ this.state.selectedLanguage }
             renderOption={ renderOption }
             renderContainer={ renderContainer }
         />
       </View>
       <ScrollView style={styles.localizedTextSettingRows}>
        {localizedTextSettingRows}
       </ScrollView>
     </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    alignItems: 'center'
  },
  languageOptionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageOptions: {
    flexDirection: 'row'
  },
  languageOption: {
    borderWidth: 1,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 50,
    paddingRight: 50
  },
  localizedTextSettingRows: {
    alignSelf: 'stretch',
  },
  localizedTextSettingRow: {
    alignSelf: 'stretch',
    flexDirection: 'column'
  },
  localizedTextSettingRowItemGroup: {
    alignSelf: 'stretch',
    flexDirection: 'row'
  },
  localizedTextSettingRowItem: {
    flex: 0.5
  }
};
