import moment from 'moment'

export function firstCharCapital(string){
   return string.substring(0, 1).toUpperCase()+string.substring(1,string.length)
}

export function formatPatientDate(date){
  // if join date is today only show the time
   if(moment(moment(date).format("L")).diff(moment(), 'days') === 0){
     return moment(date).format("LT")
   }
  return  moment(date).format("DD/MM/YYYY")
}
export function formatNumber(string){
  const number =  Number.parseFloat(string).toFixed(2)
  return isNaN(number) ? 0 : Number.parseFloat(number)
}
