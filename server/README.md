# M-Pesa Integration for Domestic Connect

## 🎯 **Overview**
This server handles real M-Pesa API integration for Domestic Connect, replacing the simulation with actual Safaricom Daraja API calls.

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
cd server
npm install
```

### **2. Configure Environment Variables**
Copy `env.example` to `.env` and fill in your M-Pesa credentials:
```bash
cp env.example .env
```

Edit `.env` with your actual M-Pesa API credentials:
```env
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_PASSKEY=your_passkey_here
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback
PORT=3001
```

### **3. Start the Server**
```bash
npm start
# or for development
npm run dev
```

## 🔧 **API Endpoints**

### **STK Push**
- **URL**: `POST /api/mpesa/stkpush`
- **Purpose**: Initiate M-Pesa STK Push payment
- **Body**:
  ```json
  {
    "phoneNumber": "254700000000",
    "amount": 1500,
    "reference": "DC_USER_123_1234567890",
    "description": "Premium Package - Demo Agency"
  }
  ```

### **Transaction Status**
- **URL**: `POST /api/mpesa/transaction-status`
- **Purpose**: Check payment status
- **Body**:
  ```json
  {
    "checkoutRequestId": "ws_CO_1234567890"
  }
  ```

### **Callback Webhook**
- **URL**: `POST /api/mpesa/callback`
- **Purpose**: Receive payment confirmations from M-Pesa

### **Health Check**
- **URL**: `GET /api/health`
- **Purpose**: Check server status

## 🔑 **Getting M-Pesa API Credentials**

### **1. Register on Safaricom Developer Portal**
- Go to [https://developer.safaricom.co.ke/](https://developer.safaricom.co.ke/)
- Create an account and log in

### **2. Create an App**
- Navigate to "My Apps"
- Click "Create App"
- Fill in app details
- Select "M-Pesa" as the API

### **3. Get Credentials**
- **Consumer Key**: Found in your app dashboard
- **Consumer Secret**: Found in your app dashboard
- **Passkey**: Generated when you create the app
- **Business Short Code**: Your M-Pesa till number (174379 for sandbox)

### **4. Environment**
- **Sandbox**: For testing (free)
- **Production**: For live payments (requires approval)

## 🧪 **Testing**

### **Sandbox Testing**
- Use test phone numbers: 254708374149, 254708374150, etc.
- Test amounts: Any amount (no real money)
- Test PIN: 1234

### **Production Testing**
- Use real phone numbers
- Real money transactions
- Real M-Pesa PIN

## 🔒 **Security Considerations**

### **Environment Variables**
- Never commit `.env` file to version control
- Use different credentials for sandbox and production
- Rotate credentials regularly

### **Webhook Security**
- Implement webhook signature verification
- Use HTTPS for production callbacks
- Validate all incoming data

### **Error Handling**
- Log all API errors
- Implement retry logic for failed requests
- Monitor payment success rates

## 📱 **Frontend Integration**

The frontend has been updated to use the real M-Pesa API:

```typescript
// Real M-Pesa STK Push
const response = await fetch('http://localhost:3001/api/mpesa/stkpush', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: phoneNumber,
    amount: packageDetails.price,
    reference: `DC_${user?.id}_${Date.now()}`,
    description: `${packageDetails.name} Package - ${agency.name}`
  }),
});
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Invalid credentials"**
   - Check your Consumer Key and Secret
   - Ensure you're using the correct environment

2. **"Invalid phone number"**
   - Format: 254700000000 (no spaces or dashes)
   - Must be a registered M-Pesa number

3. **"Business short code not found"**
   - Use 174379 for sandbox
   - Use your actual till number for production

4. **"Callback URL not accessible"**
   - Use ngrok for local development
   - Ensure HTTPS for production

### **Debug Mode**
Enable debug logging by setting:
```env
DEBUG=true
```

## 📞 **Support**

For M-Pesa API issues:
- Safaricom Developer Portal: [https://developer.safaricom.co.ke/](https://developer.safaricom.co.ke/)
- M-Pesa API Documentation: [https://developer.safaricom.co.ke/docs](https://developer.safaricom.co.ke/docs)

For Domestic Connect integration issues:
- Check the server logs
- Verify environment variables
- Test with sandbox credentials first
