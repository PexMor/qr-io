# qr-io

Minimal app for reproducing and sharing QR codes.

```bash
# create endpoint and show url
ngrok http 8080
# make config QR from that url
qrencode -t UTF-8 '{"mode":"auto-send","url":"https://<use-url-from-above>.ngrok.io"}'
```

## Receiving sever

```bash
# create endpoint and show url
ngrok http 8080
# install deps
yarn
# start server at port 8080 it will read the ngrok info automatically
yarn server
# open http://localhost:8080
# it will show config url (a json inside QR)
# read it by https://pexmor.github.io/qr-io/ -> button "config"
# after that every scanned QR is sent over to http://localhost:8080 page
```

## Sub-licenses

| Part              | Link                                         | License                                                                        |
| ----------------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| PureCSS           | <http://purecss.io/>                         | [BSD](https://github.com/pure-css/pure/blob/master/LICENSE)                    |
| HTML5 QR Scanner  | <https://github.com/mebjas/html5-qrcode>     | [Apache-2.0](https://github.com/mebjas/html5-qrcode/blob/master/LICENSE)       |
| QR Code generator | <https://github.com/danielgjackson/qrcodejs> | [BSD-2-clause](https://github.com/danielgjackson/qrcodejs/blob/master/LICENSE) |
