import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Home from './Home';
import Thread from './Thread';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  };
  render() {
    return (
      <Router>
        <Link to='/'>Home</Link>
        <Link to='/b'>/b/</Link>
        <Route exact path='/' component={Home} />
        <Route path='/b' component={Thread} />
      </Router>
    );
  }
}


export default App;
