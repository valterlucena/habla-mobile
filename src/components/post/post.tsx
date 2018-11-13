import * as React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import moment from 'moment';

export default class PostComponent extends React.Component<any, PostComponentProps> {
  constructor(props: PostComponentProps) {
    super(props);
  }

  render() {
      return (<View style={styles.container}>
          { this.props.showPostHeader? 
            (<View style={styles.header}>
              {this.props.post.owner?
              <TouchableOpacity onPress={() => this.props.onOpenProfile(this.props.post.owner)}>
                <Text style={styles.username}>@{ this.props.post.owner.username }</Text>
              </TouchableOpacity>
              : <Text style={styles.username}>@anonymous</Text>}

              {this.props.post.channel?
              <TouchableOpacity onPress={() => this.props.onOpenChannel(this.props.post.channel)}>
                <Text style={styles.channelTitle}>#{ this.props.post.channel.title }</Text>
              </TouchableOpacity>: (null)}
            </View>)
          : null }
            
          <Text style={styles.body}>{ this.props.post.body }</Text>
          <Text style={styles.timeAgo}>{ moment(this.props.post.createdAt).fromNow(true) }</Text>
        </View>)
  }
}

const styles = StyleSheet.create({
  container: { 
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 2,
    borderBottomColor: '#F5F5F5',
    borderBottomWidth: 2,
  }, 
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  username: {
    fontSize: 12, 
    fontWeight: 'bold'
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
});

export interface PostComponentProps {
  post: any;
  showPostHeader: boolean;
  onOpenProfile: (profile) => void;
  onOpenChannel: (channel) => void;
}