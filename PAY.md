# The CZ QR Payment app

- code: [docs/pay](docs/pay)
- app: [pexmor.github.io/qr-io/pay](https://pexmor.github.io/qr-io/pay)

The purpose of this app is to enable shring payment information via QRs.

Refs:

- <https://github.com/tajnymag/spayd-js>
- <https://www.npmjs.com/package/@spayd/core>

## MQTT notification

```bash
# send message to the web app to default port with debug enabled
mosquitto_pub -h broker.emqx.io -p 8883 -t /pexmor/qrpay/1234 -m '{"test":"me"}' -d
```