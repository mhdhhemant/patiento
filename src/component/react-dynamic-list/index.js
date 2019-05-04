import React from "react";
import "antd/dist/antd.css";
import "./index.css";
import { Form, Input,  List, Select, AutoComplete } from "antd";
import  client  from '../../apollo-client'
import gql from "graphql-tag"
const Option = Select.Option;
const FormItem = Form.Item;
const { TextArea } = Input;

const INSERT_MEDICAL_HISTORY_MUTATION = gql`
mutation Insert_medical_history($name: String!) {
  insert_personal_medical_history(objects: {name: $name}) {
    returning {
      id
      text: name
      value: name
    }
  }
}
`

const MEDICAL_HISTORY_QUERY= gql`
{
  personal_medical_history  {
    id
    text:name
    value:name
  }
}
`;
class DynamicFieldList extends React.Component {
   state = {
      isNewMounted: 0,
      isEnter: false,
      isStartFieldVisible: true,
      privateDataSource: [],
      dataSource: []
   };
   componentDidMount(){
     // get the list of referred by options
   client.query({ query:MEDICAL_HISTORY_QUERY})
     .then((response)=>{
       this.setState({privateDataSource:response.data.personal_medical_history})
     })
   }
   handleFilter = (input, option) => {
      return (
         option.key
            .trim()
            .toLowerCase()
            .indexOf(input.trim().toLowerCase()) >= 0
      );
   };
   handleKeyPress = (ev, index, fieldName) => {
      ev.preventDefault();
      const { form } = this.props;
      // can use data-binding to get
      // block the use if nothing typed
      const fieldvalue = form.getFieldValue(fieldName);
      if (fieldvalue && fieldvalue.length > 1) {
         this.add(index);
         this.setState({ isEnter: true });
      }
   };
   handleBlur = (fieldName, index, k) => {
      // Remove the item ig it's value is empety when blur
      // check the it's value
      const { form } = this.props;
      // can use data-binding to get
      // block the use if nothing typed
      // nautral the dataSource
      let updateState = {
         dataSource: [],
         isStartFieldVisible: true
      };
      const fieldvalue = form.getFieldValue(fieldName);
      if (!fieldvalue || fieldvalue.trim() === "") {
         this.remove(k);
         updateState.isNewMounted = -1;
      }
      this.setState(updateState);
   };
   handleSearch = value => {
      if (value.length < 3) {
         this.setState({ dataSource: [], isEnter: false });
      } else {
         const optionStore = this.state.privateDataSource;
         let option = [];
         let isMatch = false;
         optionStore.forEach((i, k) => {
            if (i.value.trim().toLowerCase() === value.trim().toLowerCase()) {
               isMatch = true;
            }
         });
         if (!isMatch) {
            if (value.trim() !== "")
               option.push({
                  text: <a href="javascript;;">{'Add "' + value + '"'}</a>,
                  value: value.trim(),
                  isSuggest: true
               });
            this.setState({
               dataSource: option.concat(optionStore),
               isEnter: false
            });
         } else {
            this.setState({
               dataSource: option.concat(optionStore),
               isEnter: false
            });
         }
      }
   };
   onSelect = (value, option,k) => {
     const { form } = this.props;
     // can use data-binding to get
     const history = form.getFieldValue("personal_medical_history");
      // Here we are using private data store to sync values
      if (option.props.children.type) {
         let options = [];
         client.mutate({ mutation:INSERT_MEDICAL_HISTORY_MUTATION, variables:{name:value}})
           .then((response)=>{
             options.push(response.data.insert_personal_medical_history.returning[0])
             this.setState({
                privateDataSource: this.state.privateDataSource.concat(options),
                isStartFieldVisible: true,
                isEnter: false,
                dataSource: this.state.privateDataSource.concat(options)
             },()=>{
               form.setFieldsValue({
                  personal_medical_history: this.state.privateDataSource
               });
             });

          })
      } else {
         this.setState({ isEnter: false, isStartFieldVisible: true });
         form.setFieldsValue({
            personal_medical_history: this.state.privateDataSource
         });
      }
   };
   remove = k => {
      const { form } = this.props;
      // can use data-binding to get
      const keys = form.getFieldValue("keys");
      form.setFieldsValue({
         keys: keys.filter(key => key !== k)
      });
   };

   add = index => {
      let FoucsElementIndex;
      const { form } = this.props;
      // can use data-binding to get
      const keys = form.getFieldValue("keys");
      // Check that is it init on Starter Button
      let nextKeys;
      if (keys.length === index) {
         keys.push(index);
         nextKeys = keys;
      } else {
         keys.splice(++index, 0, keys.length);
         nextKeys = keys;
      }
      FoucsElementIndex = index;
      // can use data-binding to set
      // important! notify form to detect changes
      form.setFieldsValue({
         keys: nextKeys
      });
      this.setState({
         isStartFieldVisible: false,
         isNewMounted: FoucsElementIndex
      });
   };

   render() {
      const { dataSource, isNewMounted } = this.state;
      const { getFieldDecorator, getFieldValue } = this.props.form;
      let children = [];
      children = dataSource.map((i, k) => (
         <Option
            key={k}
            text={i.isSuggest ? i.text : ""}
            value={i.value.toLowerCase()}
         >
            {i.text}
         </Option>
      ));

      const formItemLayout = {
         labelCol: {
            xs: { span: 24 },
            sm: { span: 4 }
         },
         wrapperCol: {
            xs: { span: 24 },
            sm: { span: 20 }
         }
      };
      const formItemLayoutWithOutLabel = {
         wrapperCol: {
            xs: { span: 24, offset: 0 },
            sm: { span: 20, offset: 4 }
         }
      };
      getFieldDecorator("keys", { initialValue: [] });
      getFieldDecorator("personal_medical_history", { initialValue: [] });
      const keys = getFieldValue("keys");
      const formItems = keys.map((k, index) => {
         return (
            <FormItem
               style={{ margin: 0 }}
               {...formItemLayout}
               required={false}
               key={k}
            >
               {getFieldDecorator(`names[${k}]`)(
                  <AutoComplete
                     backfill
                     autoFocus={isNewMounted === index}
                     defaultOpen={false}
                     optionLabelProp="value"
                     dataSource={dataSource}
                     style={{width: this.props.border ? 185 : 250 }}
                     onSelect={(value, option)=>this.onSelect(value, option,k)}
                     onSearch={this.handleSearch}
                     filterOption={this.handleFilter}
                     onBlur={() => this.handleBlur(`names[${k}]`, index, k)}
                  >
                     <TextArea
                        style={{
                           boxShadow: "none",
                           resize: "none",
                           border: "none",
                           overflow: "hidden"
                        }}
                        autosize={{ minRows: 1, maxRows: 3 }}
                        onPressEnter={ev =>
                           this.handleKeyPress(ev, index, `names[${k}]`)
                        }
                     />
                  </AutoComplete>
               )}
            </FormItem>
         );
      });
      const { isStartFieldVisible, isEnter } = this.state;
      if (!isEnter && isStartFieldVisible)
         formItems.push(
            <FormItem className="add-content">
               <a
                  href="JAVASCRIPT:;"
                  className="add-new-content"
                  onClick={() => this.add(keys.length)}
               >
                  Click to Add
               </a>
            </FormItem>
         );
      return (
            <FormItem label="Personal Medical History" colon={false}>
               <List
                  id="medical-profile"
                  size="small"
                  bordered={this.props.border ? false : true }
                  className="personal-history-content"
                  dataSource={formItems}
                  renderItem={item => (
                     <List.Item
                        style={{ border: 0, paddingTop: 0, paddingBottom: 0 }}
                     >
                        {item}
                     </List.Item>
                  )}
               />
            </FormItem>
      );
   }
}
export default DynamicFieldList;
/*

{
            validateTrigger: ["onChange", "onBlur"],
            rules: [
              {
                whitespace: true,
                message: "Please input passenger's name or delete this field."
              }
            ]
          }
 */
