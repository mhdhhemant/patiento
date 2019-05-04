import React from 'react';
import { Tag } from 'antd';

// Creating a fancy tag to show on off like condition
function CustomTag(props){
  if(props.checked){
    return (<Tag {...props }>{props.children}</Tag>);
  }
  else {
    return (<a {...props }>{props.children}</a>);
  }
}

export default CustomTag;
