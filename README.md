## 语音识别微信小程序Demo
#### 业务逻辑
服务端存储了一系列图片及展示的内容（一般为一个或多个名词），在微信小程序上系统随机展示图片（可切换），用户需要录音说出图片展示的内容，上传至服务端识别，系统简单判断是否符合图片内容并给予反馈。

#### 微信小程序前端
1. 下载微信开发者工具，后台获得APPID（或使用测试号），导入根目录SpeechRecDemo_frontend
2. 修改app.js globalData中的后端服务器地址，真机调试时需要和服务器在同一局域网

#### Django后端
##### 1. 语言环境
python >= 3.6
##### 2. 依赖安装
```shell script
pip install -r requirements.txt
```
##### 3. 开启Web服务
```shell script
python manage.py runserver 0.0.0.0:8765
```

【提示】
recognize/xunfei_speech_rec.py：修改讯飞appid和secret_key
user/views.py：修改小程序appid和secret_key