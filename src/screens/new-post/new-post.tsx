import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, StatusBar } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Permissions, Location } from 'expo';
import { client } from '../../services/client';
import gql from 'graphql-tag';
import THEME from '../../theme/theme';
import i18n from 'i18n-js';

export default class NewPostScreen extends React.Component<NewPostScreenProps, NewPostScreenState> {
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
    const location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });

    try {
      const response = await client.mutate({
        variables: { 
          post: this.state.post
        },
        mutation: gql(`
          mutation CreatePost ($post: PostInput!) {
            createPost(post: $post) {
              id
              body
              distance
              createdAt
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
        body: this.props.channel && `#${this.props.channel.name}`
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
            <FontAwesome name="chevron-left" size={35} color={THEME.colors.primary.default}></FontAwesome>
          </TouchableOpacity>
          <TouchableOpacity>
            <FontAwesome name="image" size={35} color={THEME.colors.primary.default}></FontAwesome>
          </TouchableOpacity>
        </View>
        <TextInput style={styles.newPost.input}
                  onChangeText={this.handlePostInput}
                  value={this.state.post.body}
                  placeholderTextColor="white"
                  placeholder={i18n.t('screens.newPost.inputPlaceholder')}
                  editable={!this.state.posting}
                  multiline={true}
                  underlineColorAndroid="rgba(0,0,0,0)"/>
        <TouchableOpacity style={styles.newPost.sendButton}
                          onPress={this.sendPost}
                          disabled={this.state.posting || !this.state.post.body || this.state.post.body.trim() == ''}
                          activeOpacity={1}>
          {this.state.posting? <ActivityIndicator color="white"/>: <Text style={styles.newPost.sendButtonText}>{ i18n.t('screens.newPost.buttons.submit') }</Text>}
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
      padding: 16,
      justifyContent: 'space-between'
    }
  }),
  newPost: StyleSheet.create({
    container: {
      backgroundColor: THEME.colors.secondary.light,
      flexGrow: 1,
    },
    input: {
      marginTop: 5,
      padding: 16,
      backgroundColor: THEME.colors.secondary.light,
      color: 'white',
      flex: 1,
      fontSize: 25,
      flexGrow: 1,
      fontWeight: "bold",
      textAlignVertical: "top"
    },
    sendButton: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: THEME.colors.primary.default,
      width: '100%',
    },
    sendButtonText: {
      fontSize: 18,
      textAlign: 'center',
      color: 'white',
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