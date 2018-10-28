import * as React from "react";
import firebase from 'firebase';
import { api } from "../../services/api";
export default class AppLoadingScreen extends React.Component<any, any> {
    constructor(props) {
      super(props);
  
      firebase.auth().onAuthStateChanged(async user => {
        if (user) {
          let token = await firebase.auth().currentUser.getIdToken();
          console.log(token);

          try {
            let profile = await api.get('profiles/self');

            if (profile.status === 200) {
              this.props.navigation.navigate('TabsNavigator');
            } else {
              // handle
            }
          } catch (error) {
            console.log(JSON.stringify(error));
            if (error.response && error.response.status === 404) {
              // this.props.navigation.navigate('ProfileCreationScreen');
            }
          }
        } else {
          this.props.navigation.navigate('LoginScreen');
        }
      });
  
      console.disableYellowBox = true;
    }
  
    render() {
      return null;
    }
  }