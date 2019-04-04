import * as React from 'react';
import { Platform } from 'expo-core';
import { Permissions, Location } from 'expo';
import { ImagePicker } from 'expo';
import { FileSystem } from 'expo';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import ActionSheet from 'react-native-actionsheet'
import i18n from 'i18n-js';
import THEME from '../../theme/theme';

export default class ChangePhotoComponent extends React.Component<ChangePhotoProps, ChangePhotoState> {
    constructor(props: ChangePhotoProps) {
        super(props);
    }

    actionSheet: ActionSheet.ref;

    showActionSheet = () => {
        this.actionSheet.show()
      }

    choosePhoto = async index => {
        if (Platform.OS === 'ios') {
            await Permissions.askAsync(Permissions.CAMERA_ROLL);
        }
        await Permissions.askAsync(Permissions.CAMERA);
        let image: any;
        if (index == 0) {
            image = await ImagePicker.launchCameraAsync()
        }
        else if (index == 1) {
            image = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'Images', allowsEditing: true, aspect: [4, 4] });
        }
        if ((index == 2) || (image.cancelled)) {
            return;
        }
        let base64 = await FileSystem.readAsStringAsync(image.uri, { encoding: FileSystem.EncodingTypes.Base64 });
 
        base64 = `data:image/png;base64,${base64}`;

        this.props.onPhotoSelected && this.props.onPhotoSelected(base64);
    }

    render() {
        return (
            <View>
                
                <Text
                    style={styles.page.textChangePhoto}
                    onPress={this.showActionSheet}>
                    {i18n.t('screens.profile.changePhoto.title')}
                </Text>
                <ActionSheet
                    tintColor={THEME.colors.primary.default}
                    ref={o => this.actionSheet = o}
                    options={[i18n.t('screens.profile.changePhoto.option1'),
                    i18n.t('screens.profile.changePhoto.option2'),
                    i18n.t('screens.profile.changePhoto.cancel')]}
                    cancelButtonIndex={2}
                    onPress={(index) => { this.choosePhoto(index) }}
                />
            </View>
        )
    }
}
const styles = {
    page: StyleSheet.create({
        container: {
            flexGrow: 1,
            backgroundColor: '#fff'
        },
        textChangePhoto: {
            textAlign: 'center',
            fontSize: 14,
            fontWeight: 'bold',
            paddingVertical: 10
        }
    })
}
export interface ChangePhotoProps {
    onPhotoSelected: (photo: string) => void | Promise<void>;
}

export interface ChangePhotoState {
    profilePhoto: any;
    profile: any;
}