import React, { Component } from 'react';
import { FlatList, View, StyleSheet, Text, ScrollView } from 'react-native';

export default class TimelineScreen extends Component {
  static navigationOptions = {
    title: 'Timeline'
  };

  constructor(props) {
    super(props);

    this.state = { posts: [] };
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <FlatList data={this.state.posts}
                  keyExtractor={(item) => item._id.toString()}
                  renderItem={({item}) =>(
                    <View style={styles.post}>
                      <Text style={styles.postTitle}>{ item.title }</Text>
                      <Text style={styles.postBody}>{ item.body }</Text>
                    </View>
        )}/>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
  post: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 2,
  },
  postTitle: {
    fontSize: 16,
    color: "#000"
  },
  postBody: {
    fontSize: 12,
    color: "#000"
  }
});
