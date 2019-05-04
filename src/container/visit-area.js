import React, { Component } from 'react';
import AppointmentContainer from './appointment'
import moment from 'moment';
import {Avatar, Row, Col, Button, Form, Popover, Divider,Select, DatePicker, TimePicker, Menu, Dropdown, Icon, message, Timeline} from 'antd';
import { auth } from '../Auth/Auth'
import  client  from '../apollo-client'
import gql from "graphql-tag"
const FormItem = Form.Item;
const Option = Select.Option;

const INSERT_NEW_VISIT = gql`
mutation INSERT_NEW_VIST($data: [visit_insert_input!]!){
  insert_visit(objects:$data){
    returning{
      id
      patient_id
      schedule_at
      treatment_plan {
        drug {
          value:id
          text:name
          search:name
        }
        genrated_at
        unit
        cost
        discount
      }
    }
  }
}
`;
const DELETE_VISIT = gql`
mutation deleteVisit($id: Int!,$deleteVisit : Boolean) {
  delete_treatment_plan(where:{visit_id:{_eq:$id}}){
    affected_rows
  }
  delete_visit(where:{id:{_eq:$id}})@include(if : $deleteVisit){
    affected_rows
  }
}`
const QUERY_VISIT_HISTORY = gql`
query visit_history($id:Int!){
  visit(order_by:{schedule_at:desc} where:{patient_id:{_eq:$id}}){
    id
    patient_id
    schedule_at
		treatment_plan {
      drug {
        value:id
        text:name
        search:name
      }
      genrated_at
      unit
      cost
      discount
    }
  }
}
`;

class VisitArea extends Component{
  state = {
    timelines:[],
    edit:{
      visit:'',
      plan:'',
    },
    showNewAppoinment:true,
    visible:false,
  };
  handleNewVisitClick = ()=>{
    this.setState({visible:!this.state.visible})
  }
  handleCreate = () => {
     this.handleNewVisitClick();
     const form = this.formRef.props.form;
     form.validateFields((err, values) => {
       if (err) {
         return;
       }
       const { data } = this.props;
       let visit = {
         schedule_at :values.date.format(),
         patient_id:data.id,
         doctor_id:1,
        }
       client.mutate({ mutation:INSERT_NEW_VISIT, variables:{data:[visit]}})
         .then((response)=>{
           let newTimeline =  {visit:response.data.insert_visit.returning[0],meta:values}
           let i = [newTimeline,...this.state.timelines]
           this.setState({showNewAppoinment:false,timelines:i,edit:{visit:response.data.insert_visit.returning[0].id,plan:0}})
       })
     });
  }
   saveFormRef = (formRef) => {
     this.formRef = formRef;
   }
   handleChartClick = ()=> {
     this.setState({showNewAppoinment:true})
   }
   handleTableEdit = (visit_id,plan) => {
     this.setState({
       edit:{
         visit:visit_id,
         plan:plan,
       }
     })
   }
   handleAddPlan =  (visit_id,plan) => {
     this.setState({
       edit:{
         visit:visit_id,
         plan:plan,
         addPlanFromChild:true,
       }
     })
   }
   onSaved = (treatment_plan)=>{
     // adding data to visit
     let newTimeline = [...this.state.timelines];
     newTimeline[0].visit.treatment_plan = treatment_plan
     this.setState({
       timelines:newTimeline,
       edit:{
         visit:'',
         plan:''
       }
     })
     // Show the create button
     this.handleChartClick()
   }
   onCancel = ({visit_id,deleteVisit})=>{

     if(!this.state.edit.addPlanFromChild){
     let timeline = [...this.state.timelines]
     if(deleteVisit){
        timeline =  timeline.filter((e,i)=> {
             return e.visit.id !== visit_id
           })
     }else {
       let index = timeline.findIndex((e) => e.visit.id === visit_id)
       timeline[index].visit.treatment_plan = []
     }
     client.mutate({ mutation:DELETE_VISIT, variables:{id:visit_id,deleteVisit:deleteVisit}})
      .then((response)=>{
        // Do something here
        this.setState({timelines:timeline,edit:{visit:'',plan:''}})
     })
     }else {
      this.setState({edit:{
        visit:'',
        plan:'',
        addPlanFromChild:false
      }})
     }
     // Show the create button
     this.handleChartClick()
   }
  componentDidMount(){
    const { data } = this.props;
    client.query({query:QUERY_VISIT_HISTORY,variables:{id:data.id}})
    .then((response)=>{
        const timelines = []
         response.data.visit.forEach((i,k)=>{
          timelines.push({
          visit:i,
          meta:{date:moment(i.schedule_at)}
        })
      })
      this.setState({timelines:timelines})
    })
  }
  render(){
    console.log(this.state.timelines)
    return (
   <React.Fragment >
    <Row className="uk-padding-small" >
      <Col className="uk-padding-small uk-padding-remove-vertical" span={12}>
        <Button className="uk-text-small"  onClick={this.handleChartClick}>Chart</Button>
      </Col>
    </Row>
     <Row className="uk-padding-small">
       <Col span={24}>
       <Timeline  style={{marginLeft:10}}>
        {this.state.showNewAppoinment &&
          (<Timeline.Item className="nautral_timeline" key={"ab"} dot={<Avatar icon="user" size={45} />}>
          <Popover
             placement="rightTop"
            visible={this.state.visible}
             title='When did the patient visit happen?'
             content={
               <CreateNewVisitFormWrapper
                 wrappedComponentRef={this.saveFormRef}
                 onCreate={this.handleCreate}
                 />
               }
             trigger="click">
             <Button className="uk-text-small" type="primary" onClick={this.handleNewVisitClick} >Create a new chart</Button>
           </Popover>
           </Timeline.Item>)
        }
        { this.state.timelines.map((timeline,i)=>{
          return (
            <Timeline.Item key={timeline.visit.id} dot={<Avatar style={{ backgroundColor: '#87d068' }} >ss</Avatar>}>
              <AppointmentContainer
                key={timeline.visit.id}
                {...timeline}
                editState = { this.state.edit}
                edit={this.state.edit.visit === timeline.visit.id}
                onSaved={this.onSaved}
                onTableEdit={this.handleTableEdit}
                addPlan={this.handleAddPlan}
                onCancel={this.onCancel}/>
            </Timeline.Item>
          )
        })}
        </Timeline>
       </Col>
     </Row>
     </React.Fragment>
    );
  }
}

class CreateNewVisitForm extends Component {
   state = {
     profile:{}
   }
   componentDidMount(){
     const { userProfile, getProfile } = auth;
     if (!userProfile) {
       getProfile((err, profile) => {
         this.setState({ profile });
       });
     } else {
       this.setState({ profile: userProfile });
     }
   }
    render() {
      const { profile } = this.state;
      const {
      onCreate, form,
      } = this.props;
      const { getFieldDecorator } = form;
      const menu = (
          <Menu onClick={onCreate} >
            <Menu.Item key="6" >Treatment Plan</Menu.Item>
          </Menu>
        );
        const config = {
          initialValue:moment(),
          };
      return (
          <Form layout="vertical" onSubmit={this.props.onCreate}>
           <Row gutter={7} type="flex" align="bottom">
            <Col span={14}>
            <FormItem  label="Appointment date and time" >
              {getFieldDecorator('date',config)(
                 <DatePicker  format="DD-MM-YYYY" style={{width:200}} />
              )}
              </FormItem>
            </Col>
            <Col span={2} style={{paddingLeft: 9,marginRight: "-4px"}} className="uk-margin-bottom">at</Col>
            <Col span={7} >
            <FormItem  >
              {getFieldDecorator('date',config)(
                 <TimePicker minuteStep={10}  use12Hours format='hh:mm A' style={{width:110}} />
              )}
              </FormItem>
            </Col>
           </Row>
            <FormItem label="Doctor">
              {getFieldDecorator('doctor',{initialValue:profile.name})(
                <Select
                  showSearch
                  placeholder="Select a Doctor"
                  optionFilterProp="children"
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  >
                  <Option value={profile.name}>{profile.name}</Option>
                </Select>
              )}
            </FormItem>
            <Divider style={{margin:'12px 0'}}  />
            <Row type="flex" justify="end">
              <Col  span={10}>
                <Dropdown overlay={menu}>
                  <Button ghost type="primary" style={{ marginLeft: 8 }}>
                    Add record <Icon type="down" />
                  </Button>
                </Dropdown>
              </Col>
            </Row>
          </Form>
      );
    }
}

const CreateNewVisitFormWrapper = Form.create()(CreateNewVisitForm);
export default VisitArea;
