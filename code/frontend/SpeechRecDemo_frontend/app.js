// app.js
App({
  onLaunch() {
    // 登录
    var that = this
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var jscode = res.code
        //console.log('jscode: ' + jscode)
        wx.request({
          url: that.globalData.api_domain + 'user/getOpenID',
          method: "POST",
          data: {
            jscode: jscode
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: res => {
            //console.log(res.data)
            if(res.data.code == 0){
              that.globalData.uid = res.data.data.openid // 每个微信用户在该app上对应唯一的openid
            }  
            else{
              that.errorToast(res.data.msg)
            }
            // 回调函数，解决index页面onLoad先于app执行问题
            if (that.userInfoReadyCallback) {
              that.userInfoReadyCallback(res)
            }
          },
          fail: res => {
            that.requestFailToast()
          }
        })
      }
    })
  },

  // 成功提示
  successToast(title){
    wx.showToast({
      title: title,
      duration: 1000
    })
  },

  // 错误提示
  errorToast(title){
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 2000
    })
  },

  // 网络请求失败的提示
  requestFailToast(){
    this.errorToast('请求失败')
  },

  // 用户ID合法性判定
  isvalidUid(){
    if(this.globalData.uid == ''){
      this.errorToast('无法获取用户ID')
      return false
    }
    return true
  },

  globalData: {
    root_domain: 'http://your ip address:8765', // 后端根URL
    api_domain: 'http://your ip address:8765/api/', // 后端API URL
    uid: '' // 用户ID
  }
})
