import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import CommonComponent from '../../src/index'

class App extends Component {
    constructor(props) {
        super(props);
        this.testClick = this.testClick.bind(this);

    }
    testClick(){
        console.log('123123');
    }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
          <CommonComponent testClick={this.testClick}></CommonComponent>
      </div>
    );
  }
}

export default App;
