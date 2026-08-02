const axios = require('axios');
const FormData = require('form-data');

const instance = axios.create({ headers: { 'Content-Type': 'application/json' } });
const formData = new FormData();
formData.append('test', '123');
instance.post('http://httpbin.org/post', formData, {
  headers: { 'Content-Type': false }
}).then(res => {
  console.log(res.data.headers['Content-Type']);
}).catch(console.error);
