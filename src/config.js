export let SERVER_URL;
if (process.env.REACT_APP_STAGE === 'prod') {
    
    SERVER_URL = 'https://eagle-meet-backend.herokuapp.com';
  }
  if (process.env.REACT_APP_STAGE === 'dev') {
    SERVER_URL='http://localhost:5000'
  }