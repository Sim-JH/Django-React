from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# ViewSet을 이용해 생성한 View에대한 Url처리
router = DefaultRouter()
router.register(
    "posts", views.PostViewSet
)  # 2개 분기에 대한 URL을 만듦 router.urls에 리스트 형태로 추가됨
router.register(r"posts/(?P<post_pk>\d+)/comments", views.CommentViewSet)
router.register(r"posts/tag/(?P<tag_set_idx>\d+)", views.TagViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/likes/", views.LikeListAPIView.as_view(), name="like_post"),
]
