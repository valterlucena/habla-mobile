import * as React from 'react';
import { FlatList, View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import PostComponent from '../../components/post/post';
import ActionButton from 'react-native-action-button';
import { FontAwesome } from '@expo/vector-icons';
import Modal from "react-native-modal";
import NewPostScreen from '../new-post/new-post';
import { Location, Permissions } from 'expo';
import { client } from '../../services/client';
import gql from 'graphql-tag';
import THEME from '../../theme/theme';

export default class TimelineScreen extends React.Component<TimelineProps, TimelineState> {
  static navigationOptions = (navigation) => {
    let params = navigation.navigation.state.params;

    return {
      title: params && params.channel? `#${params.channel.name}`: 'Timeline', 
      headerStyle: {
        backgroundColor: THEME.colors.primary.default,
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        color: '#F5F5F5'
      }
    }
  };

  constructor(props: TimelineProps) {
    super(props);

    this.state = { 
      posts: [],
      refreshing: false,
      showNewPostModal: false
    };
  }

  componentWillMount() {
    this.refresh();
  }

  refresh = async() => {
    this.setState({ refreshing: true });
    
    try {
      await this.fetchPosts();
    } catch (error) {
      console.log(error);
    }
      
    this.setState({ refreshing: false });
  }

  fetchPosts = async() => {
    try {
      await Permissions.askAsync(Permissions.LOCATION);
      const location = await Location.getCurrentPositionAsync({ enableHighAccuracy: false });

      const channelId = this.props.navigation.state.params && this.props.navigation.state.params.channel? this.props.navigation.state.params.channel.id: null;

      const response = await client.query<any>({
        query: gql(`
          {
            posts(radius: 1500000000000000, skip: 0, take: 10, channelId: ${channelId}) {
              id,
              body,
              distance,
              createdAt
              owner {
                uid
                username
              }
              channel {
                id
                name
              }
            }
          }
        `),
        context: {
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          }
        },
        fetchPolicy: 'no-cache'
      });
      
      this.setState({ posts: response.data.posts });
    } catch (error) {
     console.log(error);
    }
  }

  openChannel = (channel) => {
    if (this.props.navigation.state.params && this.props.navigation.state.params.channel) return;
    
    this.props.navigation.push('TimelineScreen', { channel: channel });
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
    
    this.setState({ posts: [post, ...this.state.posts]});
  }

  render() {
    return (
      <View style={styles.page.container}>
        <ScrollView contentContainerStyle={styles.page.container}
                    refreshControl={
                      <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this.refresh}
                      />
                    }>
          <StatusBar barStyle="light-content"/>
          <FlatList data={this.state.posts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) =>(
                    <TouchableOpacity onPress={() => this.openPost(item)}>
                      <PostComponent post={item}
                                    showPostHeader={true}
                                    onOpenProfile={this.openProfile}
                                    onOpenChannel={this.openChannel}/>
                    </TouchableOpacity>
          )}/>
        </ScrollView>
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
    }
  }),
};

interface TimelineState {
  posts: any[];
  refreshing: boolean;
  showNewPostModal: boolean;
}

interface TimelineProps {
  navigation: any;
}