require('./SkyProxy.js');

CPU_CLUSTERING(() => {
	
	SkyProxy((route, redirect, redirectByLanguage, ready, sroute) => {
		
		// rout samples
		route('a.site.com', 8888);
		route('b.site.com', 8889);
		
		// redirect sample
		redirect('c.site.com', 'http://b.site.com');
		
		// redirectByLanguage sample
		redirectByLanguage('site.com', {
			en : 'http://en.site.com',
			ko : 'http://ko.site.com'
		});
		
		// ready sample
		ready('ready.site.com');
		
		// sroute sample
		sroute('secure.site.com', 8887, '/home/site/privkey.pem', '/home/site/cert.pem');
	});
});