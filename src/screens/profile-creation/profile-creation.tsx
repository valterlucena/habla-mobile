import React from "react";
import { Text, StyleSheet, View, SafeAreaView, StatusBar, Dimensions, TextInput, TouchableOpacity, ActivityIndicator, Image, Picker, ScrollView } from "react-native";
import { client } from "../../services/client";
import gql from "graphql-tag";
import THEME from "../../theme/theme";
import i18n from 'i18n-js';
import AutoHeightImage from 'react-native-auto-height-image';
import ChangePhotoComponent from '../../components/change-photo/change-photo'

export default class ProfileCreationScreen extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    let propsProfile;
    let photo;
    if (this.props.navigation.state.params && this.props.navigation.state.params.profile) {
      propsProfile = {
        name: this.props.navigation.state.params.profile.name,
        username: this.props.navigation.state.params.profile.username,
        bio: this.props.navigation.state.params.profile.bio,
        website: this.props.navigation.state.params.profile.website,
        phone: this.props.navigation.state.params.profile.phone,
        gender: this.props.navigation.state.params.profile.gender
      }

      photo = { uri: this.props.navigation.state.params.profile.photoURL }
    }

    this.state = {
      profile: propsProfile || {
        name: "",
        username: "",
        bio: "",
        website: "",
        phone: "",
        gender: ""
      },
      photo: photo,
      loading: false
    };
  }

  submit = async () => {
    this.setState({ loading: true });

    try {
      const response = await client.mutate({
        variables: {
          profile: this.state.profile,
          photo: this.state.photo && this.state.photo.uri && this.state.photo.uri.startsWith('data') && this.state.photo.uri
        },
        mutation: gql(`
          mutation UpdateProfile ($profile: ProfileInput!, $photo: Upload) {
            updateProfile(profile: $profile, photo: $photo) {
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

  changePhoto = async (profilePhoto) => {
    this.setState({ photo: { uri: profilePhoto }});
  }

  render() {
    const photoDefault = require('../../../assets/icon-user-default.png');
    return (
      <SafeAreaView>
        <StatusBar barStyle="dark-content" />
        <ScrollView style={styles.page.container.view}>
          <View>
            <AutoHeightImage width={Dimensions.get('window').width} source={this.state.photo} fallbackSource={photoDefault} style={styles.page.form.photo} />
            <ChangePhotoComponent onPhotoSelected={this.changePhoto} enabled={!this.state.saving} />
          </View>
          <View style={styles.page.header.row}>
            <Text style={styles.page.header.viewTitle}>
              {i18n.t('screens.profileCreation.title')}
            </Text>
            {this.state.profile.photoURL ? <Image style={{ width: 40, height: 40, borderRadius: 20 }} source={{ uri: this.state.profile.photoURL }} /> : null}
          </View>

          <Text style={styles.page.header.viewSubtitle}>
            {i18n.t('screens.profileCreation.subtitle', { name: this.state.profile.name })}
          </Text>

          <View style={styles.page.form.row}>
            <Text style={styles.page.form.label}>{i18n.t('screens.profileCreation.labels.name')}</Text>
            <TextInput style={styles.page.form.textInput}
              placeholder={i18n.t('screens.profileCreation.labels.name')}
              value={this.state.profile.name}
              onChangeText={text => this.setState({ profile: { ...this.state.profile, name: text } })}
              underlineColorAndroid="rgba(0, 0, 0, 0)"
              editable={!this.state.loading} />
          </View>

          <View style={styles.page.form.row}>
            <Text style={styles.page.form.label}>{i18n.t('screens.profileCreation.labels.username')}</Text>
            <TextInput style={styles.page.form.textInput}
              placeholder={i18n.t('screens.profileCreation.labels.username')}
              value={this.state.profile.username}
              onChangeText={text => this.setState({ profile: { ...this.state.profile, username: text } })}
              underlineColorAndroid="rgba(0, 0, 0, 0)"
              autoCapitalize="none"
              keyboardType="twitter"
              editable={!this.state.loading} />
          </View>

          <View style={styles.page.form.row}>
            <Text style={styles.page.form.label}>{i18n.t('screens.profileCreation.labels.bio')}</Text>
            <TextInput style={styles.page.form.textInput}
              placeholder={i18n.t('screens.profileCreation.labels.bio')}
              value={this.state.profile.bio}
              onChangeText={text => this.setState({ profile: { ...this.state.profile, bio: text } })}
              underlineColorAndroid="rgba(0, 0, 0, 0)"
              editable={!this.state.loading} />
          </View>

          <View style={styles.page.form.row}>
            <Text style={styles.page.form.label}>{i18n.t('screens.profileCreation.labels.website')}</Text>
            <TextInput style={styles.page.form.textInput}
              placeholder={i18n.t('screens.profileCreation.labels.website')}
              value={this.state.profile.website}
              onChangeText={text => this.setState({ profile: { ...this.state.profile, website: text } })}
              underlineColorAndroid="rgba(0, 0, 0, 0)"
              autoCapitalize="none"
              editable={!this.state.loading} />
          </View>

          <View style={styles.page.form.row}>
            <Text style={styles.page.form.label}>{i18n.t('screens.profileCreation.labels.phone')}</Text>
            <TextInput style={styles.page.form.textInput}
              placeholder={i18n.t('screens.profileCreation.labels.phone')}
              value={this.state.profile.phone}
              onChangeText={text => this.setState({ profile: { ...this.state.profile, phone: text } })}
              underlineColorAndroid="rgba(0, 0, 0, 0)"
              keyboardType="numeric"
              editable={!this.state.loading} />
          </View>

          <View style={styles.page.form.row}>
            <Text style={styles.page.form.label}>{i18n.t('global.enums.gender.gender')}</Text>
            <Picker
              style={styles.page.form.picker}
              selectedValue={this.state.profile.gender}
              onValueChange={text => this.setState({ profile: { ...this.state.profile, gender: text } })}>

              <Picker.Item label={i18n.t('global.enums.gender.male')} value="MALE" />
              <Picker.Item label={i18n.t('global.enums.gender.female')} value="FEMALE" />
              <Picker.Item label={i18n.t('global.enums.gender.other')} value="OTHER" />
            </Picker>
          </View>

          <TouchableOpacity style={styles.page.form.submitButton}
            onPress={this.submit}
            disabled={this.state.loading}
            activeOpacity={1}>
            {this.state.loading ?
              (<ActivityIndicator color="white"
                size="small" />)
              : (<Text style={styles.page.form.submitButtonText}>{i18n.t('screens.profileCreation.buttons.next')}</Text>)}
          </TouchableOpacity>
        </ScrollView>
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
        paddingVertical: 15,
        borderBottomColor: '#eee',
        borderBottomWidth: 1
      },
      label: {
        fontSize: 18,
        fontWeight: "bold"
      },
      photo: {
        width: '100%'
      },
      textInput: {
        width: "70%",
        fontSize: 18
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
    })
  }
};