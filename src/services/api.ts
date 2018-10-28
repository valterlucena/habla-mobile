import axios from 'axios';
import firebase from 'firebase';

export const api = axios.create({
    baseURL: 'http://192.168.0.103:3000/',
});

api.interceptors.request.use(async(config) => {
    if (firebase.auth().currentUser) {
        let token = await firebase.auth().currentUser.getIdToken();
        config.headers['Authorization'] = token;
        console.log(token);
    }

    return config;
});