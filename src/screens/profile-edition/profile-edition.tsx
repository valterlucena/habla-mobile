import React from "react";
import { Text, View, SafeAreaView, TextInput, StatusBar, TouchableOpacity } from "react-native";
import THEME from "../../theme/theme";

export default class ProfileCreationScreen extends React.Component<any, any> {
  static navigationOptions = () => {
    return {
      title: 'Editar perfil',
      headerRight: (
        <TouchableOpacity><Text>Salvar</Text></TouchableOpacity>
      ), 
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
        },
        loading: false
      };
  }

  render() {
    const { name, username, bio, website, phone, gender } = this.state.profile;
    console.log(this.state);
    return (
      <SafeAreaView>
        <StatusBar barStyle="dark-content"/>
          <View>
            <Text>Nome</Text>
            <TextInput placeholder="Name"
                       value={name}
                       onChangeText={text => this.setState({ profile: { ...this.state.profile, name: text }})}
                       underlineColorAndroid="rgba(0, 0, 0, 0)"
                       editable={!this.state.loading}/>
            <Text>Username</Text>
            <TextInput placeholder="Username"
                       value={username}
                       onChangeText={text => this.setState({ profile: { ...this.state.profile, username: text }})}
                       underlineColorAndroid="rgba(0, 0, 0, 0)"
                       editable={!this.state.loading}/>
            <Text>Bio</Text>
            <TextInput placeholder="Bio"
                       value={bio}
                       onChangeText={text => this.setState({ profile: { ...this.state.profile, bio: text }})}
                       underlineColorAndroid="rgba(0, 0, 0, 0)"
                       editable={!this.state.loading}/>
            <Text>Website</Text>
            <TextInput placeholder="Website"
                       value={website}
                       onChangeText={text => this.setState({ profile: { ...this.state.profile, website: text }})}
                       underlineColorAndroid="rgba(0, 0, 0, 0)"
                       editable={!this.state.loading}/>
            <Text>Phone</Text>
            <TextInput placeholder="Phone"
                       value={phone}
                       onChangeText={text => this.setState({ profile: { ...this.state.profile, phone: text }})}
                       underlineColorAndroid="rgba(0, 0, 0, 0)"
                       editable={!this.state.loading}/>
            <Text>Gender</Text>
            <TextInput placeholder="Gender"
                       value={gender}
                       onChangeText={text => this.setState({ profile: { ...this.state.profile, gender: text }})}
                       underlineColorAndroid="rgba(0, 0, 0, 0)"
                       editable={!this.state.loading}/>
          </View>
      </SafeAreaView>
    );
  }
}

const styles = {}