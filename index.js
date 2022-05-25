/**
 *
 * Proxy server
 *
 * @param port - port of proxy app
 * @param host - root path of application
 * @param app  - appName = appPath (pair of changing apps)
 *
 */

const { createProxyMiddleware } = require('http-proxy-middleware')
const requestify = require('requestify')
const express = require('express')

const PATH = '/assets/config/apps-config.json'

let PORT = 3000
let HOST = undefined
let APPS = []

function handleArgs(processArgs) {
    processArgs = processArgs.slice(2).filter(x => x.includes('--'))

    PORT = processArgs.find((x) => x.includes('port'))?.split('=')?.[1] ?? PORT
    HOST = processArgs.find((x) => x.includes('host')).split('=')[1]
    APPS = processArgs.filter(x => !x.includes('host') && !x.includes('port')).map(x => x.split('=')).map(x => ({
        name: x[0].slice(2),
        path: x[1],
    }));
}

handleArgs(process.argv)

const app = express()
const proxyMiddleware = () => createProxyMiddleware({
    target: HOST,
    changeOrigin: true,
    ws: true,
})

app.get(PATH, (req, res) => {
    requestify.get(`${HOST}${PATH}`).then((response) => {
        const config = response.getBody()
        APPS.forEach(app => config.filter(c => c.name === app.name).forEach(x => x.path = app.path))
        res.send(config)
    })
})

app.use('/', proxyMiddleware())

const server = app.listen(PORT)
