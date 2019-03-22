import * as React from 'react';
import { View, StyleSheet, AsyncStorage, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import THEME from '../../theme/theme';
import { gql } from 'apollo-boost';
import { client } from '../../services/client';
import moment from 'moment';

export default class NotificationsScreen extends React.Component<NotificationsProps, NotificationsState> {
  static navigationOptions = (navigation) => {
    return {
      title: 'Notifications', 
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
    let cachedNotifications;

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
            createdAt
            comment {
              postId
              owner {
                username
                photoURL
              }
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

  getNotificationComponent = (notification) => {
    if (notification.type === 'COMMENT_ON_OWNED_POST') {
      return (
      <TouchableOpacity style={Object.assign({ backgroundColor: notification.read? '#f9f9f9': undefined }, styles.notification.touchable)}
                        onPress={() => this.openPost(notification.comment.postId)}>
        <View style={styles.notification.left}>
          { notification.comment && notification.comment.owner  && <Image source={{ uri: notification.comment.owner.photoURL }}
                                  style={styles.notification.avatar}/> }
          <Text style={styles.notification.username}>{ notification.comment.owner.username }</Text><Text> commented on your post</Text>
        </View>
        <View style={styles.notification.right}>
          <Text>{ moment(notification.createdAt).fromNow(true) }</Text>
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
    username: {
      fontWeight: "bold"
    },
    left: {
      flexDirection: 'row',
      flexGrow: 1,
      alignItems: 'center'
    },
    right: {
      marginLeft: 'auto'
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