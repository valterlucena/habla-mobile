import React from "react";
import { Text, View, SafeAreaView } from "react-native";
import THEME from "../../theme/theme";

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

      this.state = {};
  }

  render() {
    return (
      <SafeAreaView>
          <View>
            <Text>{this.props.navigation.state.params.profile.name}</Text>
            <Text>{this.props.navigation.state.params.profile.username}</Text>
            <Text>{this.props.navigation.state.params.profile.bio}</Text>
            <Text>{this.props.navigation.state.params.profile.photoURL}</Text>
          </View>
      </SafeAreaView>
    );
  }
}

const styles = {}