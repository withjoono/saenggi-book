import axios from 'axios';
axios.get('https://ts-back-nest-479305.du.r.appspot.com/univ-dept/universities')
  .then(res => console.log(JSON.stringify(res.data).substring(0, 1000)))
  .catch(err => console.error(err.message));
