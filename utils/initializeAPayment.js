import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

export const initializePayment = async (req, res) => {
  const email = req.user.email;
  const { amount } = req.body;
  const positiveIntAmount = Number(amount);

  if (!Number.isInteger(positiveIntAmount) || positiveIntAmount <= 0) {
    return res.status(400).json({
      status: false,
      message: "Amount must be a positive integer (no decimals)."
    });
  }

  const params = JSON.stringify({
    email,
    amount: amount * 100  // Paystack expects amount in cedis
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  const httpRequest = https.request(options, httpResponse => {
    let data = '';

    httpResponse.on('data', (chunk) => {
      data += chunk;
    });

    httpResponse.on('end', () => {
      try {
        const paystackResponse = JSON.parse(data);

        // Send the actual Paystack response to the frontend
        res.status(200).json({access_code: paystackResponse.data.access_code});
      } catch (err) {
        res.status(500).json({ message: "Failed to parse Paystack response", error: err.message });
      }
    });
  });

  httpRequest.on('error', error => {
    res.status(500).json({ message: "Payment initialization failed", error: error.message });
  });

  httpRequest.write(params);
  httpRequest.end();
};




