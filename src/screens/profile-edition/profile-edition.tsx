import React from "react";
import { Text, StyleSheet, View, SafeAreaView, TextInput, StatusBar, TouchableOpacity, Picker } from "react-native";
import THEME from "../../theme/theme";
import { client } from "../../services/client";
import gql from "graphql-tag";

export default class ProfileCreationScreen extends React.Component<any, any> {
  static navigationOptions = () => {
    return {
      title: 'Editar perfil',
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
            }
          }
        `)
      });
      this.props.navigation.navigate("ProfileScreen");
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  render() {
    const { name, username, bio, website, phone, gender } = this.state.profile;
    return (
      <SafeAreaView>
        <StatusBar barStyle="dark-content"/>
          <View style={styles.page.container.view}>
            <View style={styles.page.form.row}>
              <Text style={styles.page.form.label}>Name:</Text>
              <TextInput 
              style={styles.page.form.textInput}
              placeholder="Name"
              value={name}
              onChangeText={text => this.setState({ profile: { ...this.state.profile, name: text }})}
              underlineColorAndroid="rgba(0, 0, 0, 0)"
              />
            </View>
            
            <View style={styles.page.form.row}>
              <Text style={styles.page.form.label}>Username:</Text>
              <TextInput 
                style={styles.page.form.textInput}
                placeholder="Username"
                value={username}
                onChangeText={text => this.setState({ profile: { ...this.state.profile, username: text }})}
                autoCapitalize="none"
                keyboardType="twitter"
                underlineColorAndroid="rgba(0, 0, 0, 0)"
              />
            </View>

            <View style={styles.page.form.row}>
              <Text style={styles.page.form.label}>Bio:</Text>
              <TextInput 
                style={styles.page.form.textInput}
                placeholder="Bio"
                value={bio}
                onChangeText={text => this.setState({ profile: { ...this.state.profile, bio: text }})}
                underlineColorAndroid="rgba(0, 0, 0, 0)"
              />
            </View>

            <View style={styles.page.form.row}>
              <Text style={styles.page.form.label}>Website:</Text>
              <TextInput 
                style={styles.page.form.textInput}
                placeholder="Website"
                value={website}
                onChangeText={text => this.setState({ profile: { ...this.state.profile, website: text }})}
                underlineColorAndroid="rgba(0, 0, 0, 0)"
              />
            </View>

            <View style={styles.page.form.row}>
              <Text style={styles.page.form.label}>Phone:</Text>
              <TextInput 
                style={styles.page.form.textInput}
                placeholder="Phone"
                value={phone}
                onChangeText={text => this.setState({ profile: { ...this.state.profile, phone: text }})}
                underlineColorAndroid="rgba(0, 0, 0, 0)"
              />
            </View>

            <View style={styles.page.form.row}>
              <Text style={styles.page.form.label}>Gender:</Text>
              <Picker 
                style={styles.page.form.picker}
                selectedValue={gender}
                onValueChange={text => this.setState({ profile: { ...this.state.profile, gender: text }})}
              >
                <Picker.Item label="Masculino" value="MALE" />
                <Picker.Item label="Feminino" value="FEMALE" />
                <Picker.Item label="Outro" value="OTHER" />
              </Picker>
            </View>
          </View>
          <View style={styles.page.container.view}>
            <TouchableOpacity 
              style={styles.page.form.submitButton}
              onPress={this.submit}
              activeOpacity={1}>
              <Text style={styles.page.form.submitButtonText}>Salvar</Text> 
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