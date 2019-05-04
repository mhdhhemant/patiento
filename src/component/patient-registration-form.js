import React, { Component } from 'react';
import { Row, Col, Avatar, Icon, message,Button, Upload, Form, Input, Radio,DatePicker, Select, Divider  } from 'antd';
import FancyTag from './custom-tag';
import  client  from '../apollo-client'
import gql from "graphql-tag";
// Import all blood Groups
import bloodGroups from '../conf/blood-groups';
import DynamicList from './react-dynamic-list';
const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;

const GET_REFERRED_BY_QUERY =gql`
{
  referred_by{
    value:id
    text:name
    filterText:name
  }
}
`

const INSERT_REFERRED_BY_MUTATION = gql`
mutation Insert_referred_by($name: String!) {
  insert_referred_by(objects: {name: $name}) {
    returning {
      value:id
      text:name
      filterText:name
    }
  }
}
`
// Form for new patient Registration
// Based on grid layout
function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isJPG = file.type === 'image/jpeg';
  if (!isJPG) {
    message.error('You can only upload JPG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJPG && isLt2M;
}

class CustomForm extends Component{
  state = {
    loading: false,
    isAgeSelected: true,
    isIDEdit:false,
    option: [],
    nextID:'',
  };
  handleEditID = ()=>{
    this.setState({isIDEdit:true})
  }
  componentDidUpdate(){
    if(!this.props.visible && this.state.isIDEdit){
      this.setState({isIDEdit:false})
    }
  }
  componentDidMount(){
      // get the list of referred by options
    client.query({ query:GET_REFERRED_BY_QUERY})
      .then((response)=>{
        this.setState({option:response.data.referred_by})
      })
  }
  onSelectAge = (isSelect) => {
      this.setState({isAgeSelected:isSelect})
  }

  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl => this.setState({
        imageUrl,
        loading: false,
      }));
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl => this.setState({
        imageUrl,
        loading: false,
      }));
    }
  }
  handleSubmit = (e) => {
   e.preventDefault();
   this.props.form.validateFields((err, values) => {
     if (!err) {
       console.log('Received values of form: ', values);
     }
   });
  }
  handleReferedSearch  =  (value) =>{
    let option  = this.state.option;
    let isMatch = false;
    option.forEach((i,k)=>{
      if(i.filterText.toLowerCase() === value.toLowerCase())
      isMatch = true;
    })
    if(!isMatch){
      if(option[0].isSuggest){
          option.shift();
      }
      if(value.trim() !== '')
      option.unshift({text:<a href="#">{'Add New Referrer "'+value+'"'}</a>,filterText:value,value:null,isSuggest:true})
      this.setState({option:option})
    }
  }
  onSelect = (value,option) => {
    const { form } = this.props;
    if(option.props.text !== ''){
      let options = this.state.option;
    let selectedText = option.props.filterText;
      options.shift();
       client.mutate({ mutation:INSERT_REFERRED_BY_MUTATION, variables:{name:selectedText}})
         .then((response)=>{
           form.setFieldsValue({
              refrence_id: response.data.insert_referred_by.returning[0].value
           });
           options.push(response.data.insert_referred_by.returning[0])
           this.setState({option:options});
        })
    }else {
      // can use data-binding to get
      form.setFieldsValue({
         refrence_id: this.state.option[option.key].id
      });
    }
  }
  render(){
    const uploadButton = (
    <div>
      <Icon type={this.state.loading ? 'loading' : 'plus'} />
      { /* disbale uploading text
        <div className="ant-upload-text">Upload</div>
      */}
    </div>
  );
    const { getFieldDecorator } = this.props.form;
    getFieldDecorator('age')

   const imageUrl = this.state.imageUrl;
   let { isAgeSelected, medicalHistory ,isIDEdit} = this.state;
   let children = [];
   children = this.state.option.map((i,k)=><Option key={k}  filterText={i.filterText} text={ i.isSuggest ? i.text : '' } value={i.value}>{i.text}</Option>)

   const bloodGroupOptions = bloodGroups.map((i,k)=><Option key={k} value={i}>{i}</Option>)
   return (
    <Form layout="vertical" onSubmit={this.handleSubmit} className="login-form uk-scrollspy-class" >
      <Row gutter={20} type='flex' align="end" >
        <Col span={2} >
          <Upload
            name="avatar"
            className=""
            showUploadList={false}
            action="//jsonplaceholder.typicode.com/posts/"
            beforeUpload={beforeUpload}
            onChange={this.handleChange}
          >
            {imageUrl ?
              (<Avatar size={60} style={{marginTop:10}} src={imageUrl}></Avatar>) :
              <Avatar size={60} style={{marginTop:10}}>{uploadButton}</Avatar>}
          </Upload>
        </Col>
        <Col span={10} offset={1}>
          <FormItem
            label="Patient Name"
          >
            {getFieldDecorator('patientName', {
              rules: [{ required: true, message: 'Please input patient name!' }],
            })(
              <Input />
            )}
          </FormItem>
        </Col>
        <Col span={11}>
          <FormItem
            label="Mobile Number"
          >
            {getFieldDecorator('mobileNumber',{
              rules: [
              {pattern: /^(\+\d{1,3}[- ]?)?\d{10}$/, message: 'Please input valid number! ' },
              ],
            })(
              <Input />
            )}
          </FormItem>
        </Col>
      </Row>
      <Row  type="flex" align="middle" style={{marginBottom: 7,marginTop: !isIDEdit ? -10 : 0}} >
        <Col id="patient_id" offset={3} span={10 } className="uk-flex">
            <FormItem
              wrapperCol={!isIDEdit ? {span:8} : {span:6}}
              labelCol={{span:7}}
              className="uk-margin-remove uk-padding-remove"
              label=" Patient ID :">
             {getFieldDecorator('patientID', { initialValue:this.props.nextID
                 ,rules: [{ required: true, message: 'invalid ID!' }],
               })(
                 <Input
                   className={!isIDEdit ? "notEdit" : ""}
                   addonAfter={!isIDEdit && <Button title="edit" shape="circle" onClick={this.handleEditID} style={{border:'none',display:'inline'}}  icon="edit" />}
                   disabled={!isIDEdit}
                   />
                )
             }</FormItem>
          </Col>
    </Row>
      <Row gutter={20} type='flex' align="top" >
        <Col offset={3} span={10}>
          <FormItem
            label="Gender"
          >
            {getFieldDecorator('gender', {
               initialValue: 'female',
            })(
              <Radio.Group style={{width:'100%'}}>
                <Row>
                  <Col span={12}>
                    <Radio value="male">Male</Radio>
                  </Col>
                  <Col span={12}>
                    <Radio value="female">Female</Radio>
                  </Col>
                </Row>
              </Radio.Group>
            )}
          </FormItem>
        </Col>
        <Col span={11}>
          <Row gutter={20} type='flex' align="top" justify="space-between">
            <Col span={14}>
              <FormItem
                label={(<div>
                  <FancyTag name="dob" style={{margin:'0'}} checked={!isAgeSelected} onClick={() => this.onSelectAge(false)}>DOB</FancyTag>
                  <span style={{margin:'0 10px'}}>/</span>
                  <FancyTag  name="age" style={{margin:'0'}} checked={isAgeSelected} onClick={()=>this.onSelectAge(true)}>Age</FancyTag>
                </div>)}
              >
                {isAgeSelected ? getFieldDecorator('age')(
                  <Input />
                ) :   getFieldDecorator('dob')(
                  <DatePicker placeholder="Select Date of Birth" format="DD-MM-YYYY" />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem
                label="Blood Group"
              >
                {getFieldDecorator('blood-group')(
                  <Select placeholder="None" >
                    {bloodGroupOptions}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
        </Col>

      </Row>
      <Row gutter={35} type='flex' align="top" >
        <Col offset={3} span={10}>
          <FormItem
            label="Street Address"
          >
            {getFieldDecorator('street_address')(
              <TextArea  autosize={{ minRows: 2, maxRows: 6 }} />
            )}
          </FormItem>
        </Col>
        <Col span={11}>
          <Row gutter={10} type='flex' align="top" justify="space-between">
            <Col span={14}>
              <FormItem
                label="City"
              >
                {getFieldDecorator('city')(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col span={10}>
              <FormItem
                label="Pincode"
              >
                {getFieldDecorator('pincode')(
                  <Input />
                )}
              </FormItem>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row type="flex" align="middle">
        <Col offset={3} span={21}>
          <FormItem
            label="Referred By"
          >
            {getFieldDecorator('refrence_id')(
              <Select
                showSearch
                optionFilterProp="filterText"
                showArrow={false}
                onSearch={this.handleReferedSearch}
                onSelect={this.onSelect}
                notFoundContent={'Enter valid input'}
              >
                {children}
              </Select>,
            )}
          </FormItem>
        </Col>
      </Row>
      <Divider style={{margin:0,marginTop:10}}/>
      <div className="ant-model-subtitle uk-padding-small">Medical Profile </div>
      <Row>
        <Col span={12} offset={3}>
          <DynamicList {...this.props} />
        </Col>
      </Row>
    </Form>
    );
  }
}

const WrappedCustomForm = Form.create()(CustomForm)

export default WrappedCustomForm ;
