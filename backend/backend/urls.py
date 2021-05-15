from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django_pydenticon.views import image as pydenticon_image

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path("crawler/", include("crawler.urls")),
    path("identicon/image/<path:data>.png", pydenticon_image, name="pydenticon_image"),
    path("", include("instagram.urls")),
]

# 어떤 url요청을 받았을 때, MEDIA_URL로 시작한다면 MEDIA_ROOT에서 파일을 찾아 반환하겠다. static은 list를 반환
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    import debug_toolbar

    urlpatterns += [
        path("__debug__/", include(debug_toolbar.urls)),
    ]
