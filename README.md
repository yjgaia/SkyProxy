# ProxyServer
한 서버에서 여러 도메인을 사용하고자 할때 필요한 프록시 서버입니다.

## 설치
1. [UPPERCASE](https://github.com/Hanul/UPPERCASE)가 설치되어 있어야 합니다.
2. `ProxyServer` 폴더 자체를 서버에 복사합니다.
3. `RunProxyServer.js`을 원하는 대로 수정합니다.
4. `forever` 등으로 실행합니다.

```
forever start RunProxyServer.js
```

## RunProxyServer.js 수정하기
`RunProxyServer.js`의 기본 형태는 다음과 같습니다.
```javascript
require('./ProxyServer.js');

// 멀티코어 사용
CPU_CLUSTERING(function() {
	'use strict';
	
	ProxyServer(function(route, redirect, redirectByLanguage, ready, sroute) {
		...
	});
});
```
제공되는 함수는 다음과 같습니다.

### route
```
route('a.site.com', 8888);
route('b.site.com', 8889);
```

### redirect
```
redirect('c.site.com', 'http://b.site.com');
```

### redirectByLanguage
```
redirectByLanguage('site.com', {
	en : 'http://en.site.com',
	ko : 'http://ko.site.com'
});
```

### ready
```
ready('ready.site.com');
```

### sroute
`https` 프로토콜을 사용하는 경우에 사용합니다.
```
sroute('secure.site.com', 8887, '/home/site/privkey.pem', '/home/site/cert.pem');
// http://secure.site.com to https://secure.site.com
redirect('secure.site.com', 'https://secure.site.com');
```

## 404.html
접속한 주소의 리소스를 찾을 수 없는 경우 제공되는 페이지입니다.

## ready.html
`ready`함수로 지정한 도메인에 접속 시 제공되는 준비중 페이지입니다.

## 라이센스
[MIT](LICENSE)

## 작성자
[Young Jae Sim](https://github.com/Hanul)