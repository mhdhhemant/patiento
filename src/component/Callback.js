import React from 'react';
import Loader from './/Loader'
import { Row, Col } from 'antd'

export default function CallbackComponent(props){
  return (
    <Row className="uk-width-1-1 uk-height-1-1" type="flex" justify="center" align="middle">
      <Col span={24} style={{display:'flex'}} className="uk=flex uk-flex-center">
        <Loader loading={props.loading} />
      </Col>
    </Row>
  )
}
