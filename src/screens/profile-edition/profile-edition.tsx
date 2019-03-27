import React from "react";
import { Text, View, SafeAreaView } from "react-native";
import { client } from "../../services/client";
import gql from "graphql-tag";
import THEME from "../../theme/theme";
import i18n from 'i18n-js';

export default class ProfileCreationScreen extends React.Component<any, any> {
  constructor(props: any){
      super(props);
      this.state = {};
  }

  render() {
    return (
      <SafeAreaView>
          <View>
          </View>
      </SafeAreaView>
    );
  }
}

const styles = {}