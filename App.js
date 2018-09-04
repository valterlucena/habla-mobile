import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import TimelineScreen from './screens/timeline/timeline';
import { createStackNavigator } from 'react-navigation';

const Navigator = createStackNavigator({
  Timeline: TimelineScreen
});

export default class App extends Component {
  render() {
    return (
      <Navigator/>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  }
});
