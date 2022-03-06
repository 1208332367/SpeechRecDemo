from django.urls import include, re_path

urlpatterns = [
    re_path(r'^upload/', include('upload.urls')),
    re_path(r'^recognize/', include('recognize.urls')),
    re_path(r'^user/', include('user.urls')),
]