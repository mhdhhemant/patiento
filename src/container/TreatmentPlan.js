import React, { Component} from 'react';
import { Row,Col,Icon,Table, Input, InputNumber, Popconfirm, Form,Button,Select,Tooltip } from 'antd';
import DrugSearchBox from '../component/DrugSearchBox'
import  client  from '../apollo-client'
import gql from "graphql-tag";
import  { formatNumber } from '../util'
import classNames from 'classnames'
const FormItem = Form.Item;
const Option = Select.Option;

const TREATMENT_PLAN_MUTATION = gql`
mutation INSERT_TREATMENT_PLAN($data:  [treatment_plan_insert_input!]! $visit_id:Int $delete: Boolean){
  delete_treatment_plan(where:{visit_id:{_eq:$visit_id}})@include(if: $delete){
    affected_rows
  }
  insert_treatment_plan(objects:$data){
    returning{
      id
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

const FormContext = React.createContext();
const renderContent =  (value, row, index) =>{
  let props = row.search ? {colSpan:0} : {}
    const obj = {
      children:value,
      props: props
    }
    return obj;
}

export class TreatmentPlan extends Component{
  constructor(props){
    super(props);
    this.state = {
      loading:false,
      edit:false,
      drugOption:[],
      data:[
      ],
    };
  }
  handleChange = (e,field,index)=>{
    let values = this.props.form.getFieldsValue();
    values[field][index]= e.target.value;
    const total = formatNumber(values["cost"][index])*formatNumber(values["unit"][index])-formatNumber(values["discount"][index])
    let newData = [...this.state.data];
    newData[index][field] = e.target.value
    newData[index].total = isNaN(total) ? 0 : formatNumber(total);
    this.setState({data:newData})
  }
  handleDelete = (key)=>{
    let newData = [...this.state.data];
    this.setState({data:newData.filter((d,i)=>d.key!==key)})
  }
  handleDrugSelect = (drug)=>{
    let data = [...this.state.data];
    data.push({
      key:this.state.data.length,
      procedure: drug,
      unit:1,
      cost:0,
      discount:0,
      total:0
    })
    this.setState({data})
  }
  handleSave = ()=>{
    this.props.form.validateFields((error, values) => {
      if (error) {
        return;
      }
    const { visit:{id} }  = this.props;
      let data = [];
       this.state.data.forEach((e,i)=>{
         data.push({
            visit_id:id,
            drug_id:e.procedure.value,
            cost:e.cost,
            unit:e.unit,
            discount:e.discount,
          })
       })
       this.setState({loading:true})
      client.mutate({ mutation:TREATMENT_PLAN_MUTATION, variables:{data:data,visit_id:id,delete:this.state.edit}})
      .then((response)=>{
        // send stored treatment plan as args.
        this.setState({loading:false,data:[],edit:false})
        this.props.onSaved(response.data.insert_treatment_plan.returning)
        this.props.form.resetFields()
        // change the edit ste on vist-area
       })
    });
  }
  componentDidUpdate(prevProps, prevState){
    if(prevProps.visit.treatment_plan !== this.props.visit.treatment_plan ){
      console.log("updated")
    //console.log(this.props.visit.treatment_plan)
      // i do no t how it is  update when there is no data
    }
  }
  handleCancel = ()=>{
    if(this.state.edit){
      this.props.onTableEdit("","")
      this.setState({data:[],edit:false})
    }else{
      this.props.onCancel({visit_id:this.props.visit.id,deleteVisit:true})
    }
  }
  handleTableDelete = ()=>{
    this.props.onCancel({visit_id:this.props.visit.id,deleteVisit:false})
  }
  handleTableEdit = ()=>{
    // args visit , plan
    let data = []
    this.props.visit.treatment_plan.forEach((i,k)=>{
        data.push({
          key:k,
          procedure: i.drug,
          unit:i.unit,
          cost:i.cost,
          discount:i.discount,
          total:formatNumber((i.unit*i.cost)-i.discount)
        })
    })

    this.setState({edit:true,data:data})
    this.props.onTableEdit(this.props.visit.id,0)
  }
  render(){
    const { data, loading } = this.state;
    let local = [...data]
    if(!this.state.edit)
    this.props.visit.treatment_plan.forEach((i,k)=>{
        local.push({
          key:k,
          procedure: i.drug,
          unit:i.unit,
          cost:i.cost,
          discount:i.discount,
          total:formatNumber((i.unit*i.cost)-i.discount)
        })
    })

    const { edit }  = this.props;
    let columns = [
      {
        title: 'PROCEDURE',
        dataIndex: 'procedure',
        width: '40%',
        render :(drug,row,index)=>{
          return {
            children:drug.search,
          }
        }
      },
  //    40 20 20 15 5 = 100
      {
        title: edit ? 'UNIT * COST' : 'COST',
        dataIndex: 'cost',
        width: '25%',
        render: (text,record,index)=>{
        if(!edit){
          return formatNumber(record.cost*record.unit)
        }
        const { getFieldDecorator } = this.props.form;
        return (
            <Row gutter={10}>
            <Col span={10}>
            <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`unit[${index}]`, {
              initialValue: record.unit
            })(<Input onChange={(e)=>this.handleChange(e,"unit",index)}/>)}
            </FormItem>
            </Col>
              <Col span={14}>
                <FormItem style={{ margin: 0 }}>
                  {getFieldDecorator(`cost[${index}]`, {
                    initialValue: record.cost
                  })(<Input onChange={(e)=>this.handleChange(e,"cost",index)} />)}
                </FormItem>
              </Col>
            </Row>
          )
        },
      },
      {
        title: 'DISCOUNT',
        dataIndex: 'discount',
        width: '20%',
        render:(text,record,index)=>{
        if(!edit){
          return text
        }
        const { getFieldDecorator } = this.props.form;
        return (
            <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`discount[${index}]`, {
              initialValue: record.discount
            })(<Input onChange={(e)=>this.handleChange(e,"discount",index)}/>)}
            </FormItem>
          )
        },
      },
      {
        title: 'TOTAL',
        width: '10%',
        dataIndex: 'total',
        render: (text, record) => {
            return {
              children:(<span>{text}</span>),
              props:{className:"uk-text-right"}}
        }
      }
    ];
    if(edit)
    columns.push({
      title: '',
      width: '5%',
      dataIndex:'icon',
      render: (text, record) => {
          return (<span>{text}<Icon  type="close-circle" twoToneColor="#eb2f96" theme="twoTone" onClick={() => this.handleDelete(record.key)} /></span>)
      }
    })

    const components = {  };
    columns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record,index) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: true,
      }),
    };
  });
 return (
    <FormContext.Provider value={this.props.form}>
    <div className={classNames('uk-width-1-1 uk-visible-toggle',{"visit-edit":edit})} >
      <div className={classNames("uk-width-1-1 uk-padding-small",{"uk-padding-remove-vertical":edit,"uk-padding-remove-top":!edit})}>
        <Table
          id="visit-table"
          className="uk-width-1-1"
          components={components}
          pagination={false}
          size="small"
          locale={{emptyText:""}}
          title={()=><TableHeader onClickEdit={this.handleTableEdit} title="Treatment Plan" edit={edit} />}
          footer={ this.renderSearchBox}
          dataSource={local}
          columns={columns}
          rowClassName="editable-row uk-padding-very-small"
          {...this.props}
        />
        {edit && (
          <React.Fragment>
            <Row type="flex"  className="uk-padding-very-small uk-padding-remove-horizontal uk-margin-small-left uk-margin-small-right border-top"  >
              <Col span={7} style={{paddingLeft:5}}><DrugSearchBox {...this.props} onSelect={this.handleDrugSelect} /></Col>
            </Row>
            <TotalCountRow data={local}/>
          </React.Fragment>
        )}
        {!edit && !this.state.edit && local.length > 1&& (
            <Row type="flex" justify="end" className="uk-padding-very-small uk-margin-small-left uk-margin-small-right uk-margin-small-top border-top"  >
              <Col  style={{paddingRight:5}} className="uk-text-bold uk-text-small"> Estimated Total: {Number.parseFloat(totalCount(local)).toFixed(2)}</Col>
            </Row>
        )}
          </div>
        {edit && (
          <Row type="flex" justify="end" gutter={10}  align="middle" className="uk-width-1-1 uk-margin-remove" style={{padding:"12px 10px",borderTop: "1px solid #e8e8e8"}}>
            {this.state.edit &&
              (<Col>
                <Popconfirm placement="topLeft" title="Are you sure to delete the Treatment Plan?" onConfirm={this.handleTableDelete} okText="Yes" cancelText="No">
                  <Button >Delete</Button>
                </Popconfirm>
               </Col>)
              }
            <Col className="uk-margin-auto-left"><Button onClick={this.handleCancel}>Cancel</Button></Col>
            <Col >
              <Button type="primary" disabled={data.length<1} loading={loading} onClick={this.handleSave}>Save</Button>
            </Col>
        </Row>)}
      </div>
      </FormContext.Provider>
      );
  }
}
function totalCount (data){
  let totalCost=0,totalDiscount=0,total = 0;
     data.forEach((e,i)=>{
        totalCost = totalCost + formatNumber(e.cost)*formatNumber(e.unit)
        totalDiscount = totalDiscount + formatNumber(e.discount)
     })
    return total = formatNumber(totalCost-totalDiscount)
}
function TotalCountRow(props){
   const { data } = props;
   let totalCost=0,totalDiscount=0,total = 0;
   data.forEach((e,i)=>{
      totalCost = totalCost + formatNumber(e.cost)*formatNumber(e.unit)
      totalDiscount = totalDiscount + formatNumber(e.discount)
   })
   total = formatNumber(totalCost-totalDiscount)
  return (
    <Row style={{paddingTop:6}} className="uk-padding-very-small uk-padding-remove-horizontal uk-margin-small-left uk-margin-small-right border-top">
      <Col offset={12} span={4}>
        <h5 className="uk-text-small uk-margin-remove">TOTAL COST</h5>
        <div className="uk-text-small uk-margin-small-left">{totalCost}</div>
      </Col>
      <Col span={5}>
        <h5 className="uk-text-small uk-margin-remove">TOTAL DISCOUNT</h5>
        <div className="uk-text-small uk-margin-small-left">{totalDiscount}</div>
      </Col>
      <Col span={3}>
        <h5 className="uk-text-small uk-margin-remove">GRAND TOTAL</h5>
        <div className="uk-text-small uk-text-right uk-margin-small-right">{total}</div>
      </Col>
    </Row>
  )
}
function TableHeader(props){
  return (
    <Row
    type="flex"
    justify="space-between"
    className={classNames(
      "uk-text-emphasis uk-text-bold",
      {"uk-padding-small uk-padding-remove-horizontal":props.edit,
      "uk-padding-very-small uk-padding-remove-horizontal":!props.edit})}
    >
      <Col>{props.title}</Col>
      <Col span={1}>
        {!props.edit &&  <Tooltip placement="rightBottom" title="Edit"> <Icon title="edit" onClick={props.onClickEdit} style={{ fontSize: '16px'}} className="uk-text-right uk-invisible-hover" type="edit" /></Tooltip>}
      </Col>
    </Row>
  )
}
const WrappedTreatmentPlan = Form.create()(TreatmentPlan)

export default WrappedTreatmentPlan ;
