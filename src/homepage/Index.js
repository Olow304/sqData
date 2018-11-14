import React, { Component } from 'react';
import { Route, Link, Redirect, Switch, BrowserRouter } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Dashboard from '../components/protected/Dashboard';
import { logout } from '../helper/auth';
import { firebaseAuth } from '../config/firebase'; 

function PrivateRoute ({component: Component, authed, ...rest}){
    return (
        <Route {...rest} render={(props) => authed === true ? (
            <Component {...props} />
        ) : <Redirect to={{pathname: '/login', state: {from: props.location}}} />} />
    )
}

function PublicRoute ({component: Component, authed, ...rest}){
    return (
        <Route
          {...rest}
          render={(props) => authed === false
            ? <Component {...props} />
            : <Redirect to='/dashboard' />}
        />
    )
}



class App extends Component {

    state = {
        authed: false,
        loading: true,
        user: null
    }

    componentDidMount(){
        this.removeListener = firebaseAuth().onAuthStateChanged((user) => {
            if(user){
                this.setState({
                    authed: true,
                    loading: false,
                    user: user
                })
            }else{
                this.setState({
                    authed: false,
                    loading: false,
                    user: {email: 'No user logged in'}
                })
            }
        })
    }

    componentWillUnmount(){
        this.removeListener();
    }

    render() {
        return this.state.loading === true ? <h1 style={{position: 'absolute', top: '50%', left: '50%', transform: 'translateX(-50%) translateY(-50%)'}}>Loading...</h1> :(
            <BrowserRouter>
                <Switch>
                    <PublicRoute authed={this.state.authed} path="/" exact component={Login}/>
                    <PublicRoute authed={this.state.authed} path="/login" component={Login} />
                    <PublicRoute authed={this.state.authed} path="/register" component={Home} />
                    <PrivateRoute authed={this.state.authed} path="/" component={Dashboard}/>
                    <Route render={ () => <h3>No Match</h3>}/>
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;