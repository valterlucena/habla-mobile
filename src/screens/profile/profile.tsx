import * as React from 'react';
import { StyleSheet, ScrollView, Text, View, RefreshControl, TouchableOpacity } from 'react-native';
import { api } from '../../services/api';
import firebase from 'firebase';

export default class ProfileScreen extends React.Component<ProfileScreenProps, ProfileScreenState> {
  static navigationOptions = {
    title: 'Profile', 
    headerStyle: {
      backgroundColor: 'white',
      borderBottomWidth: 0,
    },
    headerTitleStyle: {
      color: '#161616'
    }
  };

  constructor(props) {
    super(props);

    this.state = { profile: null, refreshing: false };
  }

  componentWillMount() {
    this.refresh();
  }

  refresh = async() => {
    let navProfile = this.props.navigation.state.params && this.props.navigation.state.params.profile;

    this.setState({ refreshing: true });

    try {
      let profile = await api.get(`profiles/${navProfile? navProfile.uid: 'self'}`);

      this.setState({ profile: profile.data });
    } catch (error) {
      console.log(error);
    }

    this.setState({ refreshing: false });
  }

  logout = () => {
    firebase.auth().signOut();
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.page.container}
                  refreshControl={
                    <RefreshControl
                      refreshing={this.state.refreshing}
                      onRefresh={this.refresh}
                    />
                  }>
        { this.state.profile? 
        (
        <View>
          <View style={styles.profileInfo.line}>
            <Text style={styles.profileInfo.lineText}>{ this.state.profile.name }</Text>
          </View>
          <View style={styles.profileInfo.line}>
            <Text style={styles.profileInfo.lineText}>@{ this.state.profile.username }</Text>
          </View>
        </View>): null }

        <TouchableOpacity style={styles.profileInfo.line}
                          onPress={this.logout}>
          <Text style={styles.profileInfo.lineText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

const styles = {
  page: StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#eee'
    }
  }),
  profileInfo: StyleSheet.create({
    line: {
      marginTop: 2,
      padding: 12,
      backgroundColor: '#fff'
    },
    lineText: {
      fontSize: 16
    }
  })
};

interface ProfileScreenState {
  profile: any;
  refreshing: boolean;
}

interface ProfileScreenProps {
  navigation: any;
}