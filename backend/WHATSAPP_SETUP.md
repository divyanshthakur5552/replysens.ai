# WhatsApp Cloud API Integration Setup

## Overview
This integration connects your SaaS AI Booking Bot with WhatsApp Cloud API (Meta Official API) to handle customer messages via WhatsApp.

## Prerequisites
1. Facebook Business Account
2. WhatsApp Business Account
3. Meta Developer Account
4. Phone number for WhatsApp Business

## Setup Steps

### 1. Meta Developer Setup
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add "WhatsApp" product to your app
4. Get your access token and phone number ID

### 2. Environment Variables
Add these to your `.env` file:

```env
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_VERIFY_TOKEN=your_custom_webhook_verify_token_here
```

**Important:** 
- Use a permanent access token, not the temporary one
- The verify token can be any string you choose
- Keep these tokens secure and never expose them in frontend code

### 3. Webhook Configuration
1. In Meta Developer Console, go to WhatsApp > Configuration
2. Set webhook URL: `https://yourdomain.com/webhook`
3. Set verify token: same as `WHATSAPP_VERIFY_TOKEN` in your .env
4. Subscribe to `messages` webhook field

### 4. Phone Number Setup
1. Add your phone number to WhatsApp Business API
2. Verify the phone number
3. Note the Phone Number ID for your .env file

## API Endpoints

### Webhook Endpoints
- `GET /webhook` - Webhook verification
- `POST /webhook` - Receive WhatsApp messages

### Integration Management
- `POST /whatsapp-integration` - Create integration for business
- `GET /whatsapp-integration` - Get current integration
- `PATCH /whatsapp-integration/:id` - Update integration status
- `DELETE /whatsapp-integration/:id` - Delete integration

## Testing

### 1. Run WhatsApp Tests
```bash
npm run test-whatsapp
```

### 2. Test Webhook Verification
```bash
curl "http://localhost:8000/webhook?hub.mode=subscribe&hub.verify_token=your_verify_token&hub.challenge=test123"
```

### 3. Test Message Processing
Send a POST request to `/webhook` with WhatsApp message format.

## Multi-Tenant Architecture

### Business Mapping
Each WhatsApp phone number is mapped to a business via the `WhatsAppIntegration` model:

```javascript
{
  businessId: ObjectId,
  phoneNumberId: String,
  status: "active" | "inactive" | "pending",
  createdAt: Date,
  updatedAt: Date
}
```

### Message Flow
1. WhatsApp message received at `/webhook`
2. Extract sender phone number and message text
3. Look up business ID using phone number mapping
4. Load business context from Redis
5. Process message through existing AI chat engine
6. Send reply back via WhatsApp API

## Security Considerations

1. **Token Security**: Never expose access tokens in frontend code
2. **Webhook Verification**: Always verify webhook requests using verify token
3. **Rate Limiting**: Implement rate limiting for webhook endpoints
4. **Input Validation**: Validate all incoming message data
5. **Error Handling**: Don't expose internal errors to users

## Error Handling

The integration includes comprehensive error handling:
- Malformed webhook payloads are logged and ignored
- Failed message sending is retried with exponential backoff
- Server errors don't crash the application
- Users receive friendly error messages

## Monitoring

Key metrics to monitor:
- Webhook verification success rate
- Message processing success rate
- WhatsApp API response times
- Error rates and types

## Troubleshooting

### Common Issues

1. **Webhook Verification Fails**
   - Check verify token matches exactly
   - Ensure webhook URL is accessible
   - Verify HTTPS is working

2. **Messages Not Received**
   - Check webhook subscription in Meta console
   - Verify phone number is properly configured
   - Check server logs for errors

3. **Messages Not Sent**
   - Verify access token is valid and permanent
   - Check phone number ID is correct
   - Ensure recipient has opted in to receive messages

4. **Business Context Not Found**
   - Ensure business context is loaded via `/context/load`
   - Check Redis connection
   - Verify business ID mapping

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages and debug logs.

## Production Deployment

1. Use permanent access tokens
2. Set up proper SSL/HTTPS
3. Configure webhook URL with your domain
4. Set up monitoring and alerting
5. Implement proper logging
6. Test thoroughly with real phone numbers

## Rate Limits

WhatsApp Cloud API has rate limits:
- 1000 messages per day (free tier)
- Higher limits available with paid plans
- Implement queuing for high-volume scenarios

## Next Steps

1. Test with real WhatsApp numbers
2. Set up proper business-to-phone number mapping
3. Implement message templates for common responses
4. Add support for media messages (images, documents)
5. Implement message status tracking
6. Add analytics and reporting