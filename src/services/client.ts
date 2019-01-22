import ApolloClient from 'apollo-boost';
import firebase from 'firebase';

export const client = new ApolloClient({
    uri: 'http://192.168.0.101:3000/graphql',
    request: async operation => {
        let token = await firebase.auth().currentUser.getIdToken();

        let headers: any = {
            authorization: token
        };

        if (operation.getContext() && operation.getContext().location) {
            const location = operation.getContext().location;

            if (location.latitude) {
                headers.latitude = operation.getContext().location.latitude;
            }

            if (location.longitude) {
                headers.longitude = operation.getContext().location.longitude;
            }
        }

        operation.setContext({
            headers: headers
        });
    }
});