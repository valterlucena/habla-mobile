import React from "react";
import { Text, StyleSheet, View, ScrollView, SafeAreaView, TextInput, Dimensions, StatusBar, TouchableOpacity, Picker, ActivityIndicator, Button, Alert } from "react-native";
import THEME from "../../theme/theme";
import { client } from "../../services/client";
import gql from "graphql-tag";
import i18n from 'i18n-js';
import AutoHeightImage from 'react-native-auto-height-image';
import ChangePhotoComponent from '../../components/change-photo/change-photo'
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { Permissions, Location } from 'expo';

export default class ProfileCreationScreen extends React.Component<any, any> {
  static navigationOptions = ({ navigation }) => {
    return {
      title: i18n.t('screens.profileEdition.title'),
      headerStyle: {
        backgroundColor: THEME.colors.primary.default,
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        color: '#F5F5F5'
      },
      headerRight: (
        <TouchableOpacity onPress={navigation.getParam('saveTapped')} style={styles.page.header.saveButton}>
          {navigation.getParam('saving')? <ActivityIndicator color="white" size="small"/>: <Text style={styles.page.form.submitButtonText}>{i18n.t('screens.profileEdition.buttons.save')}</Text>}
        </TouchableOpacity>
      )
    }
  };

  constructor(props: any) {
    super(props);

    let propsProfile, photo, home;

    if (this.props.navigation.state.params && this.props.navigation.state.params.profile) {
      propsProfile = {
        name: this.props.navigation.state.params.profile.name,
        username: this.props.navigation.state.params.profile.username,
        bio: this.props.navigation.state.params.profile.bio,
        website: this.props.navigation.state.params.profile.website,
        phone: this.props.navigation.state.params.profile.phone,
        gender: this.props.navigation.state.params.profile.gender
      }

      if (this.props.navigation.state.params.profile.photoURL) {
        photo = { uri: this.props.navigation.state.params.profile.photoURL };
      }
      
      if (this.props.navigation.state.params.profile.home) {
        home = this.props.navigation.state.params.profile.home;
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
      },
      photo: photo,
      saving: false,
      home: home
    };

    this.props.navigation.setParams({ saveTapped: this.submit, state: this.state });
  }

  submit = async () => {
    this.setState({ saving: true });
    this.props.navigation.setParams({ saving: true });
    
    try {
      const response = await client.mutate({
        variables: {
          profile: this.state.profile,
          photo: this.state.photo && this.state.photo.uri && this.state.photo.uri.startsWith('data') && this.state.photo.uri,
          updateHome: !!this.state.home
        },
        mutation: gql(`
          mutation UpdateProfile ($profile: ProfileInput!, $photo: Upload, $updateHome: Boolean) {
            updateProfile(profile: $profile, photo: $photo, updateHome: $updateHome) {
              uid
              name
              username
              photoURL
              bio
              website
              phone
              gender
              home
            }
          }
        `),
        fetchPolicy: 'no-cache',
        context: {
          location: {
            latitude: this.state.home[0],
            longitude: this.state.home[1]
          }
        }
      });

      this.props.navigation.navigate("ProfileScreen");
      this.props.navigation.state.params.onProfileEdition && this.props.navigation.state.params.onProfileEdition(response.data.updateProfile);
    } catch (error) {
      console.log(JSON.stringify(error));
    } finally {
      this.setState({ saving: false });
      this.props.navigation.setParams({ saving: false });
    }
  }

  changePhoto = async (profilePhoto) => {
    if (!profilePhoto) return; 

    this.setState({ photo: { uri: profilePhoto }});
  }

  changeHome = async () => {
    await Permissions.askAsync(Permissions.LOCATION);
    const location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
    const coords = location.coords;
    this.setState({ home:[coords.latitude, coords.longitude] }, this.getLocalInfo);
  }

  componentWillMount() {
    this.getLocalInfo();
  }

  getLocalInfo = async () => {
    if (!this.state.home) return;

    let local: any = await Location.reverseGeocodeAsync({ latitude: this.state.home[0], longitude: this.state.home[1] });
    
    this.setState({ local: local[0].city || local[0].name });
  }

  showAlert = () => {
    Alert.alert(
      i18n.t('screens.profileEdition.alert.title'),
      i18n.t('screens.profileEdition.alert.message'),
      [
        {text: i18n.t('screens.profileEdition.buttons.cancel'), onPress: () => {}},
        {text: i18n.t('screens.profileEdition.buttons.define'), onPress: () => this.changeHome()}
      ],
      { cancelable: false}
    )
  }

  render() {
    const { name, username, bio, website, phone, gender } = this.state.profile;

    const photoDefault = require('../../../assets/avatar-placeholder.png');

    return (
      <SafeAreaView>
        <StatusBar barStyle="light-content"/>
        <ScrollView>
          <View>
            <AutoHeightImage width={Dimensions.get('window').width} source={this.state.photo || photoDefault} fallbackSource={photoDefault} style={styles.page.form.photo}/>
            <ChangePhotoComponent onPhotoSelected={this.changePhoto} enabled={!this.state.saving}>
              <Text
                    style={styles.page.form.textChangePhoto}>
                    {i18n.t('screens.profile.changePhoto.title')}
              </Text>
            </ChangePhotoComponent>
          </View>

          <View style={styles.page.form.row}>
            <Text style={styles.page.form.label}>{i18n.t('screens.profileEdition.labels.home')}</Text>
            <TouchableOpacity onPress={this.showAlert} style={styles.page.form.textInput}>
              { this.state.home ? <Text style={styles.page.form.textLocal}>{this.state.local}</Text> 
              : <Text style={styles.page.form.textLocal}>{i18n.t('screens.profileEdition.labels.undefined')}</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.page.form.row}>
            <Text style={styles.page.form.label}>{i18n.t('screens.profileEdition.labels.name')}</Text>
            <TextInput
              style={styles.page.form.textInput}
              placeholder={i18n.t('screens.profileEdition.labels.name')}
              value={name}
              onChangeText={text => this.setState({ profile: { ...this.state.profile, name: text } })}
              underlineColorAndroid="rgba(0, 0, 0, 0)"
              editable={!this.state.saving}
            />
          </View>

          <View style={styles.page.form.row}>
            <Text style={styles.page.form.label}>{i18n.t('screens.profileEdition.labels.username')}</Text>
            <TextInput
              style={styles.page.form.textInput}
              placeholder={i18n.t('screens.profileEdition.labels.username')}
              value={username}
              onChangeText={text => this.setState({ profile: { ...this.state.profile, username: text } })}
              autoCapitalize="none"
              keyboardType="twitter"
              underlineColorAndroid="rgba(0, 0, 0, 0)"
              editable={!this.state.saving}
            />
          </View>

          <View style={styles.page.form.row}>
            <Text style={styles.page.form.label}>{i18n.t('screens.profileEdition.labels.bio')}</Text>
            <TextInput
              style={styles.page.form.textInput}
              placeholder={i18n.t('screens.profileEdition.labels.bio')}
              value={bio}
              onChangeText={text => this.setState({ profile: { ...this.state.profile, bio: text } })}
              underlineColorAndroid="rgba(0, 0, 0, 0)"
              editable={!this.state.saving}
            />
          </View>

          <View style={styles.page.form.row}>
            <Text style={styles.page.form.label}>{i18n.t('screens.profileEdition.labels.website')}</Text>
            <TextInput
              style={styles.page.form.textInput}
              placeholder={i18n.t('screens.profileEdition.labels.website')}
              value={website}
              onChangeText={text => this.setState({ profile: { ...this.state.profile, website: text } })}
              autoCapitalize="none"
              underlineColorAndroid="rgba(0, 0, 0, 0)"
              editable={!this.state.saving}
            />
          </View>

          <View style={styles.page.form.row}>
            <Text style={styles.page.form.label}>{i18n.t('screens.profileEdition.labels.phone')}</Text>
            <TextInput
              style={styles.page.form.textInput}
              placeholder={i18n.t('screens.profileEdition.labels.phone')}
              value={phone}
              onChangeText={text => this.setState({ profile: { ...this.state.profile, phone: text } })}
              keyboardType="numeric"
              underlineColorAndroid="rgba(0, 0, 0, 0)"
              editable={!this.state.saving}
            />
          </View>

          <View style={styles.page.form.row}>
            <Text style={styles.page.form.label}>{i18n.t('global.enums.gender.gender')}</Text>
            <Picker
              style={styles.page.form.picker}
              selectedValue={gender}
              onValueChange={text => this.setState({ profile: { ...this.state.profile, gender: text } })}
              enabled={!this.state.saving}
            >
              <Picker.Item label={i18n.t('global.enums.gender.male')} value="MALE" />
              <Picker.Item label={i18n.t('global.enums.gender.female')} value="FEMALE" />
              <Picker.Item label={i18n.t('global.enums.gender.other')} value="OTHER" />
            </Picker>
          </View>
          <KeyboardSpacer/>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = {
  page: {
    header: StyleSheet.create({
      saveButton: { 
        marginRight: 10
      }
    }),
    form: StyleSheet.create({
      row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingHorizontal: 16
      },
      photo: {
        width: '100%'
      },
      label: {
        fontSize: 18,
        fontWeight: "bold"
      },
      textInput: {
        width: "70%",
        fontSize: 18
      },
      textLocal: {
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
        alignItems: "center"
      },
      submitButtonText: {
        fontSize: 18,
        textAlign: 'center',
        color: "#FFFFFF",
        fontWeight: "bold"
      },
      textChangePhoto: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
        paddingVertical: 10
      }
    })
  }
}