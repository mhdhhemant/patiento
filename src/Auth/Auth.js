// src/Auth/Auth.js

import auth0 from 'auth0-js';

export default class Auth {
   accessToken;
   idToken;
   expiresAt;
   loading = true;
  tokenRenewalTimeout;
  constructor(){
     this.login = this.login.bind(this);
     this.logout = this.logout.bind(this);
     this.handleAuthentication = this.handleAuthentication.bind(this);
     this.isAuthenticated = this.isAuthenticated.bind(this);
     this.getAccessToken = this.getAccessToken.bind(this);
     this.getIdToken = this.getIdToken.bind(this);
     this.renewSession = this.renewSession.bind(this);
     this.getProfile = this.getProfile.bind(this)
     this.scheduleRenewal();
  }
  auth0 = new auth0.WebAuth({
    domain: 'auth-local.auth0.com',
    clientID: 'BFwxvMqKnIeJ8GwuztXBh7KePxL2nnpF',
    redirectUri: `${window.location.origin}/callback`,
    responseType: 'token id_token',
    audience: 'https://kidneycare-graphql.herokuapp.com/',
    scope: 'openid profile "https://hasura.io/jwt/claims" email',
    auto_login: false
  });

  login() {
    this.auth0.authorize();
  }
  handleAuthentication(history) {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult,history);
      } else if (err) {
        history.replace('/');
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  }

  getAccessToken() {
    return this.accessToken;
  }

  getIdToken() {
    return this.idToken;
  }

  setSession(authResult,history) {
    // Set isLoggedIn flag in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    // Set the time that the access token will expire at
    let expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();
    this.accessToken = authResult.accessToken;
    this.idToken = authResult.idToken;
    this.expiresAt = expiresAt;
    this.loading = false;
    this.scheduleRenewal();
    // navigate to the home route
    history.replace('/');
  }

  renewSession(history) {
    this.loading = true;
    history.push('/login')
    this.auth0.checkSession({}, (err, authResult) => {
       if (authResult && authResult.accessToken && authResult.idToken) {
         this.setSession(authResult,history);
       } else if (err) {
         this.logout(history);
         console.log(err);
         alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
       }
    });
  }
  scheduleRenewal() {
    let expiresAt = this.expiresAt;
    const timeout = expiresAt - Date.now();
    if (timeout > 0) {
      this.tokenRenewalTimeout = setTimeout(() => {
        this.renewSession();
      }, timeout);
    }
  }

  getExpiryDate() {
    return JSON.stringify(new Date(this.expiresAt));
  }
  logout(history) {
    // Remove tokens and expiry time
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = 0;
    this.loading = false;
    clearTimeout(this.tokenRenewalTimeout);
    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn');

    // navigate to the home routeisAuthenticated(
    history.push('/');
  }
  getProfile(cb) {
  this.auth0.client.userInfo(this.accessToken, (err, profile) => {
    if (profile) {
      this.userProfile = profile;
    }
    cb(err, profile);
  });
 }
  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = this.expiresAt;
    return new Date().getTime() < expiresAt;
  }
}
export const auth = new Auth();
