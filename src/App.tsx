import React, {Component} from 'react';
import { StyleSheet, View, StatusBar, Platform } from 'react-native';
import TimelineScreen from './screens/timeline/timeline';
import ChannelsScreen from './screens/channels/channels';
import { createBottomTabNavigator, createStackNavigator } from 'react-navigation';
import { FontAwesome } from '@expo/vector-icons';

const Navigator = createBottomTabNavigator({
  TimelineStack: createStackNavigator({
    TimelineScreen
  }),
  ChannelsStack: createStackNavigator({
    ChannelsScreen,
    TimelineScreen
  })
}, 
{
  navigationOptions: ({ navigation }) => ({
    tabBarOptions: {
      showLabel: false
    },
    tabBarIcon: ({ focused, tintColor }) => {
      let platformPrefix = Platform.OS === 'ios'? 'ios': 'md';

      const { routeName } = navigation.state;

      if (routeName === 'TimelineStack') {
        return <FontAwesome name="home" size={25} color={tintColor}/>;
      } else if (routeName === 'ChannelsStack') {
        return <FontAwesome name="weixin" size={25} color={tintColor}/>;
      }
    },
  })
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
