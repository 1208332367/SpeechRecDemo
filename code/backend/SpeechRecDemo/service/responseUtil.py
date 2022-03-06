import json
from django.http import HttpResponse

def getBasicResData():
    res = {
        'code': 0, 
        'msg': '', 
        'data': {}
    }
    return res

# 请求成功时的响应
def sendSuccess(data={}):
    res = getBasicResData()
    res['msg'] = 'success'
    res['data'] = data
    return HttpResponse(json.dumps(res))

# 请求失败时的响应
def sendFail(code=-1, msg='failed', data={}):
    res = getBasicResData()
    res['code'] = code
    res['msg'] = msg
    res['data'] = data
    return HttpResponse(json.dumps(res))

# 服务器内部错误的响应
def sendServerError():
    res = getBasicResData()
    res['code'] = 500
    res['msg'] = '服务器内部错误'
    return HttpResponse(json.dumps(res))
