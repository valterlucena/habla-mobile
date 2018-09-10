import App from './output/App';

const firebase = require('firebase');
const firebaseConfig = require('./firebase.json');

firebase.initializeApp(firebaseConfig);

export default App;