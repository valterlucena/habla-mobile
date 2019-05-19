import * as React from 'react';
import { FlatList, View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar, Text, AsyncStorage, Button, TouchableHighlight } from 'react-native';
import PostComponent from '../../components/post/post';
import { Platform } from 'expo-core';
import ActionButton from 'react-native-action-button';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import Modal from "react-native-modal";
import NewPostScreen from '../new-post/new-post';
import { Location, Permissions } from 'expo';
import { client } from '../../services/client';
import gql from 'graphql-tag';
import THEME from '../../theme/theme';
import i18n from 'i18n-js';

export default class TimelineScreen extends React.Component<TimelineProps, TimelineState> {
  static navigationOptions = ({navigation}) => {
    let params = navigation.state.params;
    const local = navigation.getParam('location');
    const changeLocation = navigation.getParam('changeLocation');
    return {
      title: params && params.channel? `#${params.channel.name}`: i18n.t('screens.timeline.title'), 
      headerTitle:(
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.primary.dark, borderRadius: 10, paddingVertical: 5, paddingHorizontal: 10, marginLeft: Platform.OS === 'android' && 10 }} onPress={changeLocation} disabled={!(!!changeLocation)}>
          <Ionicons name="md-pin" color="white" size={20} />
          <Text style={{color: 'white', marginLeft: 5, fontWeight: "400", fontSize: 18}}>{local}</Text>
        </TouchableOpacity>
      ),
      headerRight: !(params && params.channel)? (
        <TouchableOpacity onPress={() => navigation.navigation.navigate('NotificationsScreen')} style={styles.page.notificationButton}>
          <MaterialIcons name="notifications" size={30} color="white"/>
        </TouchableOpacity>
      ): null,
      headerStyle: {
        backgroundColor: THEME.colors.primary.default,
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        color: '#F5F5F5',
        alignSelf: 'center'
      }
    }
  };

  currentRefreshPromise: Promise<any>;
  showHomePosts: boolean = false;

  constructor(props: TimelineProps) {
    super(props);

    this.state = { 
      currentLocation: [],
      availableLocations: [],
      posts: [],
      refreshing: false,
      loadingMorePosts: false,
      showNewPostModal: false,
      profileHome: [],
    };

    this.props.navigation.setParams({ changeLocation: this.changeLocation });

  }

  componentWillMount = async() => {
    let cachedPosts;

    if (!this.hasChannel()) {
      cachedPosts = await AsyncStorage.getItem('cached-timeline');
    }

    let cachedProfile = await AsyncStorage.getItem('cached-profile');
    let profileHome = cachedProfile ? JSON.parse(cachedProfile).home : []
    
    await Permissions.askAsync(Permissions.LOCATION);
    const location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
    const currentLocation = [location.coords.latitude, location.coords.longitude];
    const availableLocations = profileHome ? [currentLocation, profileHome] : [currentLocation];
    
    this.setState({ 
      posts: cachedPosts? JSON.parse(cachedPosts): [], 
      profileHome: profileHome,
      currentLocation: currentLocation,
      availableLocations: availableLocations
    });

    let homeLocationInfo = await this.getLocalInfo(this.state.profileHome);
    this.props.navigation.setParams({ location: homeLocationInfo });
    
    await this.refresh();
  }

  refresh = () => {
    let refreshPromise = new Promise(async(resolve, reject) => {
      this.setState({ refreshing: true });

      let posts;
    
      try {
        posts = await this.fetchPosts({ limit: 20 });
      } catch (error) {
        console.log(error);
        reject(error);
      }

      if (this.currentRefreshPromise == refreshPromise) {
        this.setState({ posts, refreshing: false }, async() => {
          if (!this.hasChannel()) await AsyncStorage.setItem('cached-timeline', JSON.stringify(this.state.posts));
        });
      }

      resolve();
    });

    this.currentRefreshPromise = refreshPromise;

    return refreshPromise;
  }

  loadMorePosts = async() => {
    if (this.state.refreshing || this.state.loadingMorePosts) return;

    this.setState({ loadingMorePosts: true });

    try {
      let posts = await this.fetchPosts({ limit: 10, ignoreIds: this.state.posts.map(c => c.id)});
      this.setState({ posts: [...this.state.posts, ...posts] });
    } catch (error) {
      console.log(error);
    } finally {
      this.setState({ loadingMorePosts: false });
    }
  }

  fetchPosts = async(options: FetchPostsOptions = { limit: 20, ignoreIds: [] }) => {
    try {
      const location = this.state.currentLocation;
      const channelId = this.props.navigation.state.params && this.props.navigation.state.params.channel? this.props.navigation.state.params.channel.id: null;

      const response = await client.query<any>({
        variables: {
          limit: options.limit,
          ignoreIds: options.ignoreIds
        },
        query: gql(`
         query Posts($limit: Int, $ignoreIds: [ID!]) {
          posts(limit: $limit, ignoreIds: $ignoreIds, channelId: ${channelId}) {
                id
                body
                distance
                createdAt
                commentsCount
                rate
                photoURL
                anonymous
                profilePostVote {
                  type
                }
                owner {
                  uid
                  username
                  photoURL
                }
                channels {
                  id
                  name
                }
              }
            }
          `),
        context: {
          location: {
            latitude: location[0],
            longitude: location[1]
          }
        },
        fetchPolicy: 'no-cache'
      });
      
      return response.data.posts;
    } catch (error) {
      const errorMessage = error.networkError? i18n.t('screens.timeline.errors.fetchingPosts.connection'): i18n.t('screens.timeline.errors.fetchingPosts.unexpected');

      this.setState({ errorMessage });

      console.log(error);
      throw error;
    }
  }

  openChannel = (channel) => {
    if (!this.hasChannel() || this.currentChannel.id !== channel.id) this.props.navigation.push('TimelineScreen', { channel: channel });
  }

  openProfile = (profile) => {
    this.props.navigation.push('ProfileScreen', { profile: profile });
  }

  openPost = (post) => {
    this.props.navigation.push('PostScreen', { post: post });
  }

  newPost = () => {
    this.setState({ showNewPostModal: true });
  }

  onPostSent = (post) => {
    this.setState({ showNewPostModal: false });

    if (!this.hasChannel() || (post.channels.find(c => c.name == this.currentChannel.name))) {
      this.setState({ posts: [post, ...this.state.posts]});
    }
  }

  hasChannel() {
    return !!this.currentChannel;
  }

  get currentChannel() {
    return this.props.navigation.state.params && this.props.navigation.state.params.channel;
  }

  getLocalInfo = async (location) => {
    let local: any = await Location.reverseGeocodeAsync({ latitude: location[0], longitude: location[1] });
    return local[0].city || local[0].name;
  }

  changeLocation = () => {
    this.showHomePosts = !this.showHomePosts;
    if (this.showHomePosts) {
      this.setState({ currentLocation: this.state.availableLocations[1]}, this.refresh);
    } else {
      this.setState({ currentLocation: this.state.availableLocations[0]}, this.refresh);
    }
  }

  render() {
    return (
      <View style={styles.page.container}>
        <View style={styles.page.container}>
          <StatusBar barStyle="light-content"/>
          { this.state.errorMessage && 
          <View style={styles.page.errorView}>
            <Ionicons name="ios-sad" size={100} color="white"/>
            <Text style={styles.page.errorText}>{ this.state.errorMessage }</Text>
          </View>}
          <FlatList data={this.state.posts}
                    keyExtractor={(item) => item.id.toString()}
                    onEndReached={this.loadMorePosts}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                      <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this.refresh}
                      />
                    }
                    renderItem={({item}) =>(
                    <TouchableOpacity onPress={() => this.openPost(item)}>
                      <PostComponent post={item}
                                    showPostHeader={true}
                                    onOpenProfile={this.openProfile}
                                    onOpenChannel={this.openChannel}/>
                    </TouchableOpacity>
          )}/>
        </View>
        <ActionButton buttonColor={THEME.colors.secondary.default}
                      position="center"
                      hideShadow={true}
                      offsetY={10}
                      onPress={this.newPost}
                      renderIcon={() => <FontAwesome name="plus" size={28} color={'#F5F5F5'}/>}/>

        <Modal isVisible={this.state.showNewPostModal}
               avoidKeyboard={true}
               style={styles.page.newPostModal}
               animationInTiming={400}
               animationOutTiming={400}>
          <NewPostScreen navigation={this.props.navigation} 
                         onSuccess={this.onPostSent}
                         onDismiss={() => this.setState({ showNewPostModal: false })}
                         channel={this.props.navigation.state.params && this.props.navigation.state.params.channel}/>
        </Modal>
      </View>
    );
  }
}

const styles = {
  page: StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      flexGrow: 1
    },
    newPostModal: {
      width: '100%',
      margin: 0,
      padding: 0
    },
    errorView: {
      padding: 20,
      backgroundColor: THEME.colors.error.default,
      justifyContent: 'center',
      alignItems: 'center'
    },
    errorText: {
      color: 'white',
      textAlign: 'center'
    },
    notificationButton: {
      marginRight: 10
    }
  }),
};

interface TimelineState {
  currentLocation: any[];
  availableLocations: any[];
  posts: any[];
  refreshing: boolean;
  loadingMorePosts: boolean;
  showNewPostModal: boolean;
  errorMessage?: string;
  profileHome: any
}

interface TimelineProps {
  navigation: any;
}

interface FetchPostsOptions {
  limit?: number;
  ignoreIds?: number[]; 
}