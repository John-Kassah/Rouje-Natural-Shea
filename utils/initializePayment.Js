import https from 'https';

export const initializePayment = async (req, res) => {
  const { email, amount } = req.body;

  const params = JSON.stringify({
    email,
    amount : amount * 100  // Paystack expects amount in 
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
  }
  }


const options = {
  hostname: 'api.paystack.co',
  port: 443,
  path: '/transaction/initialize',
  method: 'POST',
  headers: {
    Authorization: 'Bearer SECRET_KEY',
    'Content-Type': 'application/json'
  }
}

const req = https.request(options, res => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  });

  res.on('end', () => {
    console.log(JSON.parse(data))
  })
}).on('error', error => {
  console.error(error)
})

req.write(params)
req.end()