LavaPack.loadBundle([[2605,{"./proxy/index.cjs":2607},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,s){var n=this&&this.__createBinding||(Object.create?function(e,t,s,n){n===undefined&&(n=s);var r=Object.getOwnPropertyDescriptor(t,s);r&&!("get"in r?!t.__esModule:r.writable||r.configurable)||(r={enumerable:!0,get:function(){return t[s]}}),Object.defineProperty(e,n,r)}:function(e,t,s,n){n===undefined&&(n=s),e[n]=t[s]}),r=this&&this.__exportStar||function(e,t){for(var s in e)"default"===s||Object.prototype.hasOwnProperty.call(t,s)||n(t,e,s)};Object.defineProperty(s,"__esModule",{value:!0}),r(e("./proxy/index.cjs"),s)}}},{package:"@metamask/snaps-execution-environments",file:"node_modules/@metamask/snaps-execution-environments/dist/index.cjs"}],[2606,{"@metamask/post-message-stream":2344,"@metamask/snaps-execution-environments/package.json":2608,"@metamask/snaps-utils":2777,"@metamask/utils":2874},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,s){var n,r,i,a,o,c,l=this&&this.__classPrivateFieldSet||function(e,t,s,n,r){if("m"===n)throw new TypeError("Private method is not writable");if("a"===n&&!r)throw new TypeError("Private accessor was defined without a setter");if("function"==typeof t?e!==t||!r:!t.has(e))throw new TypeError("Cannot write private member to an object whose class did not declare it");return"a"===n?r.call(e,s):r?r.value=s:t.set(e,s),s},u=this&&this.__classPrivateFieldGet||function(e,t,s,n){if("a"===s&&!n)throw new TypeError("Private accessor was defined without a getter");if("function"==typeof t?e!==t||!n:!t.has(e))throw new TypeError("Cannot read private member from an object whose class did not declare it");return"m"===s?n:"a"===s?n.call(e):n?n.value:t.get(e)},d=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(s,"__esModule",{value:!0}),s.ProxySnapExecutor=void 0;const m=e("@metamask/post-message-stream"),p=d(e("@metamask/snaps-execution-environments/package.json")),f=e("@metamask/snaps-utils"),g=e("@metamask/utils"),h=`https://execution.metamask.io/iframe/${p.default.version}/index.html`;class b{static initialize(e,t=h){return new b(e,t)}constructor(e,t){n.add(this),r.set(this,void 0),i.set(this,void 0),this.jobs={},l(this,r,e,"f"),u(this,r,"f").on("data",u(this,n,"m",a).bind(this)),l(this,i,t,"f")}}s.ProxySnapExecutor=b,r=new WeakMap,i=new WeakMap,n=new WeakSet,a=function e(t){const{jobId:s,data:r}=t;this.jobs[s]?"terminateJob"!==r.method?this.jobs[s].stream.write(r):u(this,n,"m",c).call(this,s):u(this,n,"m",o).call(this,s).then((()=>{u(this,n,"m",e).call(this,t)})).catch((e=>{(0,f.logError)("[Worker] Error initializing job:",e)}))},o=async function(e){const t=await(0,f.createWindow)({uri:u(this,i,"f"),id:e}),s=new m.WindowPostMessageStream({name:"parent",target:"child",targetWindow:t,targetOrigin:"*"});return s.on("data",(t=>{u(this,r,"f").write({data:t,jobId:e})})),this.jobs[e]={id:e,window:t,stream:s},this.jobs[e]},c=function(e){(0,g.assert)(this.jobs[e],`Job "${e}" not found.`);const t=document.getElementById(e);(0,g.assert)(t,`Iframe with ID "${e}" not found.`),t.remove(),this.jobs[e].stream.destroy(),delete this.jobs[e]}}}},{package:"@metamask/snaps-execution-environments",file:"node_modules/@metamask/snaps-execution-environments/dist/proxy/ProxySnapExecutor.cjs"}],[2607,{"./ProxySnapExecutor.cjs":2606},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,s){var n=this&&this.__createBinding||(Object.create?function(e,t,s,n){n===undefined&&(n=s);var r=Object.getOwnPropertyDescriptor(t,s);r&&!("get"in r?!t.__esModule:r.writable||r.configurable)||(r={enumerable:!0,get:function(){return t[s]}}),Object.defineProperty(e,n,r)}:function(e,t,s,n){n===undefined&&(n=s),e[n]=t[s]}),r=this&&this.__exportStar||function(e,t){for(var s in e)"default"===s||Object.prototype.hasOwnProperty.call(t,s)||n(t,e,s)};Object.defineProperty(s,"__esModule",{value:!0}),r(e("./ProxySnapExecutor.cjs"),s)}}},{package:"@metamask/snaps-execution-environments",file:"node_modules/@metamask/snaps-execution-environments/dist/proxy/index.cjs"}],[2608,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,s){t.exports={name:"@metamask/snaps-execution-environments",version:"7.0.0",description:"Snap sandbox environments for executing SES javascript",keywords:["MetaMask","Snaps","Ethereum"],homepage:"https://github.com/MetaMask/snaps/tree/main/packages/snaps-execution-environments#readme",bugs:{url:"https://github.com/MetaMask/snaps/issues"},repository:{type:"git",url:"https://github.com/MetaMask/snaps.git"},license:"SEE LICENSE IN LICENSE",sideEffects:!1,exports:{".":{import:{types:"./dist/index.d.mts",default:"./dist/index.mjs"},require:{types:"./dist/index.d.cts",default:"./dist/index.cjs"}},"./dist/browserify/node-process/bundle.js":"./dist/browserify/node-process/bundle.js","./dist/browserify/node-thread/bundle.js":"./dist/browserify/node-thread/bundle.js","./package.json":"./package.json"},main:"./dist/index.cjs",module:"./dist/index.mjs",types:"./dist/index.d.cts",files:["dist"],scripts:{"auto-changelog-init":"auto-changelog init",build:"ts-bridge --project tsconfig.build.json --verbose --clean --no-references","build:lavamoat":"lavamoat scripts/build.js --policy lavamoat/build-system/policy.json  --policyOverride lavamoat/build-system/policy-override.json","build:lavamoat:policy":"yarn build:lavamoat --writeAutoPolicy && node scripts/build.js --writeAutoPolicy","build:post":"yarn build:lavamoat","changelog:update":"../../scripts/update-changelog.sh @metamask/snaps-execution-environments","changelog:validate":"../../scripts/validate-changelog.sh @metamask/snaps-execution-environments",clean:"rimraf '*.tsbuildinfo' 'dist' 'src/__GENERATED__/' 'coverage/*' '__test__/*'",lint:"yarn lint:eslint && yarn lint:misc --check && yarn changelog:validate && yarn lint:dependencies","lint:ci":"yarn lint","lint:dependencies":"depcheck","lint:eslint":"eslint . --cache --ext js,ts,jsx,tsx","lint:fix":"yarn lint:eslint --fix && yarn lint:misc --write","lint:misc":'prettier --no-error-on-unmatched-pattern --loglevel warn "**/*.json" "**/*.md" "**/*.html" "!CHANGELOG.md" --ignore-path ./.prettierignore',"publish:preview":"yarn npm publish --tag preview","since-latest-release":"../../scripts/since-latest-release.sh",start:"node scripts/start.js",test:"jest --reporters=jest-silent-reporter && yarn test:browser","test:browser":"wdio run wdio.config.js","test:clean":"jest --clearCache","test:post":"ts-node scripts/coverage.ts && rimraf coverage/jest coverage/wdio","test:verbose":"jest --verbose","test:watch":"jest --watch"},dependencies:{"@metamask/json-rpc-engine":"^10.0.2","@metamask/object-multiplex":"^2.1.0","@metamask/post-message-stream":"^9.0.0","@metamask/providers":"^20.0.0","@metamask/rpc-errors":"^7.0.2","@metamask/snaps-sdk":"^6.18.0","@metamask/snaps-utils":"^9.0.0","@metamask/superstruct":"^3.1.0","@metamask/utils":"^11.2.0",nanoid:"^3.1.31","readable-stream":"^3.6.2"},devDependencies:{"@babel/core":"^7.23.2","@babel/preset-env":"^7.23.2","@babel/preset-typescript":"^7.23.2","@esbuild-plugins/node-globals-polyfill":"^0.2.3","@esbuild-plugins/node-modules-polyfill":"^0.2.2","@lavamoat/allow-scripts":"^3.0.4","@lavamoat/lavapack":"^6.1.1","@lavamoat/lavatube":"^1.0.0","@metamask/auto-changelog":"^3.4.4","@metamask/eslint-config":"^12.1.0","@metamask/eslint-config-jest":"^12.1.0","@metamask/eslint-config-nodejs":"^12.1.0","@metamask/eslint-config-typescript":"^12.1.0","@swc/core":"1.3.78","@swc/jest":"^0.2.26","@ts-bridge/cli":"^0.6.1","@types/express":"^4.17.17","@types/jest":"^27.5.1","@types/node":"18.14.2","@typescript-eslint/eslint-plugin":"^5.42.1","@typescript-eslint/parser":"^6.21.0","@wdio/browser-runner":"^8.19.0","@wdio/cli":"^8.19.0","@wdio/globals":"^8.19.0","@wdio/mocha-framework":"^8.19.0","@wdio/spec-reporter":"^8.19.0","@wdio/static-server-service":"^8.19.0","babel-plugin-tsconfig-paths-module-resolver":"^1.0.4",babelify:"^10.0.0",browserify:"^17.0.0",deepmerge:"^4.2.2",depcheck:"^1.4.7",esbuild:"^0.18.10",eslint:"^8.27.0","eslint-config-prettier":"^8.5.0","eslint-plugin-import":"^2.26.0","eslint-plugin-jest":"^27.1.5","eslint-plugin-jsdoc":"^41.1.2","eslint-plugin-n":"^15.7.0","eslint-plugin-prettier":"^4.2.1","eslint-plugin-promise":"^6.1.1","expect-webdriverio":"^4.4.1","istanbul-lib-coverage":"^3.2.0","istanbul-lib-report":"^3.0.0","istanbul-reports":"^3.1.5",jest:"^29.0.2","jest-environment-node":"^29.5.0","jest-fetch-mock":"^3.0.3","jest-silent-reporter":"^0.6.0",lavamoat:"^8.0.4","lavamoat-browserify":"^17.0.5",prettier:"^2.8.8","prettier-plugin-packagejson":"^2.5.2",rimraf:"^4.1.2","serve-handler":"^6.1.5",ses:"^1.1.0",terser:"^5.17.7","ts-node":"^10.9.1",typescript:"~5.3.3",vite:"^4.3.9","vite-tsconfig-paths":"^4.0.5","wdio-chromedriver-service":"^8.1.1","wdio-geckodriver-service":"^5.0.2",webdriverio:"^8.19.0",yargs:"^17.7.1"},engines:{node:"^18.16 || >=20"},publishConfig:{access:"public",registry:"https://registry.npmjs.org/"}}}}},{package:"@metamask/snaps-execution-environments",file:"node_modules/@metamask/snaps-execution-environments/package.json"}],[5634,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,s){function n(e,t,s){return(t=function(e){var t=function(e,t){if("object"!=typeof e||!e)return e;var s=e[Symbol.toPrimitive];if(void 0!==s){var n=s.call(e,t||"default");if("object"!=typeof n)return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:s,enumerable:!0,configurable:!0,writable:!0}):e[t]=s,e}Object.defineProperty(s,"__esModule",{value:!0}),s.CallbackProcessor=void 0;s.CallbackProcessor=class{constructor(){n(this,"currentMessageId",0),n(this,"messageCallbacks",new Map)}registerCallback(e){return this.currentMessageId+=1,this.messageCallbacks.set(this.currentMessageId,e),this.currentMessageId}processCallback(e){if(this.messageCallbacks.has(e.messageId)){const t=this.messageCallbacks.get(e.messageId);if(t)return this.messageCallbacks.delete(e.messageId),t(e)}return null}}}}},{package:"$root$",file:"offscreen/scripts/callback-processor.ts"}],[5635,{"../../shared/constants/offscreen-communication":5660},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,s){Object.defineProperty(s,"__esModule",{value:!0}),s.default=function(){chrome.runtime.onMessage.addListener(((e,t,s)=>{if(e.target===n.OffscreenCommunicationTarget.latticeOffscreen)return async function(e){const t=window.open(e);if(!t)throw new Error("Failed to open Lattice connector.");return t}(e.params.url).then((e=>{const t=setInterval((()=>{e.closed&&(clearInterval(t),s({error:new Error("Lattice connector closed.")}))}),500);window.addEventListener("message",(r=>{if(r.origin===n.KnownOrigins.lattice||r.source!==e)try{clearInterval(t);const e=JSON.parse(r.data);e.deviceID&&e.password||s({error:new Error("Invalid credentials returned from Lattice.")}),s({result:e})}catch(e){s({error:e})}}),!1)})),!0}))};var n=e("../../shared/constants/offscreen-communication")}}},{package:"$root$",file:"offscreen/scripts/lattice.ts"}],[5636,{"../../shared/constants/offscreen-communication":5660,"./callback-processor":5634},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,s){Object.defineProperty(s,"__esModule",{value:!0}),s.default=async function(){return new Promise((e=>{const t=document.createElement("iframe");t.src="https://metamask.github.io/ledger-iframe-bridge/8.0.3/",t.allow="hid",t.onload=()=>{!function(e){window.addEventListener("message",(({origin:t,data:s,source:r})=>{if(t===n.KnownOrigins.ledger&&r===e.contentWindow&&s){if(s.action===a)return void chrome.runtime.sendMessage({action:n.OffscreenCommunicationEvents.ledgerDeviceConnect,payload:s.payload.connected});o.processCallback(s)}})),chrome.runtime.onMessage.addListener(((t,s,r)=>{if(t.target!==n.OffscreenCommunicationTarget.ledgerOffscreen)return;if(!e.contentWindow){return void r({success:!1,payload:{error:new Error("Ledger iframe not present")}})}const a=o.registerCallback(r),c={...t,target:i,messageId:a};return e.contentWindow.postMessage(c,n.KnownOrigins.ledger),!0}))}(t),e()},document.body.appendChild(t)}))};var n=e("../../shared/constants/offscreen-communication"),r=e("./callback-processor");const i="LEDGER-IFRAME",a="ledger-connection-event",o=new r.CallbackProcessor}}},{package:"$root$",file:"offscreen/scripts/ledger.ts"}],[5638,{"../../shared/constants/offscreen-communication":5660,"@trezor/connect-web":3193},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,s){Object.defineProperty(s,"__esModule",{value:!0}),s.default=function(){chrome.runtime.onMessage.addListener(((e,t,s)=>{if(e.target===r.OffscreenCommunicationTarget.trezorOffscreen){switch(e.action){case r.TrezorAction.init:n.default.on(n.DEVICE_EVENT,(e=>{var t;e.type===n.DEVICE.CONNECT&&null!==(t=e.payload.features)&&void 0!==t&&t.model&&chrome.runtime.sendMessage({target:r.OffscreenCommunicationTarget.extension,event:r.OffscreenCommunicationEvents.trezorDeviceConnect,payload:{model:e.payload.features.model,minorVersion:e.payload.features.minor_version}})})),n.default.init({...e.params,env:"webextension"}).then((()=>{s()}));break;case r.TrezorAction.dispose:n.default.dispose(),s();break;case r.TrezorAction.getPublicKey:n.default.getPublicKey(e.params).then((e=>{s(e)}));break;case r.TrezorAction.signTransaction:n.default.ethereumSignTransaction(e.params).then((e=>{s(e)}));break;case r.TrezorAction.signMessage:n.default.ethereumSignMessage(e.params).then((e=>{s(e)}));break;case r.TrezorAction.signTypedData:n.default.ethereumSignTypedData(e.params).then((e=>{s(e)}));break;default:s({success:!1,payload:{error:"Trezor action not supported"}})}return!0}}))};var n=function(e,t){if(!t&&e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var s=i(t);if(s&&s.has(e))return s.get(e);var n={__proto__:null},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var a in e)if("default"!==a&&{}.hasOwnProperty.call(e,a)){var o=r?Object.getOwnPropertyDescriptor(e,a):null;o&&(o.get||o.set)?Object.defineProperty(n,a,o):n[a]=e[a]}return n.default=e,s&&s.set(e,n),n}(e("@trezor/connect-web")),r=e("../../shared/constants/offscreen-communication");function i(e){if("function"!=typeof WeakMap)return null;var t=new WeakMap,s=new WeakMap;return(i=function(e){return e?s:t})(e)}}}},{package:"$root$",file:"offscreen/scripts/trezor.ts"}],[5637,{"../../shared/constants/offscreen-communication":5660,"./lattice":5635,"./ledger":5636,"./trezor":5638,"@metamask/post-message-stream":2344,"@metamask/snaps-execution-environments":2605,"@metamask/utils":2874},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,s){var n=e("@metamask/post-message-stream"),r=e("@metamask/snaps-execution-environments"),i=(e("@metamask/utils"),e("../../shared/constants/offscreen-communication")),a=l(e("./ledger")),o=l(e("./trezor")),c=l(e("./lattice"));function l(e){return e&&e.__esModule?e:{default:e}}(async function(){!function(){const e=new n.BrowserRuntimePostMessageStream({name:"child",target:"parent"});r.ProxySnapExecutor.initialize(e,"./snaps/index.html")}(),(0,o.default)(),(0,c.default)();try{const e=new Promise(((e,t)=>{setTimeout((()=>{t(new Error("Ledger initialization timed out"))}),i.OFFSCREEN_LEDGER_INIT_TIMEOUT)}));await Promise.race([(0,a.default)(),e])}catch(e){console.error("Ledger initialization failed:",e)}})().then((()=>{chrome.runtime.sendMessage({target:i.OffscreenCommunicationTarget.extensionMain,isBooted:!0,webdriverPresent:!0===navigator.webdriver})}))}}},{package:"$root$",file:"offscreen/scripts/offscreen.ts"}]],[5637],{});