import React, { Component } from 'react';
import { Row, Col ,  Layout, Menu, Breadcrumb} from 'antd';
import Auth from './Auth/Auth.js';
const { Header, Content, Footer } = Layout;

class HomeContainer extends Component{
  constructor(props){
    super(props);
  }
  handleLogin = ()=>{
    const auth = new Auth();
    auth.login();
  }
  render(){
    return (
    <Layout className="uk-height-1-1">
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%',background:'#fff',borderBottom: '1px solid #0000001a' }}>
        <Row type="flex">
          <Col span={6}>
            <div className="main-logo uk-light" >
              <img style={{marginTop:-47,transform: 'scale(1.4)'}} src="./logo.png" alt="logo" / >
            </div>
          </Col>
          <Col span={2} offset={8+5}>
            <button className="uk-button uk-button-default" onClick={this.handleLogin}>Login</button>
          </Col>
          
        </Row>
      </Header>
      <Content style={{ padding: '0 50px', marginTop: 64, background:'#fff' }}>
        <Row type="flex" className="uk-height-1-1" justify="center" align="middle" >
          <Col span={24} style={{display:'flex'}} className="uk-flex-center">
              <img style={{height:650}} src="./37126.jpg" />
          </Col>
        </Row>
      </Content>
    </Layout>
    );
  }
}

export default HomeContainer;
/*
37126.jpg
<Breadcrumb style={{ margin: '16px 0' }}>
  <Breadcrumb.Item>Home</Breadcrumb.Item>
  <Breadcrumb.Item>List</Breadcrumb.Item>
  <Breadcrumb.Item>App</Breadcrumb.Item>
</Breadcrumb>
<div style={{ background: '#fff', padding: 24, minHeight: 380 }}>Content</div>

*/
