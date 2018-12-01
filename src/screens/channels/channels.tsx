import * as React from 'react';
import { StyleSheet, Text, ScrollView, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { client } from '../../services/client';
import gql from 'graphql-tag';

export default class ChannelsScreen extends React.Component<ChannelsScreenProps, ChannelsScreenState> {
  static navigationOptions = {
    title: 'Channels', 
    headerStyle: {
      backgroundColor: '#795548',
      borderBottomWidth: 0,
    },
    headerTitleStyle: {
      color: '#F5F5F5'
    }
  };

  constructor(props) {
    super(props);

    this.state = { channels: [], refreshing: false };
  }

  componentWillMount() {
    this.refresh();
  }

  refresh = async() => {
    this.setState({ refreshing: true });
    
    try {
      await this.fetchChannels();
    } catch (error) {
      console.log(error);
    }
      
    this.setState({ refreshing: false });
  }

  fetchChannels = async() => {
    try {
      const response = await client.query<any>({
        query: gql(`
          {
            channels {
              id,
              name
            }
          }
        `)
      });
    
      this.setState({ channels: response.data.channels });
    } catch (error) {
      console.log(error);
    }
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
        )}/>
      </ScrollView>
    );
  }
}

const styles = {
  page: StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff'
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
}

interface ChannelsScreenProps {
  navigation: any;
}