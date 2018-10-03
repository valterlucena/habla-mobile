import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, StatusBar } from 'react-native';
import { api } from '../../services/api';
import firebase from 'firebase';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { FontAwesome } from '@expo/vector-icons';
import { Header } from 'react-navigation';

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

    try {
      await api.post('posts', this.state.post);

      this.props.onSuccess && this.props.onSuccess();
    } catch (error) {
      console.log(error);
    } 
  }

  resetPost() {
    this.setState({
      post: {
        channelId: this.props.channel? this.props.channel.id: null
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