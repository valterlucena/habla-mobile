import React from "react";
import { Text, StyleSheet, View, ScrollView, SafeAreaView, TextInput, StatusBar, TouchableOpacity, Picker } from "react-native";
import THEME from "../../theme/theme";
import { client } from "../../services/client";
import gql from "graphql-tag";
import i18n from 'i18n-js';

export default class ProfileCreationScreen extends React.Component<any, any> {
  static navigationOptions = () => {
    return {
      title: i18n.t('screens.profileEdition.title'),
      headerStyle: {
        backgroundColor: THEME.colors.primary.default,
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        color: '#F5F5F5'
      }
    }
  };

  constructor(props: any){
      super(props);

      let propsProfile;

      if (this.props.navigation.state.params && this.props.navigation.state.params.profile) {
        propsProfile = {
          name: this.props.navigation.state.params.profile.name,
          username: this.props.navigation.state.params.profile.username,
          bio: this.props.navigation.state.params.profile.bio,
          website: this.props.navigation.state.params.profile.website,
          phone: this.props.navigation.state.params.profile.phone,
          gender: this.props.navigation.state.params.profile.gender
        }
      }

      this.state = {
        profile: propsProfile || {
          name: "",
          username: "",
          bio: "",
          website: "",
          phone: "",
          gender: ""
        }
      };
  }

  submit = async() => {
    try {
      const response = await client.mutate({
        variables: { 
          profile: this.state.profile
        },
        mutation: gql(`
          mutation UpdateProfile ($profile: ProfileInput!) {
            updateProfile(profile: $profile) {
              uid
              name
              username
              photoURL
              bio
              website
              phone
              gender
            }
          }
        `)
      });

      this.props.navigation.navigate("ProfileScreen");
      this.props.navigation.state.params.onProfileEdition && this.props.navigation.state.params.onProfileEdition(response.data.updateProfile);
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  render() {
    const { name, username, bio, website, phone, gender } = this.state.profile;
    return (
      <SafeAreaView>
        <StatusBar barStyle="dark-content"/>
          <ScrollView style={styles.page.container.view}>
            <View style={styles.page.form.row}>
              <Text style={styles.page.form.label}>{i18n.t('screens.profileEdition.labels.name')}:</Text>
              <TextInput 
              style={styles.page.form.textInput}
              placeholder={i18n.t('screens.profileEdition.labels.name')}
              value={name}
              onChangeText={text => this.setState({ profile: { ...this.state.profile, name: text }})}
              underlineColorAndroid="rgba(0, 0, 0, 0)"
              />
            </View>
            
            <View style={styles.page.form.row}>
              <Text style={styles.page.form.label}>{i18n.t('screens.profileEdition.labels.username')}:</Text>
              <TextInput 
                style={styles.page.form.textInput}
                placeholder={i18n.t('screens.profileEdition.labels.username')}
                value={username}
                onChangeText={text => this.setState({ profile: { ...this.state.profile, username: text }})}
                autoCapitalize="none"
                keyboardType="twitter"
                underlineColorAndroid="rgba(0, 0, 0, 0)"
              />
            </View>

            <View style={styles.page.form.row}>
              <Text style={styles.page.form.label}>{i18n.t('screens.profileEdition.labels.bio')}:</Text>
              <TextInput 
                style={styles.page.form.textInput}
                placeholder={i18n.t('screens.profileEdition.labels.bio')}
                value={bio}
                onChangeText={text => this.setState({ profile: { ...this.state.profile, bio: text }})}
                underlineColorAndroid="rgba(0, 0, 0, 0)"
              />
            </View>

            <View style={styles.page.form.row}>
              <Text style={styles.page.form.label}>{i18n.t('screens.profileEdition.labels.website')}:</Text>
              <TextInput 
                style={styles.page.form.textInput}
                placeholder={i18n.t('screens.profileEdition.labels.website')}
                value={website}
                onChangeText={text => this.setState({ profile: { ...this.state.profile, website: text }})}
                autoCapitalize="none"
                underlineColorAndroid="rgba(0, 0, 0, 0)"
              />
            </View>

            <View style={styles.page.form.row}>
              <Text style={styles.page.form.label}>{i18n.t('screens.profileEdition.labels.phone')}:</Text>
              <TextInput 
                style={styles.page.form.textInput}
                placeholder={i18n.t('screens.profileEdition.labels.phone')}
                value={phone}
                onChangeText={text => this.setState({ profile: { ...this.state.profile, phone: text }})}
                keyboardType="numeric"
                underlineColorAndroid="rgba(0, 0, 0, 0)"
              />
            </View>

            <View style={styles.page.form.row}>
              <Text style={styles.page.form.label}>{i18n.t('global.enums.gender.gender')}:</Text>
              <Picker 
                style={styles.page.form.picker}
                selectedValue={gender}
                onValueChange={text => this.setState({ profile: { ...this.state.profile, gender: text }})}
              >
                <Picker.Item label={i18n.t('global.enums.gender.male')} value="MALE" />
                <Picker.Item label={i18n.t('global.enums.gender.female')} value="FEMALE" />
                <Picker.Item label={i18n.t('global.enums.gender.other')} value="OTHER" />
              </Picker>
            </View>
          </ScrollView>
          <View style={styles.page.container.view}>
            <TouchableOpacity 
              style={styles.page.form.submitButton}
              onPress={this.submit}
              activeOpacity={1}>
              <Text style={styles.page.form.submitButtonText}>{i18n.t('screens.profileEdition.buttons.save')}</Text> 
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
    form: StyleSheet.create({
      row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 5,
        marginTop: 15,
      },
      label: {
        fontSize: 20,
        fontWeight: "bold"
      },
      textInput: {
        width: "70%",
        fontSize: 20
      },
      picker: {
        width: "70%"
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
}