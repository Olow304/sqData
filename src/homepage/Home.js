import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../helper/auth';

// import styling
import "../App.css";

function setErrorMsg(error){
    return{
        registerError: error.message
    }
}


class Home extends Component {
    constructor(props){
        super(props);

        this.state = {
            registerError: null
        }
    }

    

    handleSubmit = (e) => {
        e.preventDefault();
        auth(this.email.value, this.pw.value)
        .catch(e => this.setState(setErrorMsg(e)))
    }

    render() {
        return (
            <div className="bg-white shadow p-12 mt-12 max-w-sm mx-auto rounded">
                <h1 className="mb-6 text-3xl text-center">Data Analysis Project</h1>
                <div class="bg-orange-lightest border-l-4 border-orange text-orange-dark p-4" role="alert">
                    <p class="font-bold">Not for mobile view</p>
                    <p>Try using on big screen (laptop or desktop).</p>
                </div>
                <form onSubmit={this.handleSubmit}>
                    <label htmlFor="email-input" className="block mb-2">Email</label>
                    <input 
                        id="email-input" type="email" maxLength="40" 
                        required autoFocus placeholder="saleban@dev.com" 
                        className="block border rounded p-3 mb-3 w-full"
                        ref={(email) => this.email = email} />
                    
                    <label htmlFor="email-input" className="block mb-2 mt-3">Username</label>
                    <input 
                        id="user-input" type="text" maxLength="40" 
                        required autoFocus placeholder="saleban" 
                        className="block border rounded p-3 mb-3 w-full"
                        ref={(username) => this.username = username}  />

                    <label htmlFor="password-input" className="block mb-2">Password</label>
                    <input 
                        id="password-input" type="password" placeholder="**********" 
                        required maxLength="40" 
                        className="block border rounded p-3 mb-6 w-full"
                        ref={(pw) => this.pw = pw} />
                    {this.state.registerError &&
                        (
                          <div role="alert">
                            <span>Error</span>
                            <h3>{this.state.registerError}</h3>
                          </div>  
                        )
                    }
                    <button className="block text-lg font-bold bg-blue w-full p-3 rounded text-white hover:bg-blue-dark hover:shadow-md" >Register</button>
                </form>
                <div className="py-4 px-1 text-black text-sm border-b border-grey-lighter">Login <Link to="/">here</Link> if you are alredy a member.</div>
            </div>
        );
    }
}

export default Home;