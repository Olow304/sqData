import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { login, resetPassword } from '../helper/auth';

function setErrorMsg(error){
    return {
        loginMessage: error
    }
}

class Login extends Component {
    constructor(props){
        super(props);

        this.state = {
            loginMessage: null
        }
    }

    handleSubmit = (e) => {
        e.preventDefault()
        login(this.email.value, this.pw.value)
        .catch((error) => {
            this.setState(setErrorMsg('Invalid username or password'))
        })
    }

    resetPassword = (e) =>{
        e.preventDefault()
        resetPassword(this.email.value)
        .then(() => this.setState(setErrorMsg(`Password reset email sent to ${this.email.value}`)))
        .catch((error) => this.setState(setErrorMsg('Email address not found.')))
    }

    render() {
        return (
            <div className="bg-white shadow p-12 mt-12 max-w-sm mx-auto rounded">
                <h1 className="mb-6 text-3xl text-center">Data Analysis Project</h1>
                <form onSubmit={this.handleSubmit}>
                    <label htmlFor="email-input" className="block mb-2">Email</label>
                    <input 
                        id="email-input" type="email" maxLength="40" 
                        required autoFocus placeholder="saleban@dev.com" 
                        className="block border rounded p-3 mb-3 w-full"
                        ref={(email) => this.email = email} />
                    <label htmlFor="password-input" className="block mb-2">Password</label>
                    <input 
                        id="password-input" type="password" placeholder="**********" 
                        required maxLength="40" 
                        className="block border rounded p-3 mb-6 w-full"
                        ref={(pw) => this.pw = pw} />
                    <hr/>
                    {this.state.loginMessage ? 
                        (
                            <div role="alert">
                                <span>Error</span>
                                <h3>Error: {this.state.loginMessage} <br/><a href="/" onClick={this.resetPassword}>forgot password> </a></h3>
                            </div>
                        ): (<button className="block text-lg font-bold bg-blue w-full p-3 rounded text-white hover:bg-blue-dark hover:shadow-md">Login</button>)
                    }
                    
                </form>
                <div className="py-4 px-1 text-black text-sm border-b border-grey-lighter">Don't have an account yet, register <Link to="/register">here</Link></div>
            </div>
        );
    }
}

export default Login;