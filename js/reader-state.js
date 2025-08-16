const KEY='inkwell.new.state.v1';
export function getState(){ try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return{}} }
export function save(next){ localStorage.setItem(KEY, JSON.stringify({...getState(), ...next})) }
export function isVertical(){ return !!getState().vertical }
export function setVertical(v){ save({vertical:!!v}) }
