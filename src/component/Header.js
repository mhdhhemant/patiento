import React , { Component } from 'react';
import { Card, Popover, Layout, Icon, Avatar, Row, Col, Button} from 'antd';
import AddPatientButton from './add-patient'
import PatientSearch from './patient-search'
const { Meta } = Card;
const { Header} = Layout;

export default class AppHeader extends Component{
  constructor(props){
    super(props);
    this.state = {
       profile:{}
    };
  }
  handleLogout = ()=>{
    this.props.auth.logout(this.props.history)
  }
  componentWillMount() {
    const { userProfile, getProfile } = this.props.auth;
    if (!userProfile) {
      getProfile((err, profile) => {
        console.log(profile)
        this.setState({ profile });
      });
    } else {
      this.setState({ profile: userProfile });
    }
  }
  render(){
    const { profile } = this.state;
    let Contents = (
      <Meta
        className="user-profile"
        style={{padding: "15px 0"}}
        avatar={<Avatar className="uk-padding uk-padding-remove-horizontal" size={45} src={profile.picture} />}
        title={profile.name}
        description={profile.email}
      />
      )
    return (
      <Header style={{ zIndex: 100,background: '#fff',boxShadow:'rgba(0, 0, 0, 0.16) 0px 1px 8px',borderBottom: "1px solid rgb(224, 213, 213)", padding: "0 18px", }}>
        <Row gutter={16} type="flex" align="middle">
          <Col span={1} className="uk-width-1-1 ">
            <Icon
              className="trigger menu-icon uk-width-1-1 uk-flex uk-flex-center"
              style={{display:"flex"}}
              type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
          </Col>
          <Col span={4}>
            <PatientSearch />
          </Col>
          <Col span={7} >
            <AddPatientButton {...this.props}/>
          </Col>
          <Col style={{display: 'flex',justifyContent: "flex-end"}} span={12}  >
            <Popover placement="bottomRight" title={Contents } content={
              <Row>
                <Button className="uk-float-left">Edit Profile</Button>
                <Button className='uk-float-right' onClick={this.handleLogout}>Logout</Button>
              </Row>
            }
            trigger="click">
              <Avatar className="uk-box-shadow-hover-small" size="large" src={profile.picture} />
            </Popover>
          </Col>
        </Row>
      </Header>
    );
  }
}
