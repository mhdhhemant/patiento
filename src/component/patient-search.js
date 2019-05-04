import React, { Component } from 'react'
import { Select, Icon, Spin, Row, Col} from 'antd';
import  client  from '../apollo-client'
import gql from "graphql-tag";
import { Link } from 'react-router-dom'

const Option = Select.Option;

const SEARCH_QUERY = gql`
query SearchPatient($value: String!) {
  patient(
    limit: 6
    where:{
      _or:[
      {patient_id : {_like: $value }},
      {name: {_like: $value }},
      {mobile:{_like:$value}},
      {city: {_like: $value}},
      {street_address: { _like: $value }},
    ]
    }
  )
  {
    id
    name
    patient_id
  }
}
`
class PatientSearch extends Component{
  constructor(props){
    super(props);
    this.state = {
      value:undefined,
      data:[],
      loading:false,
      notFound:false,
    };
  }
  componentDidMount(){}
  handleChange = (value) => {
     this.setState({
       value,
       data: [],
       loading: false,
     });
  }

  handleSearch = (value)=>{
    this.setState({loading:true,data:[]})
    if(value === ''){
       this.setState({loading:false,data:[]})
      return null;
   }
    client.query({ query:SEARCH_QUERY,variables:{value:`%${value.trim()}%`} })
      .then((response)=>{
        this.setState({data:response.data.patient,loading:false,notFound: response.data.patient.length === 0})
    })
  }
  render(){
    const { data, loading, notFound, value } = this.state
    return (
      <Select
        placeholder="search patients"
        onSearch={this.handleSearch}
        className="uk-width-1-1"
        value={value}
        onChange={this.handleChange}
        showSearch
        defaultActiveFirstOption={false}
        suffixIcon={<Icon type="search"  style={{ color: 'rgba(0,0,0,.25)' }} />}
        filterOption={false}
        notFoundContent={loading ? <Spin size="small"/> : notFound ? "No patient found" : null}
        loading={this.state.loading}
      >
      {data.map((d,l) =>
        (<Option key={l} value={d.name}>
          <Link to={"/patients/patient/"+d.id}>
            <Row><Col span={20}>{d.name}</Col><Col span={4}><span className="uk-text-meta">P{d.patient_id}</span></Col></Row>
          </Link>
        </Option>))}
      </Select>
    );
  }
}

export default PatientSearch;
