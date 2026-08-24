const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/orders?customer=6a8c35b762ecdc34ef4d0e7f',
  method: 'GET'
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});

req.on('error', error => console.error(error));
req.end();
