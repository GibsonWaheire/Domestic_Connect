const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// M-Pesa Configuration
const MPESA_CONFIG = {
  CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY || 'your_consumer_key',
  CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET || 'your_consumer_secret',
  PASSKEY: process.env.MPESA_PASSKEY || 'your_passkey',
  BUSINESS_SHORT_CODE: process.env.MPESA_BUSINESS_SHORT_CODE || '174379',
  ENVIRONMENT: process.env.MPESA_ENVIRONMENT || 'sandbox', // sandbox or production
  CALLBACK_URL: process.env.MPESA_CALLBACK_URL || 'https://your-domain.com/api/mpesa/callback'
};

// M-Pesa API URLs
const MPESA_URLS = {
  sandbox: {
    auth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stkPush: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    transactionStatus: 'https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query'
  },
  production: {
    auth: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stkPush: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    transactionStatus: 'https://api.safaricom.co.ke/mpesa/transactionstatus/v1/query'
  }
};

// Get access token
async function getAccessToken() {
  try {
    const auth = Buffer.from(`${MPESA_CONFIG.CONSUMER_KEY}:${MPESA_CONFIG.CONSUMER_SECRET}`).toString('base64');
    const response = await axios.get(MPESA_URLS[MPESA_CONFIG.ENVIRONMENT].auth, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// Generate timestamp
function getTimestamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}${second}`;
}

// Generate password
function generatePassword() {
  const timestamp = getTimestamp();
  const password = Buffer.from(`${MPESA_CONFIG.BUSINESS_SHORT_CODE}${MPESA_CONFIG.PASSKEY}${timestamp}`).toString('base64');
  return password;
}

// STK Push endpoint
app.post('/api/mpesa/stkpush', async (req, res) => {
  try {
    const { phoneNumber, amount, reference, description } = req.body;

    // Validate input
    if (!phoneNumber || !amount || !reference) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: phoneNumber, amount, reference'
      });
    }

    // Format phone number
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('254')) {
      formattedPhone = formattedPhone;
    } else if (formattedPhone.startsWith('7')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Prepare STK Push request
    const timestamp = getTimestamp();
    const password = generatePassword();

    const stkPushData = {
      BusinessShortCode: MPESA_CONFIG.BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.BUSINESS_SHORT_CODE,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.CALLBACK_URL,
      AccountReference: reference,
      TransactionDesc: description || 'Domestic Connect Payment'
    };

    // Make STK Push request
    const response = await axios.post(MPESA_URLS[MPESA_CONFIG.ENVIRONMENT].stkPush, stkPushData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const result = response.data;

    if (result.ResponseCode === '0') {
      res.json({
        success: true,
        message: 'STK Push sent successfully',
        data: {
          CheckoutRequestID: result.CheckoutRequestID,
          MerchantRequestID: result.MerchantRequestID,
          ResponseCode: result.ResponseCode,
          ResponseDescription: result.ResponseDescription,
          CustomerMessage: result.CustomerMessage
        }
      });
    } else {
      res.json({
        success: false,
        message: 'STK Push failed',
        data: result
      });
    }

  } catch (error) {
    console.error('STK Push error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Transaction status endpoint
app.post('/api/mpesa/transaction-status', async (req, res) => {
  try {
    const { checkoutRequestId } = req.body;

    if (!checkoutRequestId) {
      return res.status(400).json({
        success: false,
        message: 'Missing checkoutRequestId'
      });
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Prepare transaction status request
    const timestamp = getTimestamp();
    const password = generatePassword();

    const statusData = {
      BusinessShortCode: MPESA_CONFIG.BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    // Make transaction status request
    const response = await axios.post(MPESA_URLS[MPESA_CONFIG.ENVIRONMENT].transactionStatus, statusData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const result = response.data;

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Transaction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Callback endpoint for M-Pesa webhooks
app.post('/api/mpesa/callback', (req, res) => {
  try {
    const callbackData = req.body;
    console.log('M-Pesa Callback:', callbackData);

    // Process the callback data
    if (callbackData.ResultCode === '0') {
      // Payment successful
      console.log('Payment successful:', callbackData);
      // Here you would update your database with the payment confirmation
    } else {
      // Payment failed
      console.log('Payment failed:', callbackData);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ success: false });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'M-Pesa API server is running',
    environment: MPESA_CONFIG.ENVIRONMENT,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`M-Pesa API server running on port ${PORT}`);
  console.log(`Environment: ${MPESA_CONFIG.ENVIRONMENT}`);
  console.log(`Business Short Code: ${MPESA_CONFIG.BUSINESS_SHORT_CODE}`);
});
