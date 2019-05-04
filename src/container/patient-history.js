import React, { Component } from 'react';
import { Row, Col, Card, Form } from 'antd';
import DynamicList from '../component/react-dynamic-list';
import VisitAreaContainer  from './visit-area'
// Patient history containier
const styles = {
  medicalHistory:{
    height:'100%',
  }
}
function ContainerLayout(props){
  return(
    <Row className="uk-responsive-height" style={styles.medicalHistory}>
      <Col className="uk-overflow-auto uk-height-1-1 uk-background-default ant-card-bordered " md={{span:24}} lg={{span:18}}>
      <VisitAreaContainer data={props.data}/>
      </Col>
      <Col
      className="uk-overflow-auto uk-background-default uk-height-1-1 uk-border-rounded"
       xs={0}
       md={{span:0}}
       lg={{span:6}}
      >
        <Form layout="vertical" className="login-form uk-scrollspy-class" >
        <RightPanel {...props}/>
      </Form>
      </Col>
    </Row>
  )
}

class RightPanel extends Component{
  constructor(props){
    super(props);
    this.state = {
      data:[],
    };
  }
  componentDidMount(){
    this.updateHistory()
  }
  updateHistory = () => {
    const form = this.props.form
    const { getFieldDecorator } = this.props.form
    form.setFieldsValue({
      keys:this.props.data.patient_personal_medical_history.map((i,k)=>{
        return k
      }),
    })
    this.props.data.patient_personal_medical_history.forEach((i,k)=>{
      getFieldDecorator(`names[${k}]`)

      form.setFieldsValue({
          [`names[${k}]`]: i.personal_medical_history.name
      })
    })
  }
  componentDidUpdate(prevProps, prevState, snapshot){
   if( this.props.data.patient_personal_medical_history !== prevProps.data.patient_personal_medical_history ){
      this.updateHistory()
   }
  }
  render(){

    return (
     <Card title="MEDICAL HISTORY" type="inner" activeTabKey='1'>
      <DynamicList  {...this.props} border/>
     </Card>
    );
  }
}
const ContainerLayoutForm = Form.create()(ContainerLayout);

export default ContainerLayoutForm;
