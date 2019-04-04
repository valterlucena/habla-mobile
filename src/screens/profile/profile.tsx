import * as React from 'react';
import { StyleSheet, ScrollView, Text, View, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import firebase from 'firebase';
import { client } from '../../services/client';
import gql from 'graphql-tag';
import THEME from '../../theme/theme';
import AutoHeightImage from 'react-native-auto-height-image';
import PostComponent from '../../components/post/post';
import i18n from 'i18n-js';
import { Permissions, Location } from 'expo';
import ActionSheet from 'react-native-actionsheet'
import { ImagePicker } from 'expo';
import { Platform } from 'expo-core';
import { FileSystem } from 'expo';
import ChangePhotoComponent from '../../components/change-photo/change-photo'

export default class ProfileScreen extends React.Component<ProfileScreenProps, ProfileScreenState> {

  actionSheet: ActionSheet;

  static navigationOptions = (navigation) => {
    let params = navigation.navigation.state.params;

    return {
      title: params && params.profile ? `@${params.profile.username}` : i18n.t('screens.profile.title'),
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

    this.state = { profile: null, refreshing: false, profilePhoto: null };
  }

  componentWillMount() {
    this.refresh();
  }

  refresh = async () => {
    let navProfile = this.props.navigation.state.params && this.props.navigation.state.params.profile;

    let profileUid = navProfile ? navProfile.uid : firebase.auth().currentUser.uid;

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
              bio
              website
              phone
              gender
              photoURL

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

      this.setState({ profile: response.data.profile, profilePhoto: response.data.profile.photoURL });
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

  choosePhoto = async index => {
    if (Platform.OS === 'ios') {
      await Permissions.askAsync(Permissions.CAMERA_ROLL);
    }
    await Permissions.askAsync(Permissions.CAMERA);
    let image: any;
    if (index == 0) {
      image = await ImagePicker.launchCameraAsync({quality: 0.5, aspect: [4, 4]})
    }
    else if (index == 1) {
      image = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'Images', allowsEditing: true });
    }
    if ((index == 2) || (image.cancelled)) {
      return;
    }
    console.log("ANTES")
    let base64 = await FileSystem.readAsStringAsync(image.uri, { encoding: FileSystem.EncodingTypes.Base64 });
    console.log("DEPOIS")
    base64 = `data:image/png;base64,${base64}`;

    this.setState({ profilePhoto: base64 })

    try {
      const response = await client.mutate({
        variables: {
          profile: this.state.profile,
          profilePhoto: this.state.profilePhoto
        },
        mutation: gql(`
          mutation UpdateProfile ($profile: ProfileInput!, $photo: Upload) {
            updateProfile(profile: $profile, photo: $photo) {
              uid
            }
          }
        `)
      });

    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  openProfileEdition = (profile) => {
    this.props.navigation.push('ProfileEditionScreen', { profile: profile });
  }

  changePhoto = async (photo) => {
    this.setState({ profilePhoto: photo })

    try {
      const response = await client.mutate({
        variables: {
          profile: this.state.profile,
          profilePhoto: this.state.profilePhoto
        },
        mutation: gql(`
          mutation UpdateProfile ($profile: ProfileInput!, $photo: Upload) {
            updateProfile(profile: $profile, photo: $photo) {
              uid
            }
          }
        `)
      });

    } catch (error) {
      console.log(JSON.stringify(error));
    }
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
        {this.state.profile ?
          (
            <View>
              <AutoHeightImage width={Dimensions.get('window').width} source={{ uri: this.state.profilePhoto }} style={styles.profileInfo.photo} />
              <ChangePhotoComponent onPhotoSelected={this.changePhoto}/>
              <View style={styles.profileInfo.line}>
                <Text style={styles.profileInfo.lineText}>{this.state.profile.name}</Text>
              </View>
              {this.state.profile.bio ? <View style={styles.profileInfo.line}>
                <Text style={styles.profileInfo.lineText}>{this.state.profile.bio}</Text>
              </View> : null}
              <View style={styles.profileInfo.line}>
                <Text style={styles.profileInfo.lineText}>@{this.state.profile.username}</Text>
              </View>
              <View style={styles.profileInfo.line}>
                <TouchableOpacity onPress={() => this.openProfileEdition(this.state.profile)}>
                  <Text style={styles.profileInfo.lineText}>
                    {i18n.t('screens.profile.buttons.editProfile')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>) : null}
        {this.isSelfProfile() ? <TouchableOpacity style={styles.profileInfo.line}
          onPress={this.logout}>
          <Text style={styles.profileInfo.lineText}>{i18n.t('screens.profile.buttons.signOut')}</Text>
        </TouchableOpacity> : null}
        {(this.state.profile && this.state.profile.posts || []).map(item => (
          <TouchableOpacity key={item.id} onPress={() => this.openPost(item)}>
            <PostComponent post={item}
              showPostHeader={true}
              onOpenChannel={this.openChannel} />
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
    },
    textChangePhoto: {
      textAlign: 'center',
      fontSize: 14,
      fontWeight: 'bold'
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
  profilePhoto: any;
}

interface ProfileScreenProps {
  navigation: any;
}