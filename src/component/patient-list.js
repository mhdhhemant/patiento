import React , { Component } from 'react';
import { List, message, Spin } from 'antd';
import { Redirect } from 'react-router-dom'
import {AutoSizer  } from 'react-virtualized'
import InfiniteScroll from 'react-infinite-scroller';
import  client  from '../apollo-client'
import gql from "graphql-tag";
import moment from 'moment'
import { firstCharCapital, formatPatientDate } from './../util'

const FETCH_PATIENTS_LIST_QUERY = gql`
query ($limit: Int!, $offset: Int = 0, $today: timestamptz) {
  patient(limit: $limit, offset: $offset, order_by: {id: desc}, where: {update_at: {_gte: $today}}) {
    id
    name
    update_at
  }
  patient_aggregate {
    aggregate {
      count
    }
  }
}
`

class InfiniteList extends Component {
  constructor(props){
    super(props);
    this.state = {
      data: [],
      loading: true,
      hasMore: true,
      limit:15,
      offset:0,
      total:0,
      selectedID:""
    }
  }
  getData = (callback) => {
     const { type } = this.props;
     let date ;
     switch (type) {
      case "today":
         date = moment().format("YYYY-MM-DD")
         break;
      case "recent":
         date = moment().subtract(2, 'days');
         break;
      default:
        date = null
     }

   client.query({ query:FETCH_PATIENTS_LIST_QUERY, variables:{limit:this.state.limit,offset:this.state.offset,today:date}})
     .then((response)=>{

      this.setState(
         {
           hasMore: this.state.offset < response.data.patient_aggregate.aggregate.count,
           offset:this.state.offset+this.state.limit
         },()=>{
         callback(response)
       })
     })
  }
  componentDidUpdate(preProps,preState){
   if(preProps.onSubscriptionData && preProps.onSubscriptionData.id && this.props.onSubscriptionData.id && preProps.onSubscriptionData.update_at !== this.props.onSubscriptionData.update_at){
       let data = this.state.data;
       let i = 0;
       i = data.findIndex((e)=> this.props.onSubscriptionData.id === e.id)
       data.splice(i==-1 ? 0 : i,i==-1 ? 0 : 1,this.props.onSubscriptionData)
       this.setState({data:data,offset:(this.state.offset+1)})
    }
  }
  componentDidMount() {

    this.getData((res) => {
      this.setState({
        loading:false,
        data: res.data.patient,
      });
    });
  }
  handleInfiniteOnLoad = () => {
    let data = this.state.data;
    this.setState({
      loading: true,
    });
    if (!this.state.hasMore) {
      message.warning('Infinite List loaded all');
      this.setState({
        hasMore: false,
        loading: false,
      });
      return;
    }
    this.getData((res) => {
      data = data.concat(res.data.patient);
      this.setState({
        data,
        loading: false,
      });
    });
  }
  isRowLoaded = ({ index }) => {
    return !!this.loadedRowsMap[index];
  }
  handleClick = (id) =>{
    this.setState({selectedID:id})
  }

  render() {
    const { data,selectedID } = this.state;
    const patientID = this.props.match.params.id;
    return (
      <AutoSizer disableWidth>
        {({height})=> (
          <div className="demo-infinite-container" style={{height:height-45-115.6}} >
            <InfiniteScroll
              initialLoad={false}
              pageStart={0}
              loadMore={this.handleInfiniteOnLoad}
              hasMore={!this.state.loading && this.state.hasMore}
              useWindow={false}
            >
              <List
                className="patient-list"
                size="small"
                split
                dataSource={this.state.data}
                renderItem={item => (
                  <List.Item key={item.id} onClick={()=>this.handleClick(item.id)} className={item.id.toString() === patientID ? "paitent-list-item-selected" : ""}>
                    <List.Item.Meta
                      title={firstCharCapital(item.name)}
                      description={item.update_at && moment(item.update_at).fromNow()}
                    />
                    <span style={ {fontSize: 13} } className="uk-text-meta">{item.update_at && formatPatientDate(item.update_at)}</span>
                  </List.Item>
                )}
              >
              { selectedID!== "" && <Redirect to={"/patients/patient/"+selectedID}/>}
                {this.state.loading && this.state.hasMore && (
                  <div className="demo-loading-container" style={{bottom: data.length === 0 ? -40 : 40}}>
                    <Spin />
                  </div>
                )}
              </List>
            </InfiniteScroll>
          </div>
        )}
      </AutoSizer>
    );
  }
}

export default InfiniteList ;
