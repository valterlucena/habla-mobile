import React from "react";
import { Text, StyleSheet, View, SafeAreaView, StatusBar, TextInput, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { client } from "../../services/client";
import gql from "graphql-tag";
import THEME from "../../theme/theme";
import i18n from 'i18n-js';

export default class ProfileCreationScreen extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    let propsProfile;

    if (this.props.navigation.state.params && this.props.navigation.state.params.user) {
      propsProfile = {
        name: this.props.navigation.state.params.user.displayName,
        photoURL: this.props.navigation.state.params.user.photoURL
      };
    }

    this.state = {
      profile: propsProfile || {
        name: "",
        username: ""
      },
      loading: false
    };
  }

  submit = async() => {
    this.setState({ loading: true });

    try {
      const response = await client.mutate({
        variables: { 
          profile: this.state.profile
        },
        mutation: gql(`
          mutation UpdateProfile ($profile: ProfileInput!) {
            updateProfile(profile: $profile) {
              uid
            }
          }
        `)
      });

      this.props.navigation.navigate("TabsNavigator");
    } catch (error) {
      this.setState({ loading: false });
      console.log(JSON.stringify(error));
    }
  }

  render() {
      return (
        <SafeAreaView>
          <StatusBar barStyle="dark-content"/>
          <View style={styles.page.container.view}>
            <View style={styles.page.header.row}>
              <Text style={styles.page.header.viewTitle}>
                { i18n.t('screens.profileCreation.title') }
              </Text>
              { this.state.profile.photoURL? <Image style={{ width: 40, height: 40, borderRadius: 20 }} source={{ uri: this.state.profile.photoURL }}/> : null }
            </View>
            <Text style={styles.page.header.viewSubtitle}> 
              { i18n.t('screens.profileCreation.subtitle', { name: this.state.profile.name }) } 
            </Text>
            <TextInput style={styles.page.profileForm.textInput}
                       placeholder="Name"
                       value={this.state.profile.name}
                       onChangeText={text => this.setState({ profile: { ...this.state.profile, name: text }})}
                       underlineColorAndroid="rgba(0, 0, 0, 0)"
                       editable={!this.state.loading}/>       
            <TextInput style={styles.page.profileForm.textInput}
                       placeholder="Username"
                       value={this.state.profile.username}
                       onChangeText={text => this.setState({ profile: { ...this.state.profile, username: text }})}
                       underlineColorAndroid="rgba(0, 0, 0, 0)"
                       autoCapitalize="none"
                       keyboardType="twitter"
                       editable={!this.state.loading}/>
              <TouchableOpacity style={styles.page.profileForm.submitButton}
                                onPress={this.submit}
                                disabled={this.state.loading}
                                activeOpacity={1}>
                {this.state.loading? 
                    (<ActivityIndicator color="white"
                                        size="small"/>)
                  : (<Text style={styles.page.profileForm.submitButtonText}>{ i18n.t('screens.profileCreation.buttons.next') }</Text>) }
                </TouchableOpacity> 
          </View>
        </SafeAreaView>
      );
  }
}


const styles = {
  page: {
    container: StyleSheet.create({
      view: {
        padding: 16
      }
    }),
    header: StyleSheet.create({
      row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5
      },
      viewTitle: {
        fontSize: 35,
        fontWeight: "bold"
      },
      viewSubtitle: {
        fontSize: 20,
        textAlign: 'justify'
      }
    }),
    profileForm: StyleSheet.create({
      textInput: {
        width: "100%",
        fontSize: 20,
        marginTop: 5,
        paddingVertical: 14,
      },
      submitButton: {
        paddingHorizontal: 14,
        paddingVertical: 14,
        backgroundColor: THEME.colors.primary.default,
        width: '100%',
        borderRadius: 5,
        alignItems: "center"
      },
      submitButtonText: {
        fontSize: 18,
        textAlign: 'center',
        color: "#FFFFFF",
        fontWeight: "bold"
      }
    })
  }
};