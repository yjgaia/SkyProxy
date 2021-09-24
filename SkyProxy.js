require('uppercase-core');

global.SkyProxy = METHOD({

    run: (handler) => {

        let FS = require('fs');
        let HTTP = require('http');
        let HTTPS = require('https');
        let TLS = require('tls');
        let HTTPProxy = require('http-proxy');

        let _404Page = READ_FILE({
            path: '404.html',
            isSync: true
        }).toString();

        let readyPage = READ_FILE({
            path: 'ready.html',
            isSync: true
        }).toString();

        let proxys = {};
        let secureProxys = {};

        let secureContext = {};

        let redirectPort = 10001;
        let readyPort = 10000;

        let route = (domain, port) => {

            proxys[domain] = {
                server: HTTPProxy.createProxyServer({
                    target: 'http://' + domain,
                    xfwd: true
                }),
                webSocketServer: HTTPProxy.createProxyServer({
                    target: 'ws://' + domain,
                    xfwd: true,
                    ws: true
                }),
                port: port
            };
        };

        let redirect = (domain, to) => {

            HTTP.createServer((req, res) => {
                res.writeHead(302, {
                    'Location': to
                });
                res.end();
            }).listen(redirectPort);

            route(domain, redirectPort);

            redirectPort += 1;
        };

        let redirectByLanguage = (domain, toByLanguage) => {

            HTTP.createServer((req, res) => {

                let acceptLanguage = req.headers['accept-language'];

                if (acceptLanguage !== undefined && EACH(toByLanguage, (to, language) => {

                        if (acceptLanguage.indexOf(language) === 0) {
                            res.writeHead(302, {
                                'Location': to
                            });
                        }

                    }) === false) {

                    res.writeHead(302, {
                        'Location': toByLanguage.en
                    });
                }

                res.end();

            }).listen(redirectPort);

            route(domain, redirectPort);

            redirectPort += 1;
        };

        let redirectByOS = (domain, toByOS) => {

            HTTP.createServer((req, res) => {

                let userAgent = req.headers['user-agent'];

                let to;
                if (userAgent !== undefined) {
                    if (/like Mac OS X/.test(userAgent) === true || /(Intel|PPC) Mac OS X/.test(userAgent) === true) {
                        to = toByOS.ios;
                    } else {
                        to = toByOS.android;
                    }
                }

                if (to === undefined) {
                    EACH(toByOS, (_to) => {
                        to = _to;
                        return false;
                    });
                }

                res.writeHead(302, {
                    'Location': to
                });

                res.end();

            }).listen(redirectPort);

            route(domain, redirectPort);

            redirectPort += 1;
        };

        HTTP.createServer((req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.end(readyPage, 'utf-8');
        }).listen(readyPort);

        let ready = (domain) => {
            route(domain, readyPort);
        };

        let sroute = (domain, port, key, cert, toSSL) => {

            let register = () => {

                secureProxys[domain] = {
                    server: HTTPProxy.createProxyServer({
                        target: 'https://' + domain,
                        xfwd: true
                    }),
                    webSocketServer: HTTPProxy.createProxyServer({
                        target: 'wss://' + domain,
                        xfwd: true,
                        ws: true
                    }),
                    ssl: {
                        key: FS.readFileSync(key),
                        cert: FS.readFileSync(cert)
                    },
                    port: port,
                    toSSL: toSSL
                };

                secureContext[domain] = TLS.createSecureContext({
                    key: FS.readFileSync(key),
                    cert: FS.readFileSync(cert)
                }).context;
            };

            register();

            // 매일 새로 불러옴
            INTERVAL(86400, () => {
                console.log(CONSOLE_YELLOW(key + '파일 및 ' + cert + '파일을 새로 새로 불러옵니다.'));
                register();
            });

            HTTP.createServer((req, res) => {
                res.writeHead(302, {
                    'Location': 'https://' + domain + req.url
                });
                res.end();
            }).listen(redirectPort);

            route(domain, redirectPort);

            redirectPort += 1;
        };

        let httpServer = HTTP.createServer((req, res) => {

            let proxy = proxys[req.headers.host];

            if (proxy !== undefined) {

                proxy.server.web(req, res, {
                    target: 'http://localhost:' + proxy.port
                }, (e) => {
                    console.log(e);
                    res.writeHead(500);
                    res.end();
                });

            } else {
                res.writeHead(404);
                res.end(_404Page, 'utf-8');
            }
        });

        httpServer.on('upgrade', (req, socket, head) => {

            let proxy = proxys[req.headers.host];

            if (proxy !== undefined) {
                proxy.webSocketServer.ws(req, socket, head, {
                    target: 'ws://localhost:' + proxy.port
                }, (e) => {
                    console.log(e);
                });
            }
        });

        httpServer.listen(80);

        let httpsServer = HTTPS.createServer({
            SNICallback: (domain, callback) => {
                callback(null, secureContext[domain]);
            }
        }, (req, res) => {

            let proxy = secureProxys[req.headers.host];

            if (proxy !== undefined) {

                proxy.server.web(req, res, {
                    target: (proxy.toSSL === true ? 'https://localhost:' : 'http://localhost:') + proxy.port
                }, (e) => {
                    console.log(e);
                    res.writeHead(500);
                    res.end();
                });

            } else {
                res.writeHead(404);
                res.end(_404Page, 'utf-8');
            }
        });

        httpsServer.on('upgrade', (req, socket, head) => {

            let proxy = secureProxys[req.headers.host];

            if (proxy !== undefined) {
                proxy.webSocketServer.ws(req, socket, head, {
                    target: (proxy.toSSL === true ? 'wss://localhost:' : 'ws://localhost:') + proxy.port
                }, (e) => {
                    console.log(e);
                });
            }
        });

        httpsServer.listen(443);

        handler(route, redirect, redirectByLanguage, redirectByOS, ready, sroute);

        console.log(CONSOLE_GREEN('SkyProxy가 실행되었습니다.'));
    }
});