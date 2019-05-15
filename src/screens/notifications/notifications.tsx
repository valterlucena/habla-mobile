import * as React from 'react';
import { View, StyleSheet, AsyncStorage, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import THEME from '../../theme/theme';
import { gql } from 'apollo-boost';
import { client } from '../../services/client';
import moment from 'moment';
import i18n from 'i18n-js';
import { FontAwesome5 } from '@expo/vector-icons';

export default class NotificationsScreen extends React.Component<NotificationsProps, NotificationsState> {
  static navigationOptions = (navigation) => {
    return {
      title: i18n.t('screens.notifications.title'), 
      headerStyle: {
        backgroundColor: THEME.colors.primary.default,
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        color: '#F5F5F5'
      }
    }
  };

  constructor(props: NotificationsProps) {
    super(props);

    this.state = { 
      refreshing: false,
      notifications: []
    };
  }

  componentWillMount = async() => {
    let cachedNotifications = await AsyncStorage.getItem('cached-notifications');

    this.setState({ notifications: cachedNotifications? JSON.parse(cachedNotifications): [] });
    
    await this.refresh();
  }

  refresh = async() => {
    this.setState({ refreshing: true  });
    
    try {
      await this.fetchNotifications();
    } catch (error) {
      console.log(error);
    }
      
    this.setState({ refreshing: false });

     await AsyncStorage.setItem('cached-notifications', JSON.stringify(this.state.notifications));
  }

  fetchNotifications = async() => {
    const response = await client.query<any>({
      query: gql(`
        {
          notifications {
            id
            type
            read
            updatedAt
            comment {
              owner {
                username
                photoURL
              }
            }
            post {
              id
              rate
              voteCount
            }
          }
        }
      `),
      fetchPolicy: 'no-cache'
    });

    this.setState({ notifications: response.data.notifications });
  }

  openPost = (postId) => {
    this.props.navigation.navigate("PostScreen", { postId: postId });
  }

  mark

  getNotificationComponent = (notification) => {
    const photoDefault = require('../../../assets/avatar-placeholder.png');
    
    if (notification.type === 'COMMENT_ON_OWNED_POST' && notification.post && notification.comment) {
      return (
      <TouchableOpacity style={styles.notification.touchable}
                        onPress={() => this.openPost(notification.post.id)}>
        <View style={styles.notification.left}>
          <Image style={styles.notification.avatar as any} source={notification.comment && notification.comment.owner && notification.comment.owner.photoURL? { uri: notification.comment.owner.photoURL }: photoDefault} width={40} height={40}/>
          <Text> { i18n.t('screens.notifications.notificationTypes.commentOnOwnedPost', { username: notification.comment.owner.username }) }</Text>
        </View>
        <View style={styles.notification.right}>
          <Text>{ moment(notification.updatedAt).fromNow(true) }</Text>
        </View>
      </TouchableOpacity>
      );
    } else if (notification.type === 'VOTE_ON_OWNED_POST' && notification.post) {
      return (
      <TouchableOpacity style={styles.notification.touchable}
                        onPress={() => this.openPost(notification.post.id)}>
        <View style={styles.notification.left}>
          <FontAwesome5 style={styles.notification.avatarIcon} name="poll-h"/>
          <Text>{ i18n.t('screens.notifications.notificationTypes.voteOnOwnedPost', { voteCount: notification.post.voteCount }) }</Text>
        </View>
        <View style={styles.notification.right}>
          <Text>{ moment(notification.updatedAt).fromNow(true) }</Text>
        </View>
      </TouchableOpacity>
      );
    }
  
    return null;
  }

  render() {
    return (
      <View style={styles.page.container}>
        <FlatList data={this.state.notifications}
                    keyExtractor={(item) => item.id.toString()}
                    refreshing={this.state.refreshing}
                    onRefresh={this.refresh}
                    renderItem={({item}) => this.getNotificationComponent(item) }/>
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
    }
  }),
  notification: StyleSheet.create({
    touchable: { 
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      alignItems: 'center',
      flexDirection: 'row'
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12
    },
    left: {
      flexDirection: 'row',
      flexGrow: 1,
      alignItems: 'center'
    },
    right: {
      marginLeft: 'auto'
    },
    avatarIcon: {
      fontSize: 30,
      marginRight: 8
    }
  })
};

interface NotificationsState {
  refreshing: boolean;
  notifications: any[]
}

interface NotificationsProps {
  navigation: any;
}