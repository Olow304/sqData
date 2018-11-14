import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/protected/Dashboard';
import Welcome from './homepage/Index';
import * as serviceWorker from './serviceWorker';

const element = document.getElementById('root');
const render = () => {
    ReactDOM.render(
        <Welcome />, element
    )
}

if(module.hot){
    module.hot.accept('./components/protected/Dashboard', () => {
        setTimeout(render)
    })
}

render();

//ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
