import React, { Component } from 'react';
import './postbox.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

library.add(faTimes);

class PostBox extends Component {
    constructor(props) {
      super(props);
      this.state = {};
    }
    handleDelete = (i) => {
      this.props.postValue.splice(i, 1);
      this.forceUpdate(); //a placeholder for now
    };
    render() {
      let posts = this.props.postValue.filter(el => el !== '').map((el, i) => 
      <div className='post-box' key={i}>
        <div className='post-cap'>
          <FontAwesomeIcon icon={faTimes} className="decoration" onClick={() => this.handleDelete(i)} />
        </div>
        {el}
      </div>                                               
      );
      return (
        <div>
          {posts}
        </div>
      );
    }
}
export default PostBox;
