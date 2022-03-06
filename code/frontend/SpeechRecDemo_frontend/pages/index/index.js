// index.js
// 获取应用实例
const app = getApp()
const recorderManager = wx.getRecorderManager()

Page({
  data: {
    testKey: 'init',
    testid: 2022,
    imgInfo: {
      'img_folder': '',
      'img_URL': ''
    },
    tempFilePath: '',
    speechInfo: {
      'speech_filename': '',
      'speech_URL': ''
    },
    content: '',
    judge: '无',
    start_record: true
  },

  // 接口测试
  testUpload(){
    var that = this
    console.log(that.data.testid)
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: 'http://localhost:8765/api/upload/uploadTest',
      method: "GET",
      data: {
        id: that.data.testid
      },
      header: {
        //'content-type': 'application/x-www-form-urlencoded' //GET请求不需要
      },
      success: res => {
        wx.hideLoading()
        console.log(res.data)
        if (res.data.code == 0)
          that.setData({
            testKey: res.data.data.testKey
          })
        else
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
      },
      fail: res => {
        wx.hideLoading();
        wx.showToast({
          title: '服务器无响应',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  // 页面初次加载的生命周期函数
  onLoad() {
    if(app.globalData.uid == ''){
      app.userInfoReadyCallback = res => {
        //console.log('onLoad() get uid: ' + app.globalData.uid)
        this.clearSpeechByUid()
        this.getImage()
      }
    }
   
  },

  // 页面数据初始化
  speechInit(){
    this.setData({
      tempFilePath: '',
      speechInfo: {
        'speech_filename': '',
        'speech_URL': ''
      },
      content: '',
      judge: '无',
      start_record: true
    })
  },

  // 更换图片
  changeImage(){
    this.setData({
      imgInfo: {
        'img_folder': '',
        'img_URL': ''
      }
    })
    this.speechInit()
    this.getImage()
  },

  // 清空后台用户音频
  clearSpeechByUid(){
    if(!app.isvalidUid()){
      return
    }
    wx.request({
      url: app.globalData.api_domain + 'upload/clearSpeechByUid',
      method: "POST",
      data: {
        uid: app.globalData.uid
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: res => {
        //console.log(res.data)
        if(res.data.code != 0){
          app.errorToast(res.data.msg)
        }  
      },
      fail: res => {
        app.requestFailToast()
      }
    })
  },

  // 获取随机图片
  getImage(){
    var that = this
    wx.request({
      url: app.globalData.api_domain + 'recognize/getRandomImage',
      method: "GET",
      data: {},
      header: {},
      success: res => {
        //console.log(res.data)
        if(res.data.code == 0){
          that.setData({
            imgInfo: {
              'img_folder': res.data.data.img_folder,
              'img_URL': app.globalData.root_domain + res.data.data.img_URL
            }
          })
        }
        else{
          app.errorToast(res.data.msg)
        }   
      },
      fail: res => {
        app.requestFailToast()
      }
    })
  },

  // 开始录音
  startRecord: function () {
    if(!app.isvalidUid()){
      return
    }
    this.speechInit()
    const options = {
      duration: 10000, // 指定录音的时长，单位 ms
      sampleRate: 16000, // 采样率
      numberOfChannels: 1, // 录音通道数
      encodeBitRate: 96000, // 编码码率
      format: 'mp3', // 音频格式
      frameSize: 50, // 指定帧大小，单位 KB
    }
    recorderManager.start(options);
    recorderManager.onStart(() => {
      console.log('开始录音')
      app.errorToast('开始录音')
      this.setData({
        start_record: false
      })
    });
    // 错误回调
    recorderManager.onError((res) => {
      console.log(res);
    })
  },

  // 停止录音
  stopRecord: function () {
    if(!app.isvalidUid()){
      return
    }
    recorderManager.stop();
    recorderManager.onStop((res) => {
      this.setData({
        'tempFilePath': res.tempFilePath
      })
      console.log('停止录音', res.tempFilePath)
      app.errorToast('结束录音')
      this.setData({
        start_record: true
      })
    })
  },

  // 播放音频
  playAudio: function () {
    if(this.data.speechInfo.speech_URL == ''){
      app.errorToast('请先上传音频')
      return
    }
    var innerAudioContext = wx.createInnerAudioContext() // 不能写成const，否则只能播放一次
    innerAudioContext.autoplay = true
    //innerAudioContext.src = this.data.tempFilePath, // 真机上可能无法播放临时文件
    innerAudioContext.src = this.data.speechInfo.speech_URL
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },

  // 上传音频
  uploadSpeech(){
    var that = this
    if(!app.isvalidUid()){
      return
    }
    if(that.data.imgInfo.img_folder == ''){
      app.errorToast('缺失图片无法上传')
      return
    }
    if(that.data.tempFilePath == ''){
      app.errorToast('录音文件为空')
      return
    }
    wx.showLoading({
      title: '上传中...',
    })
    wx.uploadFile({
      filePath: that.data.tempFilePath,
      name: 'speech',
      url:  app.globalData.api_domain + 'upload/uploadSpeech',
      formData: {
        uid: app.globalData.uid,
        img_folder: that.data.imgInfo.img_folder
      },
      success: res =>{
        wx.hideLoading()
        var res_json = JSON.parse(res.data); // formData返回值为string而非json，需要解析
        if(res_json.code == 0){
          app.successToast('上传成功')
          that.setData({
            speechInfo: {
              'speech_filename': res_json.data.speech_filename,
              'speech_URL': app.globalData.root_domain + res_json.data.speech_URL
            },
          })
          that.getRecognize()
        }
        else{
          app.errorToast(res_json.msg)
        }
      },
      fail: res =>{
        wx.hideLoading()
        app.requestFailToast()
      }   
    })
  },

  // 识别音频
  getRecognize(){
    var that = this
    if(that.data.speechInfo.speech_filename == ''){
      app.errorToast('无音频文件')
      return
    }
    if(that.data.imgInfo.img_folder == ''){
      app.errorToast('缺失图片无法判定')
      return
    }
    wx.showLoading({
      title: '识别中...',
    })
    wx.request({
      url: app.globalData.api_domain + 'recognize/getRecognize',
      method: "POST",
      data: {
        speech_filename: that.data.speechInfo.speech_filename,
        img_folder: that.data.imgInfo.img_folder
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: res => {
        wx.hideLoading()
        //console.log(res.data)
        if(res.data.code == 0){
          that.setData({
            'content': res.data.data.content,
            'judge': res.data.data.judge? '正确': '错误'
          })
        }  
        else{
          app.errorToast(res.data.msg)
        }
      },
      fail: res => {
        wx.hideLoading()
        app.requestFailToast()
      }
    })
  }

})
