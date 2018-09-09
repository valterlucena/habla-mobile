import * as React from 'react';
import { FlatList, View, StyleSheet, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { api } from '../../services/api/api';
import { TextInput } from 'react-native-gesture-handler';
import moment from 'moment';

export default class TimelineScreen extends React.Component<{}, TimelineState> {
  static navigationOptions = {
    title: 'Habla!', 
    headerStyle: {
      backgroundColor: 'white',
      borderBottomWidth: 0,
    },
    headerTitleStyle: {
      color: '#161616'
    }
  };

  constructor(props: any) {
    super(props);

    this.state = { posts: [], post: { }, refreshing: false, editable: false, posting: false };
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
      let posts = await api.get('posts');

      this.setState({ posts: posts.data });

    } catch (error) {
     console.log(error);
    }
  }

  sendPost = async() => {
    this.setState({ posting: true });

    try {
      await api.post('posts', this.state.post);
      await this.fetchPosts();

    } catch (error) {
      console.log(error);
    } 

    this.setState({ post: { }, posting: false });
  }

  handlePostInput = (text: string) => {
    this.setState({ post: { body: text }});
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.page.container}
                  bounces={false}>
        <View style={styles.newPost.container}>
          <TextInput style={styles.newPost.input}
                     onChangeText={this.handlePostInput}
                     value={this.state.post.body}
                     placeholderTextColor="black"
                     placeholder="What's up?"
                     editable={!this.state.posting}
                     underlineColorAndroid="rgba(0,0,0,0)"
                     multiline={true}></TextInput>
          {(this.state.post.body && this.state.post.body.trim() !== '')? <TouchableOpacity style={styles.newPost.sendButton}
                            onPress={this.sendPost}
                            disabled={this.state.posting}
                            activeOpacity={1}>
            {this.state.posting? <ActivityIndicator color="white"/>: <Text style={styles.newPost.sendButtonText}>Send</Text>}
          </TouchableOpacity>: null}
        </View>
        <FlatList data={this.state.posts}
                  keyExtractor={(item) => item.id.toString()}
                  refreshControl={
                    <RefreshControl
                      refreshing={this.state.refreshing}
                      onRefresh={this.refresh}
                    />
                  }
                  renderItem={({item}) =>(
                    <View style={styles.post.container}>
                      {item.channel? <Text style={styles.post.channelTitle}>@{ item.channel.title }</Text>: null}
                      <Text style={styles.post.body}>{ item.body }</Text>
                      <Text style={styles.post.timeAgo}>{ moment(item.createdAt).fromNow(true) }</Text>
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
  newPost: StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: 'white',
      marginBottom: 2,
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
  }),
  post: StyleSheet.create({
    container: { 
      backgroundColor: '#fff',
      padding: 12,
      marginBottom: 2
    }, 
    channelTitle: {
      fontSize: 12,
      fontWeight: 'bold'
    },
    body: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#181818'
    },
    timeAgo: {
      fontSize: 10, 
      color: '#000'
    }
  })
};

interface TimelineState {
    posts: any[];
    post: any;
    refreshing: boolean;
    editable: boolean;
    posting: boolean;
}