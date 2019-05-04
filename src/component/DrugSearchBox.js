import React,{ Component } from 'react';
import {Select ,Form } from 'antd';
import  client  from '../apollo-client'
import gql from "graphql-tag";

const FormItem = Form.Item;
const Option = Select.Option;

const GET_DRUG_QUERY =gql`
{
  drug{
    value:id
    text:name
    search:name
  }
}
`

const INSERT_DRUG_MUTATION = gql`
mutation Insert_Drug($name: String!) {
  insert_drug(objects: {name: $name}) {
    returning {
      value:id
      text:name
      search:name
    }
  }
}
`
class DrugSearchBox extends Component{
  constructor(props){
    super(props);
    this.state = {
      option:[]
    };
  }
  handleSearch = (value) =>{
    let option  = this.state.option;
    let isMatch = false;
    option.forEach((i,k)=>{
      if(i.search.toLowerCase() === value.toLowerCase())
      isMatch = true;
    })
    if(!isMatch){
      if(option[0] && option[0].isSuggest){
          option.shift();
      }
      if(value.trim() !== '')
      option.unshift({text:<a href="#">{'Add New Drug "'+value+'"'}</a>,search:value,value:null,isSuggest:true})
      this.setState({option:option})
    }
  }
  onSelect =  (value,option) => {
    const { form } = this.props;
    if(option.props.text !== ''){
    let options = this.state.option;
    let selectedText = option.props.search;
      options.shift();
       client.mutate({ mutation:INSERT_DRUG_MUTATION, variables:{name:selectedText}})
         .then((response)=>{
          this.props.onSelect(response.data.insert_drug.returning[0])
           options.push(response.data.insert_drug.returning[0])
           this.setState({option:options});
        })
    }else {
        this.props.onSelect(option.props)
      // can use data-binding to get
          //     refrence_id: this.state.option[option.key].id
      //    form.resetFields();
    }
  }
  componentDidMount(){
    // get the list of referred by options
  client.query({ query:GET_DRUG_QUERY})
    .then((response)=>{
      this.setState({option:response.data.drug})
    })
  }
  render(){
    const { getFieldDecorator } = this.props.form;
    let children = [];
    children = this.state.option.map((i,k)=>
        <Option
          key={k}
          search={i.search}
          text={ i.isSuggest ? i.text : '' }
          value={i.value}>{i.text}</Option>)

    return (
        <FormItem className="uk-width-1-1">
          {getFieldDecorator("addDrug")(
            <Select
             className="uk-width-1-1"
              showSearch
              autoClearSearchValue
              placeholder="Enter Procedure Name"
              optionFilterProp="search"
              showArrow={false}
              onSearch={this.handleSearch}
              onSelect={this.onSelect}
              notFoundContent={'Enter valid input'}
            >
              {children}
            </Select>)}
        </FormItem>
      )
  }
}
export default DrugSearchBox;
