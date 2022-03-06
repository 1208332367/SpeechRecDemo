from django.urls import re_path
from upload import views

urlpatterns = [
    re_path(r'^uploadTest$', views.myUploadTest),
    re_path(r'^uploadSpeech$', views.uploadSpeech),
    re_path(r'^clearSpeechByUid$', views.clearSpeechByUid),
]