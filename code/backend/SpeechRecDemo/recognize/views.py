import os, traceback
import random
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from service import responseUtil
from SpeechRecDemo import settings
from recognize import xunfei_speech_rec

# 去除句中标点
punctuation = r"""!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~“”？，！【】（）、。：；’‘……￥·"""
dicts = {i:'' for i in punctuation}
punc_table = str.maketrans(dicts)

# 获取讯飞语音识别结果
def getXunfeiResult(speech_path):
    res = xunfei_speech_rec.return_audio_result(speech_path).translate(punc_table)
    data = {
        'errcode': 0,
        'content': ''
    }
    if res == -1:
        data['errcode'] = 500
    elif res == '':
        data['errcode'] = 1
    else:
        data['content'] = res
    return data

# 判断标准答案列表中的词语是否在识别文本中
def speechJudge(speech_content, answer_list_str):
    answer_list = answer_list_str.split('、')
    for answer in answer_list:
        if answer in speech_content:
            return True
    return False

@csrf_exempt
def myRecognizeTest(request):
    try:
        id = request.GET['id']
        return responseUtil.sendSuccess('Hello Recognize, id: ' + id)
    except Exception as e:
        traceback.print_exc()
        return responseUtil.sendServerError()

# 获取随机图片
@csrf_exempt
def getRandomImage(request):
    try:
        img_root = settings.IMG_ANSWER_LOCAL
        img_answer_list = os.listdir(img_root)
        img_folder = img_answer_list[random.randint(0, len(img_answer_list) - 1)]
        data = {
            'img_folder': img_folder,
            'img_URL': settings.IMG_ANSWER_URL + img_folder + '/Answer.jpg'
        }
        return responseUtil.sendSuccess(data)
    except Exception as e:
        traceback.print_exc()
        return responseUtil.sendServerError()

# 获取语音识别及判定结果
@csrf_exempt
def getRecognize(request):
    try:
        speech_filename =  request.POST['speech_filename']
        img_folder =  request.POST['img_folder']
        speech_path = os.path.join(settings.SPEECH_LOCAL, speech_filename)
        res = getXunfeiResult(speech_path)
        if res['errcode'] != 0:
            return responseUtil.sendFail(code=-1, msg='无法识别音频')
        answer_path = os.path.join(settings.IMG_ANSWER_LOCAL, img_folder, 'Answer.txt')
        f = open(answer_path, 'r')
        line = f.readline().strip()
        judge = speechJudge(res['content'], line)
        f.close()
        data = {
            'content': res['content'],
            'judge': judge
        }
        return responseUtil.sendSuccess(data)
    except Exception as e:
        traceback.print_exc()
        return responseUtil.sendServerError()