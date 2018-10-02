import React, {Component} from 'react';
import { StyleSheet, View, StatusBar, Platform, Text } from 'react-native';
import TimelineScreen from './src/screens/timeline/timeline';
import ChannelsScreen from './src/screens/channels/channels';
import { createBottomTabNavigator, createStackNavigator, createSwitchNavigator } from 'react-navigation';
import { FontAwesome } from '@expo/vector-icons';
import firebase from 'firebase';
import LoginScreen from './src/screens/login/login';
import ProfileScreen from './src/screens/profile/profile';
import PostScreen from './src/screens/post/post';
import AppLoadingScreen from './src/screens/app-loading/app-loading';

const firebaseConfig = require('./firebase.json');

firebase.initializeApp(firebaseConfig);

const TabsNavigator = createBottomTabNavigator({
  TimelineStack: createStackNavigator({
    TimelineScreen,
    ProfileScreen,
    PostScreen
  }),
  ChannelsStack: createStackNavigator({
    ChannelsScreen,
    TimelineScreen,
    ProfileScreen,
    PostScreen
  }),
  ProfileStack: createStackNavigator({
    ProfileScreen,
    PostScreen
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

export default createSwitchNavigator({
    AppLoadingScreen,
    LoginScreen,
    TabsNavigator,
  },
);
  
