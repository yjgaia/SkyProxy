require('./UJS-NODE.js');

global.SkyProxy = METHOD({
	
	run : function(handler) {
		'use strict';
		
		var
		//IMPORT: fs
		fs = require('fs'),
	
		//IMPORT: http
		http = require('http'),
	
		//IMPORT: https
		https = require('https'),
	
		//IMPORT: http-proxy
		httpProxy = require('http-proxy'),
	
		//IMPORT: tls
		tls = require('tls'),
		
		// 404 page
		_404Page = READ_FILE({
			path : '404.html',
			isSync : true
		}).toString(),
		
		// ready page
		readyPage = READ_FILE({
			path : 'ready.html',
			isSync : true
		}).toString(),
	
		// proxys
		proxys = {},
	
		// secue proxys
		secureProxys = {},
		
		// secure context
		secureContext = {},
	
		// redirect port
		redirectPort = 10001,
	
		// ready port
		readyPort = 10000,
	
		// route.
		route,
	
		// redirect.
		redirect,
		
		// redirect by language.
		redirectByLanguage,
	
		// ready.
		ready,
	
		// sroute.
		sroute;
	
		route = function(domain, port) {
			
			proxys[domain] = {
				server : httpProxy.createProxyServer({
					target : 'http://' + domain,
					xfwd : true
				}),
				port : port
			};
		};
	
		redirect = function(domain, to) {
	
			http.createServer(function(req, res) {
				res.writeHead(302, {
					'Location' : to
				});
				res.end();
			}).listen(redirectPort);
	
			route(domain, redirectPort);
	
			redirectPort += 1;
		};
		
		redirectByLanguage = function(domain, toByLanguage) {
	
			http.createServer(function(req, res) {
				
				var
				// accept language
				acceptLanguage = req.headers['accept-language'];
				
				if (acceptLanguage !== undefined && EACH(toByLanguage, function(to, language) {
					
					if (acceptLanguage.indexOf(language) === 0) {
						res.writeHead(302, {
							'Location' : to
						});
					}
					
				}) === false) {
				
					res.writeHead(302, {
						'Location' : toByLanguage.en
					});
				}
				
				res.end();
				
			}).listen(redirectPort);
	
			route(domain, redirectPort);
	
			redirectPort += 1;
		};
	
		http.createServer(function(req, res) {
			res.writeHead(200, {
				'Content-Type' : 'text/html'
			});
			res.end(readyPage, 'utf-8');
		}).listen(readyPort);
	
		ready = function(domain) {
			route(domain, readyPort);
		};
	
		sroute = function(domain, port, key, cert) {
			
			secureProxys[domain] = {
				server : httpProxy.createProxyServer({
					target : 'https://' + domain,
					xfwd : true
				}),
				ssl : {
					key : fs.readFileSync(key),
					cert : fs.readFileSync(cert)
				},
				port : port
			};
			
			secureContext[domain] = tls.createSecureContext({
				key : fs.readFileSync(key),
				cert : fs.readFileSync(cert)
			}).context;
		};
		
		http.createServer(function(req, res) {
	
			var
			// proxy
			proxy = proxys[req.headers.host];
	
			if (proxy !== undefined) {
	
				proxy.server.web(req, res, {
					target : 'http://localhost:' + proxy.port
				}, function(e) {
					console.log(e);
				});
	
			} else {
				res.end(_404Page, 'utf-8');
			}
	
		}).listen(80);
	
		https.createServer({
			SNICallback : function(domain, callback) {
				callback(null, secureContext[domain]);
			}
		}, function(req, res) {
	
			var
			// proxy
			proxy = secureProxys[req.headers.host];
	
			if (proxy !== undefined) {
				
				proxy.server.web(req, res, {
					target : 'http://localhost:' + proxy.port
				}, function(e) {
					console.log(e);
				});
	
			} else {
				res.end(_404Page, 'utf-8');
			}
	
		}).listen(443);
		
		handler(route, redirect, redirectByLanguage, ready, sroute);
		
		console.log('Started SkyProxy!');
	}
});
