import React, {Component} from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import TimelineScreen from './screens/timeline/timeline';
import { createStackNavigator } from 'react-navigation';

const Navigator = createStackNavigator({
  Timeline: TimelineScreen, 
});

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content"/>
        <Navigator/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
