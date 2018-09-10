import React, {Component} from 'react';
import { StyleSheet, View, StatusBar, Platform, Text } from 'react-native';
import TimelineScreen from './screens/timeline/timeline';
import ChannelsScreen from './screens/channels/channels';
import { createBottomTabNavigator, createStackNavigator } from 'react-navigation';
import { FontAwesome } from '@expo/vector-icons';
import firebase from 'firebase';
import LoginScreen from './screens/login/login';
import ProfileScreen from './screens/profile/profile';

const Navigator = createBottomTabNavigator({
  TimelineStack: createStackNavigator({
    TimelineScreen,
    ProfileScreen
  }),
  ChannelsStack: createStackNavigator({
    ChannelsScreen,
    TimelineScreen,
    ProfileScreen
  }),
  ProfileStack: createStackNavigator({
    ProfileScreen
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
      } else if (routeName === 'ProfileStack') {
        return <FontAwesome name="user" size={25} color={tintColor}/>;
      }
    },
  })
});

export default class App extends Component<any, any> {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      ready: false
    };

    firebase.auth().onAuthStateChanged(user => {
      this.setState({
        ready: true,
        user: user
      });
    });

    console.disableYellowBox = true;
  }

  render() {
    if (this.state.ready) {
      return this.state.user?
      (<View style={styles.container}>
        <StatusBar barStyle="dark-content"/>
        <Navigator/>
      </View>): <LoginScreen></LoginScreen>;
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
