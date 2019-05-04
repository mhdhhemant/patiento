import React , {Component} from 'react';
import { Tabs, Layout,  Card, Row, Col } from 'antd';
import PatientList from '../component/patient-list';
import PatientHeader from './../component/patients-header';
import PatientHistory from './patient-history.js'
import gql from "graphql-tag";
import { Grand } from './test/a'
import Loader from './../component/Loader'
import { Query, Subscription } from "react-apollo";
import { auth } from "../Auth/Auth"
const { Meta } = Card;
const TabPane = Tabs.TabPane;
const { Header, Content,Sider } = Layout;

const FETCH_PATIENTBYID = gql`
query Fetch_patientByID( $id : Int!){
  patient_by_pk(id :$id){
    id
    name
    mobile
    gender
    age
    blood_group
    street_address
    city
    patient_id
    patient_personal_medical_history{
      personal_medical_history {
        id
        name
      }
    }
  }
}`
const SUB_PATIENTBYID = gql`
subscription Fetch_patientByID( $id : Int!){
  patient_by_pk(id :$id){
    id
    name
    mobile
    gender
    age
    blood_group
    street_address
    city
    patient_id
    patient_personal_medical_history{
      personal_medical_history {
        id
        name
      }
    }
  }
}`
const PATIENT_UPDATE_SUBSCRIPTION = gql`
subscription PATIENT_UPDATES($limit: Int!){
	patient(limit:$limit order_by:{update_at:desc}){
    id
    name
    update_at
  }
}
`

const EmpetyConainer = (props) => (
  <Row style={{width:'100%'}} type="flex" justify="center" align="middle">
    <Col span={24} style={{display:'flex'}} className="uk-flex uk-flex-center">
      {props.children}
    </Col>
  </Row>
)

class PatientContainer extends Component {
  state = {
    limit:1,
    data:{},
    name:"",
  }
  callback = (key) => {
  //  console.log(key);
  }
  onPatientsUpdate = ({subscriptionData:{data}})=>{
    this.setState({data:data.patient[0]})
  }
  componentDidMount(){
      auth.getProfile((err, profile) => {
        this.setState({name:profile.name})
      });
  }
  render(){
    const { limit,data } = this.state;
    const patientID = parseInt(this.props.match.params.id,10) > 0 ?  parseInt(this.props.match.params.id,10) : null;
    return (
      <Layout style={{height:'100%',overflow:'hidden'}}>
        <Sider width={290} style={{ height:'100%',background:'#fff'}}>
          <Card id="navigate" style={{height:'100%'}} className="uk-padding-remove-horizontal">
            <Meta
              className="uk-margin-bottom uk-padding-small uk-padding-remove-bottom"
              title={<h3 style={{letterSpacing:2}}className="uk-padding-remove-bottom uk-margin-remove">Patients</h3>}
              description={this.state.name}
            />
            {/* Subscribe to new patient table changes*/}
            <Subscription
               subscription={PATIENT_UPDATE_SUBSCRIPTION}
               onSubscriptionData={this.onPatientsUpdate}
               variables={{limit:limit}}
             >
               {(response) =>{
                return null
                }}
             </Subscription>
            <Tabs defaultActiveKey="3" style={{height:'100%',paddingLeft:10}} onChange={this.callback}>
              <TabPane style={{height:'100%'}} key="1" tab="Today" ><PatientList onSubscriptionData={data} {...this.props} type="today"/></TabPane>
              <TabPane style={{height:'100%'}}  key="2" tab="Recent"><PatientList onSubscriptionData={data} {...this.props}  type="recent"/></TabPane>
              <TabPane  style={{height:'100%'}} key="3" tab="All"   ><PatientList onSubscriptionData={data} {...this.props}  type="all"  /></TabPane>
            </Tabs>
          </Card>
        </Sider>
        {
          patientID && <Query query={FETCH_PATIENTBYID} variables={{id:patientID}}  fetchPolicy="cache-and-network">
             {({subscribeToMore, loading, error, data }) => {
               if (loading) return (<EmpetyConainer><Loader loading={loading}/></EmpetyConainer>)
               if (error) return `Error! ${error.message}`;
             subscribeToMore({
              document: SUB_PATIENTBYID,
              variables: { id: patientID },
              updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) return prev;
                if(subscriptionData.data.patient_by_pk.id!==patientID)
                return prev;
                else
                return subscriptionData.data
              }});
                 return (
                 <Layout className="uk-height-1-1" style={{ marginLeft: 0, border: '1px solid #e3d6d6',borderRadius: 5,overflow:"auto" }}>
                    <Header style={{ background: '#fff',padding:0,borderBottom:"1px solid #e3d6d6",height: 72}}>
                      <PatientHeader {...this.props} data={data.patient_by_pk}/>
                    </Header>
                    <Content className="uk-height-1-1" style={{ overflow: 'initial' }}>
                      <PatientHistory data={data.patient_by_pk}/>
                    </Content>
                 </Layout>
               );
             }}
            </Query>
        }
        {
          !patientID && (
            <EmpetyConainer>
              <p className="uk-text-meta">Select a patient to see details</p>
            </EmpetyConainer>
          )
        }
        <Grand />
      </Layout>
    )
  }
}

export default PatientContainer;
