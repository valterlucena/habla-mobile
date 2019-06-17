import * as React from 'react';
import { Platform } from 'expo-core';
import { Permissions } from 'expo';
import { ImagePicker } from 'expo';
import { FileSystem } from 'expo';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
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
        let image: any;
        if (index == 0) {
            await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
            image = await ImagePicker.launchCameraAsync()
        }
        else if (index == 1) {
            if (Platform.OS === 'ios' ){
                await Permissions.askAsync(Permissions.CAMERA_ROLL);
            } 
            image = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'Images', allowsEditing: true, aspect: this.props.squared? [1,1]: undefined });
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
            <View style={styles.page.container}>
                <TouchableOpacity onPress={() => this.props.enabled && this.showActionSheet()}>
                    {this.props.children}
                </TouchableOpacity>
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
            flexGrow: 1
        }
    })
}
export interface ChangePhotoProps {
    onPhotoSelected: (photo: string) => void | Promise<void>;
    enabled?: boolean;
    style?: any;
    squared?: boolean;
}

export interface ChangePhotoState {
    profilePhoto: any;
    profile: any;
}
