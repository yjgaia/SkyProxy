# SkyProxy
한 서버에서 여러 도메인을 사용하고자 할때 필요한 프록시 서버입니다.

## 설치
1. `SkyProxy` 프로젝트를 서버에 복사합니다. `Git`을 이용하면 간편하게 복사할 수 있습니다.
    ```
    git clone https://github.com/Hanul/SkyProxy.git
    ```
2. `RunSkyProxy.js`을 원하는 대로 수정합니다.
3. [`forever`](https://www.npmjs.com/package/forever) 등으로 실행합니다.
    ```
    forever start RunSkyProxy.js
    ```

## RunSkyProxy.js 수정하기
`RunSkyProxy.js`의 기본 형태는 다음과 같습니다.
```javascript
require('./SkyProxy.js');

CPU_CLUSTERING(() => {
	
	SkyProxy((route, redirect, redirectByLanguage, redirectByOS, ready, sroute) => {
		
		// 이곳에 필요한 내용을 작성합니다.
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
접속한 클라이언트의 언어별로 리다이렉트 경로를 다르게 지정할 수 있습니다.
```
redirectByLanguage('site.com', {
	en : 'http://en.site.com',
	ko : 'http://ko.site.com'
});
```

### redirectByOS
접속한 클라이언트의 운영체제별로 리다이렉트 경로를 다르게 지정할 수 있습니다.
```
redirectByOS('site.com', {
	ios : 'http://ios.site.com',
	android : 'http://android.site.com'
});
```

### ready
준비중 페이지를 표시합니다.
```
ready('ready.site.com');
```

### sroute
HTTPS 프로토콜을 사용하는 경우에 사용합니다.
```
sroute('secure.site.com', 8887, '/home/site/privkey.pem', '/home/site/cert.pem');
```

## 404.html
접속한 주소의 리소스를 찾을 수 없는 경우 제공되는 페이지입니다. 수정해서 사용하시기 바랍니다.

## ready.html
`ready`함수로 지정한 도메인에 접속 시 제공되는 준비중 페이지입니다. 수정해서 사용하시기 바랍니다.

## 라이센스
[MIT](LICENSE)

## 작성자
[Young Jae Sim](https://github.com/Hanul)