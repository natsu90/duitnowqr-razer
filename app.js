
require('dotenv').config()

const express = require('express')
const formidable = require('express-formidable')
const { generateDuitNowStr } = require('duitnow-js')
const { randomUUID, createHash } = require('crypto')
const QRCode = require('easyqrcodejs-nodejs')

const app = express()
const port = 3001
let clients = [];

app.use(formidable())
app.engine('html', require('ejs').renderFile)

// Home page
app.get('/', (req, res) => {

    const refid = randomUUID()

    newClient = {
      id: refid
    }
    clients.push(newClient)

    res.render(__dirname + '/index.html', {refid: refid})
})

// DuitNow QR Image
app.get('/qr/:refid', async (req, res) => {

  const refid = req.params.refid
  const qrString = generateDuitNowStr({
    app: process.env.DUITNOW_VENDOR,
    account: process.env.DUITNOW_ACCOUNT,
    category: process.env.DUITNOW_MERCHANT_CATEGORY,
    ref5: refid,
    ref6: process.env.DUITNOW_MERCHANT_NAME, // display in Razer report in Bill Name column
    ref82: process.env.DUITNOW_REF82,
    name: process.env.DUITNOW_MERCHANT_NAME // display in Bank statement
  })
  
  const qrCode = new QRCode({
    text: qrString,
    width: 512,
    height: 512,
    colorDark : '#FF076Aff',
    colorLight : '#FFFFFF',
    correctLevel : QRCode.CorrectLevel.H,
    quietZone: 12,
    quietZoneColor: '#FFFFFF',
    logo: './images/duitnow-logo.png',
    logoWidth: 69,
    logoHeight: 75,
    logoBackgroundColor: '#FFFFFF'
  })

  qrCode.toDataURL().then((base64data) => {
    base64data = base64data.replace(/^data:image\/png;base64,/, '')
    img = Buffer.from(base64data, 'base64')
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img)
  })
})

// Server-Sent Events
app.get('/sse/:refid', (req, res) => {
  const refid = req.params.refid

  console.log(`${refid} Connection opened`)

  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'X-Accel-Buffering': 'no'
  }
  res.writeHead(200, headers)

  const data = `id: ${refid}\n\n`;
  res.write(data);

  // save Response object to use later
  const clientIndex = clients.findIndex(client => client.id == refid)
  if (clientIndex >= 0)
    clients[clientIndex].response = res

  req.on('close', () => {
    console.log(`${refid} Connection closed`)
    
    clients = clients.filter(client => client.id !== refid)
  })
})

// Razer Callback URL
app.post('/ipn', (req, res) => {

  console.log(req.fields)

  // validate signature
  const preSkey = createHash('md5').update(req.fields.tranID + req.fields.orderid + req.fields.status + req.fields.domain + req.fields.amount + req.fields.currency).digest('hex')
  const sKey = createHash('md5').update(req.fields.paydate + req.fields.domain + preSkey + req.fields.appcode + process.env.RAZER_SECRET_KEY).digest('hex')

  if (sKey !== req.fields.skey)
    return res.status(400).send('Bad Request')

  const refid = req.fields.orderid
  const clientIndex = clients.findIndex(client => client.id == refid)
  if (clientIndex < 0) return res.send('OK')

  // build notification message
  let message;
  if (req.fields.error_desc) {
    message = req.fields.error_desc
  } else {
    extraFields = JSON.parse(req.fields.extraP)
    message = 'Received '+ req.fields.currency + req.fields.amount + ' via ' + extraFields.bank_issuer
  }

  // push message to SSE client
  clients[clientIndex].response.write(`data: ${message}\n\n`)
  
  res.send('OK')
})

// Start server
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})