import React, { Component } from 'react';
import {
  Button,
  Image,
  ImageBackground,
  TouchableHighlight,
  TouchableOpacity,
  Text,
  View
} from 'react-native';
import Orientation from 'react-native-orientation';
import deviceLog, {LogView, InMemoryAdapter} from 'react-native-device-log';
import * as actions from '../../reduxmgmt/actions';
import { connect } from 'react-redux';

import sharedStyles from '../SharedStyles';

class MenuScreen extends Component {

  _orientationDidChange(orientation) {
    console.log("_orientationDidChange", orientation);
    if (orientation == 'LANDSCAPE') {
      //do something with landscape layout
    } else {
      //do something with portrait layout
    }
  }

  componentDidMount() {
    Orientation.lockToPortrait();
    Orientation.addOrientationListener(this._orientationDidChange);
    this.increment();
  }

  increment() {
    this.props.reduxState();
  }

  render() {

    const strings = this.props.screenProps.localizedStrings;
    //const strings = "en";

    return(
      <ImageBackground source={require('../../img/chimp.png')} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Jane Goodall Institute</Text>
          <TouchableHighlight
            onPress={() => {this.props.navigation.navigate('SettingsScreen');}}>
            <View style={styles.settingsButtonWrapper}>
              <Image source={require('../../img/settings.png')}></Image>
            </View>
          </TouchableHighlight>
        </View>


        <Text style={styles.description}>{strings.Menu_Title}</Text>

        <TouchableOpacity onPress={() => { this.props.navigation.navigate('NewFollowScreen');}}
        style={styles.menuBtn}>
            <Text style={styles.menuBtnText}> {strings.Menu_NewFollow} </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { this.props.navigation.navigate('FollowListScreen');}}
        style={styles.menuBtn}>
            <Text style={styles.menuBtnText}> {strings.Menu_ContinueFollow} </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { this.props.navigation.navigate('ExportDataScreen');}}
        style={styles.menuBtn}>
            <Text style={styles.menuBtnText}> {strings.Menu_ExportData} </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { this.props.navigation.navigate('GPSTestScreen');}}
        style={styles.menuBtn}>
            <Text style={styles.menuBtnText}> GPS Monitor </Text>
        </TouchableOpacity>

        <View>
          <Button title="Up" onPress={ () => this.increment() }/>
          <Text>
              {this.props.count}
          </Text>
        </View>

        <Text>Version: 0.3.6</Text>

      </ImageBackground>
    );
  }
}

const mapStateToProps = (state) => {
    return {
      count: state.count
    }
}

export default connect(mapStateToProps, actions)(MenuScreen);

const styles = {
  container: {
    flex: 1,
    width: undefined,
    height: undefined,
    backgroundColor:'white',
    alignItems: 'center',
    //resizeMode: Image.resizeMode.contain
  },
  header: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ececec',
  },
  headerText: {
    textAlign: 'left',
    fontSize: 18,
    color: 'black',
  },
  settingsButtonWrapper: {
    flexDirection: 'row',
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
  menuBtnText: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 15,
    paddingRight: 15,
    fontSize: 28,
    color: '#fff',
    backgroundColor: '#33b5e5',
    borderRadius: 3
  },
  menuBtn: {
    width: 500,
    marginTop: 20,
    marginBottom: 20
  }
};
