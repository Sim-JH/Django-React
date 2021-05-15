from django.urls import path, include
from django.contrib.auth import views as auth_views
from rest_framework.routers import DefaultRouter
from rest_framework_jwt.views import (
    obtain_jwt_token,
    refresh_jwt_token,
    verify_jwt_token,
)
from . import views

# url : /prefix/ 는 get과 post만 지원되는 list route
# url : /prefix/pk/는 아래 6가지 메소드가 지원되는 detail route. 콜론 뒤에는 매핑되는 httprequest
# list route - 'get': 'list' 'post': 'create'
# detail route - 'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy',
router = DefaultRouter()
# profile로 접근하면 list route, 뒤에 식별자가 붙으면 detail route로 연동
router.register(r"", views.ProfileViewSet)
router.register(r"profile/(?P<login_user>\d+)", views.ProfileViewSet)
# router.register(r"profile/(?P<login_user>[\w.@+-]+)", views.ProfileViewSet)

urlpatterns = [
    path("profile/", include(router.urls)),
    path("username/", views.login_user, name="login_user"),
    path("signup/", views.SignupView.as_view(), name="login"),
    path("token/", obtain_jwt_token),
    path("token/refresh/", refresh_jwt_token),
    path("token/verify/", verify_jwt_token),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),
    path(
        "suggestions/",
        views.SuggestionListAPIView.as_view(),
        name="suggestion_user_list",
    ),
    path("follow/", views.user_follow, name="user_follow"),
    path("follow/list/", views.FollowListAPIView.as_view(), name="follow_list"),
    path("unfollow/", views.user_unfollow, name="user_unfollow"),
]
