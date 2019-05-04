import React from 'react'
import { FadeLoader } from 'react-spinners';

export default function Loader(props){
  return (
    <FadeLoader
     sizeUnit={"px"}
     size={200}
     color={'#123abc'}
     loading={props.loading}
   />
  )
}
