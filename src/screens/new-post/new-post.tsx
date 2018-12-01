import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, StatusBar } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Permissions, Location } from 'expo';
import { client } from '../../services/client';
import gql from 'graphql-tag';

export default class NewPostScreen extends React.Component<NewPostScreenProps, NewPostScreenState> {
  static navigationOptions = {
    title: 'New post', 
    headerStyle: {
      backgroundColor: '#795548',
      borderBottomWidth: 0,
    },
    headerTitleStyle: {
      color: '#F5F5F5'
    },
    tabBarVisible: false
  };

  constructor(props: NewPostScreenProps) {
    super(props);

    this.state = { post: { body: null }, posting: false };
  }

  componentWillMount() {
    this.resetPost();
  }

  handlePostInput = (text: string) => {
    this.setState({ post: { ...this.state.post, body: text }});
  }

  sendPost = async() => {
    this.setState({ posting: true });

    await Permissions.askAsync(Permissions.LOCATION);
    const location = await Location.getCurrentPositionAsync({ enableHighAccuracy: false });

    try {
      const response = await client.mutate({
        variables: { 
          post: this.state.post,
          channelId: this.props.channel? this.props.channel.id: null
        },
        mutation: gql(`
          mutation CreatePost ($channelId: ID, $post: PostInput!) {
            createPost(channelId: $channelId, post: $post) {
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
        }
      });

      this.props.onSuccess && this.props.onSuccess(response.data.createPost);
    } catch (error) {
      console.log(error);
    } 

    this.setState({ posting: false });
  }

  resetPost() {
    this.setState({
      post: {
        
      }
    });
  }

  dismiss = () => {
    this.props.onDismiss && this.props.onDismiss();
  }

  render() {
    return (
      <View style={styles.newPost.container}>
        <StatusBar hidden={true}></StatusBar>
        <View style={styles.header.container}>
          <TouchableOpacity onPress={this.dismiss}>
            <FontAwesome name="angle-left" size={45} color="#795548"></FontAwesome>
          </TouchableOpacity>
        </View>
        <TextInput style={styles.newPost.input}
                  onChangeText={this.handlePostInput}
                  value={this.state.post.body}
                  placeholderTextColor="black"
                  placeholder="What's up?"
                  editable={!this.state.posting}
                  multiline={true}
                  underlineColorAndroid="rgba(0,0,0,0)"/>
        <TouchableOpacity style={styles.newPost.sendButton}
                          onPress={this.sendPost}
                          disabled={this.state.posting || !this.state.post.body || this.state.post.body.trim() == ''}
                          activeOpacity={1}>
          {this.state.posting? <ActivityIndicator color="white"/>: <Text style={styles.newPost.sendButtonText}>Send</Text>}
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = {
  header: StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16
    }
  }),
  newPost: StyleSheet.create({
    container: {
      backgroundColor: 'white',
      flexGrow: 1,
    },
    input: {
      marginTop: 5,
      padding: 16,
      backgroundColor: 'white',
      color: 'black',
      flex: 1,
      fontSize: 25,
      flexGrow: 1
    },
    sendButton: {
      paddingHorizontal: 14,
      paddingVertical: 14,
      backgroundColor: "#795548",
      width: '100%',
    },
    sendButtonText: {
      fontSize: 18,
      textAlign: 'center',
      color: "#FFFFFF",
      fontWeight: "bold"
    }
  })
};

interface NewPostScreenState {
  posting: boolean;
  post: any;
}

interface NewPostScreenProps {
  navigation: any;
  onSuccess: Function;
  onDismiss: Function;
  channel: any;
}