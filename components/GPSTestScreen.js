import React, { Component } from 'react';
import {
  Button,
  Text,
  View
} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';

export default class GPSTestScreen extends Component {

  intervalId: ?number = null;
  watchId: ?number = null;

  constructor(props) {
    super(props);

    this.state = {
      geolocationHistory: [],
      lastGPSrecordDateTime: '-',
      currentGeolocation: [0, 0],
      initialPosition: 'unknown',
      lastPosition: 'unknown',
      timerTimeout: 0,
      timerInterval: 5*60*1000, // 15*60*1000
    }
  }

  componentDidMount() {
    try {
      console.log("Timer running ", intervalId);
    } catch (e) {
      console.log("No timers running");
      this.restartTimer();
    }
  }

  componentWillUnmount() {
    BackgroundTimer.clearInterval(intervalId);
    navigator.geolocation.clearWatch(watchId);
  }

  getGPSnow() {
    console.log("Get GPS now");

    watchId = navigator.geolocation.getCurrentPosition((position) => {
      console.log("Got GPS position")
      const dateTime = new Date();
      var dateTimeString = dateTime.getHours().toString() + 'H :' + dateTime.getMinutes().toString() + 'M: ' + dateTime.getSeconds().toString() + 'S';

      this.setState({ lastGPSrecordDateTime: dateTimeString })
      this.setState({ currentGeolocation: [position.coords.longitude, position.coords.latitude] });
      this.setState({ geolocationHistory: [...this.state.geolocationHistory, [position.coords.longitude, position.coords.latitude]]});
    }, (error) => {
        console.log("Couldn't get lock");
        this.setState({ currentGeolocation: ['x', 'x']});
        this.getGPSnow();
    },
    {
      enableHighAccuracy: true, // FINE_LOCATION
      timeout: 2*60*1000, // wait for signal for 2 minutes, then call ErrorCallback
      maximumAge: 3*60*1000 // maximumAge should be less than timerInterval
    }
  );
  }

  changeGPSInterval(interval) {
    console.log("GPS Timer Interval: ", interval);
    this.setState({ timerInterval: interval*1000 });
    this.setState({ timerTimeout: interval*1000 });
    BackgroundTimer.clearInterval(intervalId);
    this.restartTimer();
  }

  restartTimer() {
    console.log("Timer started for: ", this.state.timerInterval);
    this.getGPSnow();

    intervalId = BackgroundTimer.setInterval(() => {
        this.getGPSnow();
      }, this.state.timerInterval);
  }

  render() {
    return(
      <View>
        <Button title="Get GPS now" onPress={() => this.getGPSnow() }></Button>
        <Text>Last location recorded at: { this.state.lastGPSrecordDateTime }</Text>
        <Text>Lat: { this.state.currentGeolocation[0] } </Text>
        <Text>Lat: { this.state.currentGeolocation[1] } </Text>
        <Text>GPS Location Interval: { this.state.timerInterval / 1000 } sec</Text>
        <Button title="Get location every 5 seconds" onPress={() => this.changeGPSInterval(5)}></Button>
        <Button title="Get location every 5 minutes" onPress={() => this.changeGPSInterval(5*60)}></Button>
        <Button title="Get location every 15 minutes" onPress={() => this.changeGPSInterval(15*60)}></Button>
        <Text>{ this.state.geolocationHistory }</Text>
      </View>
    )
  }

}

const styles = {
}
