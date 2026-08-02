const axios = require('axios');
const FormData = require('form-data'); // We need form-data package in Node, but let's just mock it or check axios behavior.

const instance = axios.create({ headers: { 'Content-Type': 'application/json' } });
const formData = new FormData();
formData.append('test', '123');
instance.post('http://httpbin.org/post', formData).then(res => {
  console.log(res.data.headers['Content-Type']);
}).catch(console.error);
