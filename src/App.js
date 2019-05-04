import React, { Suspense, lazy } from 'react';
import { Switch, Route,Redirect} from 'react-router-dom';
import Home from './Home'
import './style/App.css';
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import { auth } from './Auth/Auth';
import CallbackComponent from './component/Callback'
const Dashboard  = lazy(() => import('./Dashboard'));

class App extends React.Component {
  state = {
    loading: true
  }

  handleAuthentication = (nextState, replace) => {
    if (/access_token|id_token|error/.test(nextState.location.hash)) {
      auth.handleAuthentication(this.props.history);
    }
  }

 login() {
   auth.login();
 }

 logout() {
   auth.logout(this.props.history);
 }

 componentDidMount() {
   // loads the Icon plugin
   UIkit.use(Icons);
   //Components can be called from the imported UIkit reference
   //UIkit.notification('Hello world.');
   const { renewSession } = auth;

   if (localStorage.getItem('isLoggedIn') === 'true') {
     renewSession(this.props.history);
   }else{
     this.setState({loading:false})
   }
 }
  render() {

      const { isAuthenticated, loading } = auth;
      if(loading && this.state.loading) {
        return  <CallbackComponent  loading={loading} />
      }
    return (
      <Suspense fallback={<CallbackComponent loading={true} />}>
      <Switch>
         {!isAuthenticated() && <Route path="/" exact component={Home} />}
         <Route path="/callback" render={(props) => {
          this.handleAuthentication(props);
          return <CallbackComponent {...props} loading={!isAuthenticated()} />
        }}/>
        <Route render={(props)=>{
          return isAuthenticated() ? <Dashboard auth={auth} />: <Redirect to="/" />}} />
      </Switch>
    </Suspense>
    );
  }
}
export default App;
