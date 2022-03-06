import os, json, traceback, time
from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from service import responseUtil
from SpeechRecDemo import settings
 
@csrf_exempt
def myUploadTest(request):
    id = request.GET['id']
    res = {
        'code': 0, 
        'msg': 'success', 
        'data': {
            'testKey': 'Hello Upload, id: ' + id
        }
    }
    return HttpResponse(json.dumps(res))

# 音频上传
@csrf_exempt
def uploadSpeech(request):
    try:
        speech = request.FILES.get('speech')  # 获取上传的音频
        if not speech:
            return responseUtil.sendFail(code=-1, msg='音频文件为空')
        namelist = speech.name.split(".")
        if len(namelist) <= 1:
            return responseUtil.sendFail(code=-2, msg='音频文件格式非法')
        uid =  request.POST['uid']
        img_folder =  request.POST['img_folder']
        filename = uid + '_' + img_folder + '.' + namelist[len(namelist) - 1]
        filepath = os.path.join(settings.SPEECH_LOCAL, filename)
        if os.path.exists(filepath):
            os.remove(filepath)
		#存储文件
        default_storage.save(filepath, ContentFile(speech.read()))
        data = {
            'speech_filename': filename,
            'speech_URL': settings.SPEECH_URL + filename
        }
        time.sleep(1)
        return responseUtil.sendSuccess(data)
    except Exception as e:
        traceback.print_exc()
        return responseUtil.sendServerError()

# 清空包含UID的所有音频
@csrf_exempt
def clearSpeechByUid(request):
    try:   
        uid =  request.POST['uid']
        speech_list = os.listdir(settings.SPEECH_LOCAL)
        for file in speech_list:
            #删除指定文件
            if file.startswith(uid + '_'):
                os.remove(os.path.join(settings.SPEECH_LOCAL, file))
        return responseUtil.sendSuccess()
    except Exception as e:
        traceback.print_exc()
        return responseUtil.sendServerError()