export let SERVER_URL;
if (process.env.REACT_APP_STAGE === 'prod') {

<<<<<<< HEAD
    SERVER_URL = 'https://eagle-meet-app.onrender.com';
=======
    SERVER_URL = 'https://eagle-meet-server.herokuapp.com';
    
>>>>>>> origin/meeting
}
if (process.env.REACT_APP_STAGE === 'dev') {
    SERVER_URL = 'http://localhost:5000'
}