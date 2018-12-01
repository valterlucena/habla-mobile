import * as React from "react";
import firebase from 'firebase';
import { client } from "../../services/client";
import gql from "graphql-tag";
import { AsyncStorage } from "react-native";
export default class AppLoadingScreen extends React.Component<any, any> {
  constructor(props) {
    super(props);

    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        let token = await firebase.auth().currentUser.getIdToken();
        console.log(token);

        const storedProfile = await AsyncStorage.getItem('userProfile');
        
        let profile = storedProfile? JSON.parse(await AsyncStorage.getItem('userProfile')): null;

        if (!profile) {
          try {
            const response = await client.query({
              query: gql(`
                {
                  profile(uid: "${user.uid}") {
                    uid
                    name
                    username
                    bio
                    website
                    phone
                    gender
                  }
                }
              `),
              fetchPolicy: 'no-cache'
            });

            profile = (response.data as any).profile;
          } catch (error) {
            console.log(JSON.stringify(error));
          }
        }

        if (profile) {
          await AsyncStorage.setItem('userProfile', JSON.stringify(profile));

          this.props.navigation.navigate('TabsNavigator');
        } else {
          this.props.navigation.navigate('ProfileCreationScreen', { user: user });
        }

        return;
      }
     
      this.props.navigation.navigate('LoginScreen');
      await AsyncStorage.removeItem('userProfile');
    });

    console.disableYellowBox = true;
  }

  render() {
    return null;
  }
}