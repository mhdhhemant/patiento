import React , { Component } from 'react';
import { Modal, Button, notification} from 'antd';
import CustomRegistrationFrom from './patient-registration-form';
import  client  from '../apollo-client'
import gql from "graphql-tag"
import moment from 'moment';
import { Link } from 'react-router-dom'

const INSERT_NEW_PATIENT_MUTATION = gql`
mutation Insert_NEW_patient($data: [patient_insert_input!]!) {
  insert_patient(objects: $data) {
    returning {
      id
      name
    }
  }
}
`
const confirmId = gql`
query confirm($id : String){

  patient_aggregate(where:{patient_id:{_eq:$id}}){
    nodes{
      patient_id
    }
  }
}
`;
const GET_NEXT_ID_QUERY = gql`
{
  patient_aggregate{
      aggregate{
      count(columns:[patient_id] distinct:true)
      max {
      patient_id  # max aggregate on id
    	}
    }
  }
}
`
function showError(id){
  notification.error({
    message: 'patient Id already exists',
    description: 'Please use another id',
     duration: 8,
  })
}
class AddPatientButton extends Component{
  constructor(props){
    super(props);
    this.state = {
      visible: false,
      nextID:'',
      confirmLoading: false,
    };
  }
  showModel = () => {
    this.setState({
      visible : true,
    });
  }
  handleOk = ()=>{
    this.setState({confirmLoading:true})
    const form = this.formRef.props.form;
   form.validateFields((err, values) => {
     if (err) {
       this.setState({ confirmLoading:false});
       return;
     }
    let history = [];
    const names = form.getFieldValue("names");
    const p = form.getFieldValue("personal_medical_history");
    p.forEach((e,i)=>{
      if(names.indexOf(e.value)>-1){
        history.push({personal_medical_history_id:e.id})
      }
    })
     let vari = {
        name: form.getFieldValue("patientName"),
        age: form.getFieldValue("age") ,
        referred_id: form.getFieldValue("refrence_id"),
        blood_group: form.getFieldValue("blood-group"),
        city: form.getFieldValue("city"),
        date_of_birth: form.getFieldValue("dob") ?  moment(form.getFieldValue("dob")).format() : moment().format() ,
        gender: form.getFieldValue("gender"),
        mobile: form.getFieldValue("mobileNumber"),
        pincode: form.getFieldValue("pincode"),
        street_address: form.getFieldValue("street_address"),
        patient_id: form.getFieldValue("patientID").toString(),
       }
       if(history.length>0){
         vari.patient_personal_medical_history= {
           data : history
         }
       }
       const patient_number = form.getFieldValue("patientID").toString()
       client.query({ query:confirmId, variables:{id:patient_number}})
         .then((response)=>{
           console.log(response)
          if(response.data.patient_aggregate.nodes.length>0){
            showError(patient_number)
            this.setState({ confirmLoading:false,visible: true });
          }else {
            client.mutate({ mutation:INSERT_NEW_PATIENT_MUTATION, variables:{data:[vari]}})
              .then((response)=>{
               setTimeout(()=>{
                 this.setState({ confirmLoading:false,visible: false });
                 this.updateNextID()
                 form.resetFields();
                 this.props.history.push('/patients/patient/'+response.data.insert_patient.returning[0].id)
               },700)
             })
          }
        })
    });
  }
  handleCancel= ()=>{
    this.setState({
      visible : false,
    });
    this.props.history.goBack()
  }
  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }
  updateNextID = ()=>{
    // get last id
    client.query({ query:GET_NEXT_ID_QUERY,fetchPolicy: 'no-cache'})
      .then((response)=>{
        let i = response.data.patient_aggregate.aggregate.count;
        i++;
        this.setState({nextID:this.state.nextID === i ? i+1 : i})
    })
  }
  componentDidMount(){
    this.updateNextID()
  }
  render(){
    const { confirmLoading } = this.state;
    return (
      <React.Fragment>
        <Link to="/patients/patient/add">
          <Button
            onClick={this.showModel}
          >Add Patient
          </Button>
        </Link>
        <Modal
          title="New Patient Registration"
          bodyStyle={{paddingBottom:0}}
          style={{ top: 30 }}
          closable={false}
          maskClosable={false}
          width={800}
          maskStyle={{backgroundColor: 'rgba(0, 0, 0, 0.87)'}}
          visible={this.state.visible}
          onOk={this.handleOk}
          okText="Save"
          cancelText="Cancel"
          confirmLoading={confirmLoading}
          onCancel={this.handleCancel}
        >
          <CustomRegistrationFrom visible={this.state.visible} nextID={this.state.nextID} wrappedComponentRef={this.saveFormRef} />

        </Modal>
      </React.Fragment>
    );
  }
}

export default AddPatientButton;
