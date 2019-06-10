import React, { Component } from 'react';
import './thread.css';
import PostBox from './PostBox';

class Thread extends Component {
    constructor(props) {
      super(props);
      this.state = {value: '', postValue: ''}; //postValue is a placeholder before i connected backend
    };
    handleChange = (e) => {
      this.setState({value: e.target.value});
    };
    handleSubmit = (e) => {
      e.preventDefault();
      let val = this.state.postValue + this.state.value + "splitbyplaceholder";
      this.setState({postValue: val});
      this.setState({value: ""});
    };
    render() {
      return (
        <div>
          <form id="post-form" onSubmit={this.handleSubmit} >
            <textarea id="editor" value={this.state.value} onChange={this.handleChange} />
            <div id="submit-box">
              <input type="submit" id="submit" value="Submit" />
            </div>
          </form>
          <PostBox postValue={this.state.postValue} />
         </div>
      );
    }
} 
export default Thread;
