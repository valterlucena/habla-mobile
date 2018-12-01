import React from 'react';
import TimelineScreen from './src/screens/timeline/timeline';
import { createBottomTabNavigator, createStackNavigator, createSwitchNavigator } from 'react-navigation';
import { FontAwesome } from '@expo/vector-icons';
import firebase from 'firebase';
import LoginScreen from './src/screens/login/login';
import ProfileScreen from './src/screens/profile/profile';
import PostScreen from './src/screens/post/post';
import AppLoadingScreen from './src/screens/app-loading/app-loading';
import ProfileCreationScreen from './src/screens/profile-creation/profile-creation';
import ChannelsScreen from './src/screens/channels/channels';

const firebaseConfig = require('./firebase.json');

firebase.initializeApp(firebaseConfig);

const TabsNavigator = createBottomTabNavigator({
  TimelineStack: createStackNavigator({
    TimelineScreen,
    ProfileScreen,
    PostScreen,
  }, {
    navigationOptions: {
      headerTintColor: 'white',
    }
  }),
  ChannelsStack: createStackNavigator({
    ChannelsScreen,
    TimelineScreen,
    ProfileScreen,
    PostScreen
  }, {
    navigationOptions: {
      headerTintColor: 'white',
    }
  }),
  ProfileStack: createStackNavigator({
    ProfileScreen,
    PostScreen
  }, {
    navigationOptions: {
      headerTintColor: 'white',
    }
  })
}, 
{
  navigationOptions: ({ navigation }) => ({
    tabBarOptions: {
      showLabel: false,
      activeTintColor: '#795548',
      style: {
        backgroundColor: '#F5F5F5',
        height: 60
      },
    },
    tabBarIcon: ({ focused, tintColor }) => {
      const { routeName } = navigation.state;
      const size = focused? 35: 25;

      if (routeName === 'TimelineStack') {
        return <FontAwesome name="home" size={size} color={tintColor}/>;
      } else if (routeName === 'ChannelsStack') {
        return <FontAwesome name="weixin" size={size} color={tintColor}/>;
      } else if (routeName === 'ProfileStack') {
        return <FontAwesome name="user" size={size} color={tintColor}/>;
      }
    },
  })
});

export default createSwitchNavigator({
    AppLoadingScreen,
    LoginScreen,
    TabsNavigator,
    ProfileCreationScreen
  },
);
  
