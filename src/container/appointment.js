import React, { Component } from 'react';
import {Row, Col, Dropdown, Menu, Button, Icon ,Table, Divider, Tag} from 'antd';
import moment from 'moment';
import classNames from 'classnames'
import TreatmentPlan from './TreatmentPlan';



//border: 1px solid #ececec
class AppointmentContainer extends Component{

  handleCreateRecord = () => {
    this.props.addPlan(this.props.visit.id,0)
  }
  componentDidMount(){}

  render(){
   const { edit, meta, visit}  = this.props;
   const timeStamp = meta.date;
   let disable = this.props.visit.treatment_plan.length > 0.
   const menu = (
     <Menu >
       <Menu.Item disabled={disable}  onClick={this.handleCreateRecord} key="6">Treatment Plan</Menu.Item>
     </Menu>
   )
    return (
      <React.Fragment>
       <Row type="flex" align="middle" style={{border:' 1px solid #e7e7e7'}}>
        <Col span={2} className="uk-text-center"  style={{borderRight: '1px solid #ececec',padding:'.7em 0px'}}><div >{timeStamp.date()}</div><div>{timeStamp.format("MMM YY").toUpperCase()}</div></Col>
        <Col span={10} style={{paddingLeft:'30px'}}>Appointment with <span style={{color:'black'}}>Satnam Singh</span><div> {timeStamp.format("hh:mm a")} for 15 minutes</div> </Col>
        <Col span={11} className={classNames({'uk-invisible': this.props.editState.visit !== ""})}>
          <Dropdown overlay={menu}>
            <Button ghost type="primary" className="uk-float-right">
              Add record <Icon type="down" />
            </Button>
          </Dropdown>
        </Col>
       </Row>
       <Row  type="flex" align="middle" style={{border:' 1px solid #e7e7e7'}}>
        { (this.props.edit || this.props.visit.treatment_plan.length > 0)  && <TreatmentPlan {...this.props} />}
        {this.props.visit.treatment_plan.length < 1 && !this.props.edit &&
          <Empty  /> }
       </Row>
     </React.Fragment>
    );
  }
}
export default AppointmentContainer;
function Empty(props){
  return (
    <div className="uk-width-1-1 uk-margin-small-top" style={{ textAlign: 'center' }}>
     <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxKSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgIDxlbGxpcHNlIGZpbGw9IiNGNUY1RjUiIGN4PSIzMiIgY3k9IjMzIiByeD0iMzIiIHJ5PSI3Ii8+CiAgICA8ZyBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0iI0Q5RDlEOSI+CiAgICAgIDxwYXRoIGQ9Ik01NSAxMi43Nkw0NC44NTQgMS4yNThDNDQuMzY3LjQ3NCA0My42NTYgMCA0Mi45MDcgMEgyMS4wOTNjLS43NDkgMC0xLjQ2LjQ3NC0xLjk0NyAxLjI1N0w5IDEyLjc2MVYyMmg0NnYtOS4yNHoiLz4KICAgICAgPHBhdGggZD0iTTQxLjYxMyAxNS45MzFjMC0xLjYwNS45OTQtMi45MyAyLjIyNy0yLjkzMUg1NXYxOC4xMzdDNTUgMzMuMjYgNTMuNjggMzUgNTIuMDUgMzVoLTQwLjFDMTAuMzIgMzUgOSAzMy4yNTkgOSAzMS4xMzdWMTNoMTEuMTZjMS4yMzMgMCAyLjIyNyAxLjMyMyAyLjIyNyAyLjkyOHYuMDIyYzAgMS42MDUgMS4wMDUgMi45MDEgMi4yMzcgMi45MDFoMTQuNzUyYzEuMjMyIDAgMi4yMzctMS4zMDggMi4yMzctMi45MTN2LS4wMDd6IiBmaWxsPSIjRkFGQUZBIi8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K" style={{ fontSize: 20 }} />
     <p>No records added yet </p>
   </div>
  )
}
