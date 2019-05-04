import React , { Component } from 'react';
import { Row, Col ,Avatar, Icon} from 'antd';
import EditPatientButton from './edit-patient'
import { firstCharCapital } from '../util'

function PatientInfoCard (props) {
    return (
      <React.Fragment>
        <h1 style={{verticalAlign:'super',letterSpacing:"0.05em"}} className="uk-display-inline-flex patient-info-header section-heading">{firstCharCapital(props.name)}</h1>
        <h3 className="patient-info-data">File id - {props.patient_id ? props.patient_id+"," : "N/A"} Gender - {props.gender}. Age - {props.age ? props.age : "N/A"}</h3>
      </React.Fragment>
  )
}
function PatientContactCard (props){
  let addr = (props.street_address ? props.street_address+" " : "") +( props.city ?  props.city : '' );

  return (
      <React.Fragment>
        <h3 className="uk-display-inline-flex patient-info-header patient-info-data font-500" >
          <Icon type="phone" style={{fontSize:17}} className="uk-margin-small-right icon-flipped " />{props.mobile ? props.mobile : "N/A"}
        </h3>
        <h3 className="patient-info-data">
         <Icon type="environment" style={{fontSize:17,marginTop: 2, verticalAlign: "bottom"}} className="uk-margin-small-right" />
          {addr ? addr : "N/A"}
        </h3>
      </React.Fragment>
  )
}
// patient header
class Header extends Component{
  constructor(props){
    super(props);
    this.state = {
    };
  }
  render(){
    return (
        <Row className="uk-padding-small uk-padding-remove-vertical" type="flex" align="middle" justify="space-between">
          <Col span={1}>
            <Avatar  icon="user" size={49}/>
          </Col>
          <Col span={9} >
            <PatientInfoCard {...this.props.data}/>
          </Col>
          <Col span={8}>
            <PatientContactCard {...this.props.data}/>
          </Col>
          <Col offset={2} span={3}>
              <EditPatientButton {...this.props} patientID={this.props.data.id} />
          </Col>
        </Row>
    );
    }
}


export default Header;
