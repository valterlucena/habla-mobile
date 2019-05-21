import * as React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, TextInput } from "react-native";
import KeyboardSpacer from 'react-native-keyboard-spacer';
import firebase from 'firebase';
import { Facebook } from "expo";
import { FontAwesome } from '@expo/vector-icons';
import THEME from "../../theme/theme";
import i18n from 'i18n-js';

export default class LoginScreen extends React.Component<{}, LoginState> {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);

        this.state = { loadingWithCredentials: false, loadingWithFacebook: false, credentials: {} };
    }

    render() {
        return (
            <View style={styles.page.container}>
                <Text style={styles.login.headerText}>Habla!</Text>
                <TextInput placeholder={i18n.t('screens.login.inputs.email.placeholder')}
                           style={styles.login.input}
                           editable={!(this.state.loadingWithCredentials || this.state.loadingWithFacebook)}
                           underlineColorAndroid='rgba(0,0,0,0)'
                           autoCapitalize="none"
                           onChangeText={text => this.setState({ credentials: { ...this.state.credentials, email: text }})}></TextInput>
                <TextInput placeholder={i18n.t('screens.login.inputs.password.placeholder')}
                           style={styles.login.input}
                           editable={!(this.state.loadingWithCredentials || this.state.loadingWithFacebook)}
                           secureTextEntry={true}
                           onChangeText={text => this.setState({ credentials: { ...this.state.credentials, password: text }})}></TextInput>
                <TouchableOpacity style={styles.login.loginButton}
                                  onPress={this.signInWithEmailAndPassword}
                                  disabled={this.state.loadingWithCredentials || this.state.loadingWithFacebook}
                                  activeOpacity={1}>
                    {this.state.loadingWithCredentials? 
                          (<ActivityIndicator color="white"
                                              size="small"/>)
                        : (<Text style={styles.login.loginButtonText}>{i18n.t('screens.login.buttons.signInWithCredentials')}</Text>) }
                </TouchableOpacity>
                <TouchableOpacity style={styles.login.loginButtonFacebook}
                                  onPress={this.signInWithFacebook}
                                  disabled={this.state.loadingWithCredentials || this.state.loadingWithFacebook}
                                  activeOpacity={1}>
                    {this.state.loadingWithFacebook? 
                          (<ActivityIndicator color="white"
                                              size="small"/>)
                        : (<View style={styles.login.loginButtonInnerView}>
                            <FontAwesome name="facebook" style={styles.login.facebookIcon}/><Text style={styles.login.loginButtonText}>{ i18n.t('screens.login.buttons.signInWithFacebook') }</Text>
                           </View>) }
                </TouchableOpacity>
                <KeyboardSpacer/>
            </View>
        )
    }

    signInWithEmailAndPassword = async() => {
        this.setState({ loadingWithCredentials: true });

        try {
          await firebase.auth().signInWithEmailAndPassword(this.state.credentials.email, this.state.credentials.password);
        } catch (error) {
          this.setState({ loadingWithCredentials: false });
          console.log(error);
        }
    };

    signInWithFacebook = async() => {
        this.setState({ loadingWithFacebook: true });
        
        try {
            const result = await Facebook.logInWithReadPermissionsAsync('2136539466408117');
            const credential = firebase.auth.FacebookAuthProvider.credential(result.token);
            
            await firebase.auth().signInAndRetrieveDataWithCredential(credential);
        } catch (error) {
            console.log(error);
        } finally { 
            this.setState({ loadingWithFacebook: false });
        }
    }
}

interface LoginState {
    loadingWithCredentials?: boolean;
    loadingWithFacebook?: boolean;
    credentials?: { email?: string, password?: string };
}

const styles = {
    page: StyleSheet.create({
        container: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFFFFF",
            padding: 12
      }
    }),
    login: StyleSheet.create({
        headerText: {
            fontSize: 50,
            marginBottom: 10,
            color: THEME.colors.primary.default
        },
        input: {
            width: '100%',
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 14,
            paddingVertical: 14,
            marginBottom: 10,
            fontSize: 18,
        },
        loginButton: {
            paddingHorizontal: 14,
            paddingVertical: 14,
            backgroundColor: THEME.colors.primary.default,
            width: '100%',
            borderRadius: 5,
            alignItems: "center",
            marginBottom: 12
        },
        loginButtonFacebook: {
            paddingHorizontal: 14,
            paddingVertical: 14,
            backgroundColor: "#4267b2",
            width: '100%',
            borderRadius: 5,
            alignItems: "center"
        },
        facebookIcon: {
            color: "#ffffff",
            fontSize: 18,
            marginRight: 10
        },
        loginButtonText: {
            fontSize: 18,
            textAlign: 'center',
            color: "#FFFFFF",
            fontWeight: "bold"
        },
        loginButtonInnerView: {
            flexDirection: "row"
        }
    })
}