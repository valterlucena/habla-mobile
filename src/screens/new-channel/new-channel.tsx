import * as React from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, TextInput, ActivityIndicator} from 'react-native'
import { FontAwesome } from '@expo/vector-icons';
import THEME from '../../theme/theme';
import i18n from 'i18n-js';
import { client } from '../../services/client';
import gql from 'graphql-tag';

export default class NewChannelScreen extends React.Component<NewChannelScreenProps, NewChannelScreenState>{
    constructor(props: NewChannelScreenProps) {
        super(props);
    
        this.state = { channel: { body: null }, teste: false };
    }

    componentWillMount() {
        this.resetChannel();
    }

    dismiss = () => {
        this.props.onDismiss && this.props.onDismiss();
    }

    handleChannelInput = (text: string) => {
        this.setState({ channel: { ...this.state.channel, body: text }});
      }

    sendChannel = async() => {
        this.setState({ teste: true });
    
        try {
          const response = await client.mutate({
            variables: { 
              channel: this.state.channel
            },
            mutation: gql(`
              mutation CreateChannel ($channel: ChannelInput!) {
                createChannel(channel: $channel) {
                  id,
                  name,
                  createdAt
                }
              }
            `),
            context: {
            }
          });
    
          this.props.onSuccess && this.props.onSuccess(response.data.createChannel);
        } catch (error) {
          console.log(error);
        } 
    
        this.setState({  teste: false });
    }

      resetChannel() {
        this.setState({
          channel: {
            
          }
        });
      }

    render() {
        return (
            <View style={styles.newChannel.container}>
                <StatusBar hidden={true}></StatusBar>
                <View style={styles.header.container}>
                    <TouchableOpacity onPress={this.dismiss}>
                        <FontAwesome name="chevron-left" size={35} color={THEME.colors.primary.default}></FontAwesome>
                    </TouchableOpacity>
                </View>
                <TextInput style={styles.newChannel.input}
                  onChangeText={this.handleChannelInput}
                  value={this.state.channel.body}
                  placeholderTextColor="white"
                  placeholder={i18n.t('screens.newPost.inputPlaceholder')}
                  editable={!this.state.teste}
                  multiline={true}
                  underlineColorAndroid="rgba(0,0,0,0)"/>
                <TouchableOpacity style={styles.newChannel.sendButton}
                        onPress={this.sendChannel}
                        disabled={this.state.teste || !this.state.channel.body || this.state.channel.body.trim() == ''}
                          activeOpacity={1}>
                     {this.state.teste? <ActivityIndicator color="white"/>: <Text style={styles.newChannel.sendButtonText}>{ i18n.t('screens.newPost.buttons.submit') }</Text>}
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
            padding: 16,
            justifyContent: 'space-between'
        }
    }),
    newChannel: StyleSheet.create({
        container: {
            backgroundColor: THEME.colors.secondary.light,
            flexGrow: 1,
        },
        input: {
            marginTop: 5,
            padding: 16,
            backgroundColor: THEME.colors.secondary.light,
            color: 'white',
            flex: 1,
            fontSize: 25,
            flexGrow: 1,
            fontWeight: "bold"
          },
          sendButton: {
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: THEME.colors.primary.default,
            width: '100%',
          },
          sendButtonText: {
            fontSize: 18,
            textAlign: 'center',
            color: 'white',
            fontWeight: "bold"
          },
    })
}

interface NewChannelScreenProps{
    navigation: any;
    onSuccess: Function;
    onDismiss: Function;

}

interface NewChannelScreenState{
    teste: boolean;
    channel: any;
}