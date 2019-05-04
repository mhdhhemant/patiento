import React, { Suspense } from 'react';
import { Switch, Route,Redirect} from 'react-router-dom';
import {  Layout, Menu, } from 'antd';
import SiderMenu from './conf/sider-menu';
import PatientContainer from './container/patient-container'
import AppHeader from './component/Header'
import { ApolloProvider } from "react-apollo";
import  client from  './apollo-client'
const {  Sider, Content } = Layout;

class MainApplication extends React.Component {
  state = {
    collapsed: true,
    collapseWidth: 80,
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
 handleBreakpoint = (breaken) => {
  // this.setState({collapseWidth: breaken ? 0  : 80,collapsed: breaken ? true : false})
 }
 handleHover = () => {
  // this.toggle()
 }
  render() {
    return (
      <Suspense fallback={<div>Loading...</div>} >
      <ApolloProvider client={client}>
      <Layout id="components-layout-demo-custom-trigger" style={{height:'100%'}}>
        <Sider
          trigger={null}
          breakpoint="md"
          collapsible
          onBreakpoint={this.handleBreakpoint}
          collapsedWidth={this.state.collapseWidth}
          collapsed={this.state.collapsed}
          onMouseOver={this.handleHover}
          onMouseOut={this.handleHover}
        >
          <div className="menu-logo" />
          <Menu theme="dark"  defaultSelectedKeys={['1']}>
            { SiderMenu.map((data,index)=>{
              return (
                <Menu.Item key={data.key}>
                  {data.icon}
                  <span> {data.text} </span>
                </Menu.Item>
              )
            })}
          </Menu>
        </Sider>
        <Layout>
         <Route render={(props)=><AppHeader {...props} {...this.props}/>} />
          <Content className="uk-overflow-auto uk-height-1-1" style={{  background: '#fff'}}>
          <Switch>
            <Route path='/patients' exact component={PatientContainer}/>
            <Route path="/patients/patient/:id" component={PatientContainer} />
            <Route render={()=><Redirect to="/patients" />} />
          </Switch>
          </Content>
        </Layout>
      </Layout>
      </ApolloProvider>
      </Suspense>
    );
  }
}
export default MainApplication;
