import React , { Component } from 'react';
import { Modal, Button} from 'antd';
import CustomRegistrationFrom from './patient-registration-form';
import  client  from '../apollo-client'
import gql from "graphql-tag"
import moment from 'moment';
import { Link} from 'react-router-dom'

const UPDATE_PATIENT_MUTATION = gql`
mutation update_patient($data:  patient_set_input! $id: Int! $history: [patient_medical_history_insert_input!]! $InsertEmpety: Boolean!){
  update_patient(where:{id:{_eq:$id}} _set:$data){
    affected_rows
  }
  delete_patient_medical_history( where :{ patient_id: { _eq: $id}}){
    affected_rows
  }
  insert_patient_medical_history(objects:$history) @include (if : $InsertEmpety){
    affected_rows
  }
}
`

const PATIENTBYID = gql`
query patientByID( $id : Int!){
  patient_by_pk(id :$id){
     id
     name
     mobile
     gender
     age
     blood_group
     city
     date_of_birth
     pincode
     referred_id
     street_address
     patient_id
     patient_personal_medical_history{
     personal_medical_history {
       id
       name
     }
   }
  }
}`

class EditPatientButton extends Component{
  constructor(props){
    super(props);
    this.state = {
      visible: false,
      confirmLoading: false,
      id:this.props.patientID,
      patient_id:"",
    };
  }
  showModel = () => {
    this.setState({
      visible : true,
    });
    this.getPatientData()
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
        history.push({patient_id:this.props.patientID,personal_medical_history_id:e.id})
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
        patient_id:form.getFieldValue("patientID").toString(),
        update_at:moment().format(),
     }
     let variable = {
       data:vari,
       history : history,
       id:this.props.patientID
     }
     if(history.length === 0){
       variable.InsertEmpety = false
     }else {
       variable.InsertEmpety = true
     }
     client.mutate({ mutation:UPDATE_PATIENT_MUTATION, variables:variable})
       .then((response)=>{
        setTimeout(()=>{
          this.setState({ confirmLoading:false,visible: false});
          form.resetFields();
          this.props.history.push("/patients/patient/"+this.props.patientID)
        },700)
      })
    });
  }
  handleCancel= ()=>{
    this.setState({
      visible : false,
    });
    const form = this.formRef.props.form;
    form.resetFields();
    this.props.history.goBack()
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }
  getPatientData = () => {

    client.query({ query:PATIENTBYID,variables:{id:this.props.patientID},fetchPolicy:'no-cache'})
      .then((response)=>{
        let data = response.data.patient_by_pk;
        const form = this.formRef.props.form;
        form.resetFields()
        form.setFieldsValue({
          patientName:data.name,
          age:data.age,
          "blood-group":data.blood_group,
          city:data.city,
          gender:data.gender,
          mobileNumber:data.mobile,
          pincode:data.pincode,
          "street_address":data.street_address,
          refrence_id:data.referred_id,

          keys:data.patient_personal_medical_history.map((i,k)=>{
            return k
          })
        })
        data.patient_personal_medical_history.forEach((i,k)=>{
          form.setFieldsValue({
              [`names[${k}]`]: i.personal_medical_history.name
          })
      })
      this.setState({patient_id:data.patient_id})
   })
  }

  render(){
    const { confirmLoading , patient_id} = this.state;
    return (
      <React.Fragment>
      <Link to={'/patients/patient/'+this.props.patientID+"/edit"}>
        <Button
          onClick={this.showModel}
        >Edit Profile
        </Button>
        </Link>
        <Modal
          title="Edit Profile"
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
          <CustomRegistrationFrom visible={this.state.visible} nextID={patient_id} wrappedComponentRef={this.saveFormRef} />

        </Modal>
      </React.Fragment>
    );
  }
}

export default EditPatientButton;
