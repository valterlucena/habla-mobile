import ApolloClient from 'apollo-boost';
import firebase from 'firebase';

export const client = new ApolloClient({
    uri: 'http://localhost:3000/graphql',
    request: async operation => {
        let token = firebase.auth().currentUser? await firebase.auth().currentUser.getIdToken(): null;

        let headers: any = {};

        if (token) {
            headers.authorization = token;
        }
        
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