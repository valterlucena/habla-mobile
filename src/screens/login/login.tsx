import * as React from "react";
import { ScrollView, Text, TextInput, ViewStyle, TouchableOpacity, TextStyle, ActivityIndicator, StyleSheet } from "react-native";
import { api } from "../../services/api";
import firebase from 'firebase';

export default class LoginScreen extends React.Component<{}, LoginState> {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);

        this.state = { loading: false, credentials: {} };
    }

    render() {
        return (
            <ScrollView contentContainerStyle={styles.page.container} bounces={false}>
                <Text style={styles.login.headerText}>Habla!</Text>
                <TextInput placeholder="Email"
                           style={styles.login.input}
                           editable={!this.state.loading}
                           underlineColorAndroid='rgba(0,0,0,0)'
                           autoCapitalize="none"
                           onChangeText={text => this.setState({ credentials: { ...this.state.credentials, email: text }})}></TextInput>
                <TextInput placeholder="Password"
                           style={styles.login.input}
                           editable={!this.state.loading}
                           secureTextEntry={true}
                           onChangeText={text => this.setState({ credentials: { ...this.state.credentials, password: text }})}></TextInput>
                <TouchableOpacity style={styles.login.loginButton.button}
                                  onPress={this.login}
                                  disabled={this.state.loading}
                                  activeOpacity={1}>
                    {this.state.loading? 
                          (<ActivityIndicator color="white"
                                              size="small"/>)
                        : (<Text style={styles.login.loginButton.text as TextStyle}>Sign in</Text>) }
                </TouchableOpacity>
            </ScrollView>
        )
    }

    login = async() => {
        this.setState({ loading: true });

        try {
          await firebase.auth().signInWithEmailAndPassword(this.state.credentials.email, this.state.credentials.password);
        } catch (error) {
          console.log(error);
        } finally {
          this.setState({ loading: false });
        }
    };
}

interface LoginState {
    loading?: boolean;
    credentials?: { email?: string, password?: string };
}

const styles = {
    page: StyleSheet.create({
        container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 5,
        backgroundColor: "white"
      }
    }),
    login: {
        headerText: {
            fontSize: 25,
            marginBottom: 10
        },
        input: {
            width: '80%',
            backgroundColor: "#f4f4f4",
            paddingHorizontal: 10,
            paddingVertical: 10,
            borderRadius: 5,
            marginBottom: 10,
            fontSize: 16,
        },
        loginButton: {
            button: {
                paddingHorizontal: 10,
                paddingVertical: 10,
                backgroundColor: "#2196f3",
                width: '80%',
                borderRadius: 5
            },
            text: {
                fontSize: 16,
                color: 'white',
                textAlign: 'center'
            }
        }
    }
}