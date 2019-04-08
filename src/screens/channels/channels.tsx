import * as React from 'react';
import { StyleSheet, Text, ScrollView, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { client } from '../../services/client';
import gql from 'graphql-tag';
import THEME from '../../theme/theme';
import i18n from 'i18n-js';
import { Location, Permissions } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Modal from "react-native-modal";
import NewChannelScreen from '../new-channel/new-channel';

export default class ChannelsScreen extends React.Component<ChannelsScreenProps, ChannelsScreenState> {
  static navigationOptions = ({ navigation }) => {
    return {
      title: i18n.t('screens.channels.title'), 
      headerStyle: {
        backgroundColor: THEME.colors.primary.default,
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        color: '#F5F5F5'
      },
      headerRight: (
        <TouchableOpacity onPress={navigation.getParam('newChannelTapped')} style={styles.page.newChannelButton}>
          <Ionicons name="ios-create" size={30} color="white"/>
        </TouchableOpacity>
      )
    }
  };

  constructor(props) {
    super(props);

    this.state = { channels: [], refreshing: false, showNewChannelModal: false };

    this.props.navigation.setParams({ newChannelTapped: this.newChannelTapped });
  }

  componentWillMount() {
    this.refresh();
  }

  newChannelTapped = () => {
    this.setState({ showNewChannelModal: true });
  }

  refresh = async() => {
    await this.setState({ refreshing: true });
    try {
      await this.fetchChannels(true);
    } catch (error) {
      console.log(error);
    }
      
    this.setState({ refreshing: false });
  }

  fetchChannels = async(refresh) => {
    try {

      await Permissions.askAsync(Permissions.LOCATION);
      const location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });

      
      const response = await client.query<any>({
        variables: {
          take: 10,
          skip: 0,
          ignoreIds: refresh? []: this.state.channels.map(c => Number(c.id))
        },
        query: gql(`
          query Channels($skip: Int, $take: Int, $ignoreIds: [Int!]) {
            channels(skip: $skip, take: $take, ignoreIds: $ignoreIds) {
              id,
              name,
              postsCount
            }
          }
        `),
        context: {
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          },
        },
        fetchPolicy: 'no-cache'
      });
     
      if (refresh) {
        await this.setState({channels: []})
      }

      this.setState({ channels:[...this.state.channels, ...response.data.channels]});

    } catch (error) {
      console.log(error);
    }
  }

  onPostSent = (channel) => {
    this.setState({ showNewChannelModal: false });
    
    this.setState({ channels: [channel, ...this.state.channels]});
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.page.container}
                  bounces={false}>
        <FlatList data={this.state.channels}
                  keyExtractor={(item) => item.id.toString()}
                  refreshControl={
                    <RefreshControl
                      refreshing={this.state.refreshing}
                      onRefresh={this.refresh}
                    />
                  }
                  renderItem={({item}) =>(
                    <TouchableOpacity style={styles.channel.container}
                                      onPress={() => this.props.navigation.navigate('TimelineScreen', { channel: item })}>
                      <Text style={styles.channel.channelTitle}>#{ item.name }</Text>
                    </TouchableOpacity>
        )}
        onEndReached={() => this.fetchChannels(false)}
        onEndReachedThreshold={0.1}
        />
        <Modal isVisible={this.state.showNewChannelModal}
               avoidKeyboard={true}
               style={styles.page.newChannelModal}
               animationInTiming={400}
               animationOutTiming={400}>
               <NewChannelScreen navigation={this.props.navigation} 
                         onSuccess={this.onPostSent}
                         onDismiss={() => this.setState({ showNewChannelModal: false })}/>
        </Modal>
      </ScrollView>
    );
  }
}

const styles = {
  page: StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff'
    },
    newChannelModal: {
      width: '100%',
      margin: 0,
      padding: 0
    },
    newChannelButton: {
      marginRight: 10
    }
  }),
  channel: StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      padding: 12,
      marginTop: 2
    },
    channelTitle: {
      fontSize: 22,
      fontWeight: 'bold'
    }
  })
};

interface ChannelsScreenState {
  channels: any[];
  refreshing: boolean;
  showNewChannelModal: boolean
}

interface ChannelsScreenProps {
  navigation: any;
}