import * as React from 'react';
import { StyleSheet, ScrollView, Text, View, RefreshControl, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { api } from '../../services/api';
import firebase from 'firebase';
import PostComponent from '../../components/post/post';
import moment from 'moment';
import { TextInput } from 'react-native-gesture-handler';

export default class PostScreen extends React.Component<PostScreenProps, PostScreenState> {
  static navigationOptions = {
    title: 'Post', 
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

    this.state = { post: null, comments: [], newComment: { body: null }, refreshing: false, postingComment: false };
  }

  async componentWillMount() {
    let navPost = this.props.navigation.state.params && this.props.navigation.state.params.post;

    this.setState({ post: navPost }, async() => {
      await this.refresh();
    });
  }

  refresh = async() => {
    if (!this.state.post) return;

    this.setState({ refreshing: true });

    try {
      await this.loadPost();
      await this.loadComments();
    } catch (error) {
      console.log(error);
    }

    this.setState({ refreshing: false });
  }

  loadPost = async() => {
    let post = await api.get(`posts/${this.state.post.id}`);

    this.setState({ post: post.data });
  }

  loadComments = async() => {
    let comments = await api.get(`posts/${this.state.post.id}/comments`);

    this.setState({ comments: comments.data });
  }

  logout = () => {
    firebase.auth().signOut();
  }

  openChannel = (channel) => {
    // to be implemented
  }

  openProfile = (profile) => {
    this.props.navigation.push('ProfileScreen', { profile: profile });
  }

  handleCommentInput = (text) => {
    this.setState({
      newComment: {
        body: text
      }
    });
  }

  sendComment = async() => {
    this.setState({ postingComment: true });

    try {
      await api.post(`posts/${this.state.post.id}/comments`, this.state.newComment);
      await this.loadComments();
    } catch (error) {
      console.log(error);
    } 

    this.setState({ newComment: { body: null }, postingComment: false });
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
        { this.state.post? 
        (
          <PostComponent post={this.state.post}
                         showPostHeader={true}
                         onOpenProfile={this.openProfile}
                         onOpenChannel={this.openChannel}/>) : null }
        <View style={styles.newComment.container}>
          <TextInput style={styles.newComment.input}
                     onChangeText={this.handleCommentInput}
                     value={this.state.newComment.body}
                     placeholderTextColor="black"
                     placeholder="Type a comment..."
                     editable={!this.state.postingComment}
                     underlineColorAndroid="rgba(0,0,0,0)"/>
            {(this.state.newComment.body && this.state.newComment.body.trim() !== '')? <TouchableOpacity style={styles.newComment.sendButton}
              onPress={this.sendComment}
              disabled={this.state.postingComment}
              activeOpacity={1}>
            {this.state.postingComment? <ActivityIndicator color="white"/>: <Text style={styles.newComment.sendButtonText}>Send</Text>}
          </TouchableOpacity>: null}
        </View>
        <FlatList data={this.state.comments}
                  bounces={false}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({item}) =>(
            <View style={styles.comment.view}>
              <View style={styles.comment.header}>
                <TouchableOpacity onPress={() => this.openProfile(item.owner)}>
                  <Text style={styles.comment.username}>@{ item.owner.username }</Text>
                </TouchableOpacity>
                <Text style={styles.comment.timeAgo}>{ moment(item.createdAt).fromNow(true) }</Text>
              </View>
              <Text style={styles.comment.body}>{ item.body }</Text>
            </View>
          )}/>
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
  comment: StyleSheet.create({
    view: {
      backgroundColor: 'white',
      padding: 12,
      marginBottom: 2
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    timeAgo: {
      fontSize: 10, 
      color: '#000'
    },
    body: {
      fontSize: 16,
      color: '#000'
    },
    username: {
      fontSize: 12, 
      fontWeight: 'bold',
      marginRight: 2,
      color: '#000'
    },
  }),
  newComment: StyleSheet.create({
    container: {
      backgroundColor: 'white',
      marginVertical: 2,
      flexDirection: 'row',
    },
    input: {
      padding: 16,
      backgroundColor: 'white',
      color: 'black',
      flex: 1,
      fontSize: 18
    },
    sendButton: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#4dabf5',
      padding: 8,
      width: 50,
      height: 35,
      borderRadius: 100,
      margin: 5
    },
    sendButtonText: {
      color: 'white',
      fontWeight: 'bold',
    }
  })
};

interface PostScreenState {
  post: any;
  comments: any[];
  newComment: { body: string };
  refreshing: boolean;
  postingComment: boolean;
}

interface PostScreenProps {
  navigation: any;
}