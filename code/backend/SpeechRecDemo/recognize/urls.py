from django.urls import re_path
from recognize import views

urlpatterns = [
    re_path(r'^recognizeTest$', views.myRecognizeTest),
    re_path(r'^getRandomImage$', views.getRandomImage),
    re_path(r'^getRecognize$', views.getRecognize),
]