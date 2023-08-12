
## DuitNow QR Realtime Notification Demo

Proof of concept of Gintell Rest N Go massage chair transaction using DuitNow QR

![Massage Chair](/images/massage-chair.jpeg "Massage Chair")

### Demo

[http://duitnow.ss.my](http://duitnow.ss.my)

![Demo](/images/demo.png "Demo")

1. A unique order ID is assigned to the webpage each time it is loaded.

2. A DuitNow QR code is dynamically generated with the order ID imprinted.

3. The IPN webhook will try to catch any DuitNow payment that matched the order ID.

4. If there is any payment with the matched order ID, the webhook will pass a necesary message and trigger a popup to the opened webpage earlier.

### Prerequisites

1. SSM Company Registration Number
2. [Razer Merchant Account](https://booster.merchant.razer.com)

### Installation

1. `npm install`

2. `cp .env.example .env`

3. Fill up `.env`

```
DUITNOW_ACCOUNT=
DUITNOW_REF82=
RAZER_SECRET_KEY=
```

4. `npm run start`

5. Set Notification URL to `http://your-app-url/ipn`, and tick Enable Instant Payment Notification (IPN) checkbox in [Razer Merchant Portal](https://portal.merchant.razer.com) in Transactions > Settings

### Getting DUITNOW_ACCOUNT & DUITNOW_REF82 value

1. Login to [Razer Merchant Portal](https://portal.merchant.razer.com)

2. Go to Payment Link > Generate Static QR-Code

3. Fill up Channel (DuitNow QR Offline), Currency (MYR), & Order ID / Item ID (any value does not matter but keep it in mind), then click Generate Preview

4. Scan the generated QR code with a QR reader app

5. Paste the QR string into a notepad

6. Grab `DUITNOW_ACCOUNT` value between `0014A000000615000101068900870228` and `5204737253034585802MY` (in my case it is `0000000000000000000000091507`)

7. Grab `DUITNOW_REF82` value between your Order ID / Item ID value earlier + `8232` and last 8 characters (in my case it is `47FCECA2796DDB8C0D63753C1131BD85`)

![DuitNow Values](/images/duitnow-values.png "DuitNow Values")

### Limitations

1. Money is not credited directly to bank account

2. Minimum RM100 settlement

3. Transaction fee 0.85%

4. Annual fee RM99/year, waived 1st year

### License

Licensed under the [MIT license](http://opensource.org/licenses/MIT)


