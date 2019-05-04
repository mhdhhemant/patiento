import React, { Component } from 'react';

export class Grand extends Component{
  constructor(props){
    super(props);
    console.log(1)
  }
  componentDidMount(){
    console.log(3)
  }
  render(){
    console.log(2)
    return (
     <Parent />
    );
  }
}
class Parent extends Component{
  constructor(props){
    super(props);
    console.log(4)
  }
  componentDidMount(){
    console.log(6)
  }
  render(){
    console.log(5)
    return (
     <Child />
    );
  }
}
class Child extends Component{
  constructor(props){
    super(props);
    console.log(7)
  }
  componentDidMount(){
    console.log(9)
  }
  render(){
    console.log(8)
    return (
      <p>Hello world</p>
    );
  }
}
