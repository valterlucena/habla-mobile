import * as React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import moment from 'moment';
import { FontAwesome } from '@expo/vector-icons';

export default class PostComponent extends React.Component<any, PostComponentProps> {
  constructor(props: PostComponentProps) {
    super(props);
  }

  render() {
      return (
      <View style={styles.container}>
      { this.props.showPostHeader? 
        (<View style={styles.header}>
          <TouchableOpacity style={styles.avatar} disabled={ !this.props.post.owner } onPress={() => this.props.onOpenProfile(this.props.post.owner)}>
            <FontAwesome style={styles.avatarIcon} name="user-circle"/>
            {this.props.post.owner?
              <Text style={styles.headerText}>{ this.props.post.owner.username }</Text>
            : <Text style={styles.headerText}>anonymous</Text>}
          </TouchableOpacity>

          {this.props.post.channel?
          <TouchableOpacity onPress={() => this.props.onOpenChannel(this.props.post.channel)}>
            <Text style={styles.channelTitle}>#{ this.props.post.channel.name }</Text>
          </TouchableOpacity>: (null)}

          <Text style={styles.headerText}>{this.props.post.distance}</Text>
        </View>)
      : null }
        <View style={styles.postBody}>
          <View style={styles.postLeft}>
            <View style={styles.middle}>
              <Text style={styles.bodyText}>{ this.props.post.body }</Text>
            </View>
          </View>
          <View style={styles.postRight}>
            <FontAwesome style={styles.voteButton} name="chevron-up"/>
            <FontAwesome style={styles.voteButton} name="chevron-down"/>
          </View>
        </View>
        <View style={styles.bottom}>
          <Text style={styles.bottomText}>{ moment(this.props.post.createdAt).fromNow() }</Text>
          <Text style={styles.separator}>
            •
          </Text>
          <View style={styles.comments}>
            <FontAwesome style={styles.commentsIcon} name="comments"/>
            <Text style={styles.bottomText}>
              { this.props.post.commentsCount }
            </Text>
          </View>
        </View>
      </View>)
  }
}

const styles = StyleSheet.create({
  postBody: {
    flexDirection: 'row'
  },
  container: { 
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 2,
    borderBottomColor: '#F5F5F5',
    borderBottomWidth: 2
  }, 
  header: {
    flexDirection: 'row',
    marginBottom: 2,
    justifyContent: 'space-between',
    alignItems: "center"
  },
  bottom: {
    flexDirection: 'row',
    marginTop: 2,
    alignItems: "center"
  },
  avatar: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarIcon: {
    fontSize: 30,
    marginRight: 8
  },
  headerText: {
    fontSize: 12, 
    fontWeight: 'bold'
  },
  channelTitle: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  bodyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181818',
    marginVertical: 8
  },
  middle: {
    flexDirection: 'row'
  },
  postLeft: {
    width: '90%'
  },
  postRight: {
    flexGrow: 1,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  voteButton: {
    fontSize: 25
  },
  bottomText: {
    fontSize: 10
  },
  comments: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentsIcon: {
    fontSize: 20,
    marginRight: 3
  },
  separator: {
    marginHorizontal: 5
  }
});

export interface PostComponentProps {
  post: any;
  showPostHeader: boolean;
  onOpenProfile: (profile) => void;
  onOpenChannel: (channel) => void;
}