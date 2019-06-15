import React, { Component } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Loader from 'react-loader-spinner';
import './thread.css';
import PostBox from './PostBox';

class Thread extends Component {
    constructor(props) {
      super(props);
      this.state = {
        value: '', 
        postValue: '',
        display: 'flex'
      }; //postValue is a placeholder before i connected backend
      this._reCaptchaRef = React.createRef();
    };
    handleChange = (e) => {
      this.setState({value: e.target.value});
    };
    handleSubmit = async (e) => {
      e.preventDefault();
      const recaptchaValue = this._reCaptchaRef.current.getValue();
      const fetched = await fetch('http://localhost:3001/api/validate-recaptha?value=' + recaptchaValue);
      const fetchedJson = await fetched.json();
      if (fetchedJson.success) {
        let val = this.state.postValue + this.state.value + 'splitbyplaceholder';
        this.setState({postValue: val});
        this.setState({value: ''});
        this._reCaptchaRef.current.reset();
      }
    };
    asyncScriptOnLoad = () => {
      this.setState({ display: 'none' });
    };    
    render() {
      return (
        <div>
          <form id='post-form' onSubmit={this.handleSubmit} >
            <textarea id='editor' value={this.state.value} onChange={this.handleChange} />
            <div id='submit-box'>
              <input type='submit' id='submit' value='Submit' />
            </div>
            <div style={{
              display: this.state.display,
              alignItems: 'center'
            }}>
              <Loader 
                type="Triangle"
                color="slategrey"
                height="45"
                width="45"
              /> 
            </div>
            <ReCAPTCHA
              ref={this._reCaptchaRef}
              sitekey='6Lf9e6gUAAAAAOgca4hnC4K8roRMlKW7RrbLkPW0'
              asyncScriptOnLoad={this.asyncScriptOnLoad}
            />
          </form>
          <PostBox postValue={this.state.postValue} />
         </div>
      );
    }
} 
export default Thread;
