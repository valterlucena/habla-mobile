import * as React from 'react';
import { StyleSheet, ScrollView, Text, View, RefreshControl, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import firebase from 'firebase';
import { client } from '../../services/client';
import gql from 'graphql-tag';
import THEME from '../../theme/theme';
import AutoHeightImage from 'react-native-auto-height-image';
import PostComponent from '../../components/post/post';
import i18n from 'i18n-js';
import { Permissions, Location } from 'expo';

export default class ProfileScreen extends React.Component<ProfileScreenProps, ProfileScreenState> {
  static navigationOptions = (navigation) => {
    let params = navigation.navigation.state.params;

    return {
      title: params && params.profile? `@${params.profile.username}`: i18n.t('screens.profile.title'), 
      headerStyle: {
        backgroundColor: THEME.colors.primary.default,
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        color: '#F5F5F5'
      }
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

    let profileUid = navProfile? navProfile.uid: firebase.auth().currentUser.uid;

    this.setState({ refreshing: true });

    await Permissions.askAsync(Permissions.LOCATION);
    const location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });

    try {
      const response = await client.query<any>({
        query: gql(`
          {
            profile(uid: "${profileUid}") {
              uid
              name
              username
              photoURL
              bio
              website
              phone
              gender

              posts {
                id
                body
                createdAt
                commentsCount
                rate
                distance
                profilePostVote {
                  type
                }
                owner {
                  uid
                  username
                  photoURL
                }
                channel {
                  id
                  name
                }
              }
            }
          }`),
        fetchPolicy: 'no-cache',
        context: {
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          }
        }
      });

      this.setState({ profile: response.data.profile });
    } catch (error) {
      console.log(error);
    }

    this.setState({ refreshing: false });
  }

  logout = () => {
    firebase.auth().signOut();
  }

  isSelfProfile = () => {
    return this.state.profile && firebase.auth().currentUser && firebase.auth().currentUser.uid === this.state.profile.uid;
  }

  openChannel = (channel) => {
    this.props.navigation.push('TimelineScreen', { channel: channel });
  }

  openPost = (post) => {
    this.props.navigation.push('PostScreen', { post: post });
  }

  openProfileEdition = (profile) => {
    this.props.navigation.push('ProfileEditionScreen', { profile: profile, onProfileEdition: profile => {
      this.setState({ profile: { ...this.state.profile, ...profile }});
    }});
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
          <AutoHeightImage width={Dimensions.get('window').width} source={{ uri: this.state.profile.photoURL }} style={styles.profileInfo.photo}/>
          <View style={styles.profileInfo.line}>
            <Text style={styles.profileInfo.lineText}>{ this.state.profile.name }</Text>
          </View>
          { this.state.profile.bio? <View style={styles.profileInfo.line}>
            <Text style={styles.profileInfo.lineText}>{ this.state.profile.bio }</Text>
          </View>: null }
          <View style={styles.profileInfo.line}>
            <Text style={styles.profileInfo.lineText}>@{ this.state.profile.username }</Text>
          </View>
          <View style={styles.profileInfo.line}>
            <TouchableOpacity onPress={() => this.openProfileEdition(this.state.profile)}>
              <Text style={styles.profileInfo.lineText}>
                { i18n.t('screens.profile.buttons.editProfile') }
              </Text>
            </TouchableOpacity>
          </View>
        </View>): null }       
        {this.isSelfProfile()? <TouchableOpacity style={styles.profileInfo.line}
                          onPress={this.logout}>
          <Text style={styles.profileInfo.lineText}>{ i18n.t('screens.profile.buttons.signOut') }</Text>
        </TouchableOpacity>: null}
        { (this.state.profile && this.state.profile.posts || []).map(item => (
        <TouchableOpacity key={item.id} onPress={() => this.openPost(item)}>
          <PostComponent post={item}
                         showPostHeader={true}
                         onOpenChannel={this.openChannel}/>
        </TouchableOpacity>)
        )}
      </ScrollView>
    );
  }
}

const styles = {
  page: StyleSheet.create({
    container: {
      flexGrow: 1, 
      backgroundColor: '#fff'
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
    },
    photo: {
      width: '100%',

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