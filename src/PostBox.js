import React, { Component } from 'react';
import './postbox.css';

class PostBox extends Component {
    constructor(props) {
      super(props);
      this.state = {};
    }
    render() {
      let posts = this.props.postValue.split("splitbyplaceholder").filter(el => el !== "").map((el, i) => 
      <div className="post-box" key={i}>{el}</div>                                               
      );
      return (
        <div>
          {posts}
        </div>
      );
    }
}
export default PostBox;
