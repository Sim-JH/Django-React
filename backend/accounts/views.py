from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from rest_framework import status
from rest_framework.decorators import api_view, action
from rest_framework.permissions import AllowAny
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    get_object_or_404,
    UpdateAPIView,
)
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .serializers import (
    SignupSerializer,
    SuggestionUserSerializer,
    ProfileSerializer,
)


class SignupView(CreateAPIView):
    model = get_user_model()
    serializer_class = SignupSerializer
    permission_classes = [
        AllowAny,
    ]


class SuggestionListAPIView(ListAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = SuggestionUserSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.exclude(pk=self.request.user.pk)
        qs = qs.exclude(pk__in=self.request.user.following_set.all())
        return qs


class FollowListAPIView(ListAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = SuggestionUserSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        qs = self.request.user.following_set
        return qs


class ProfileViewSet(ModelViewSet):
    queryset = get_user_model().objects.all()
    serializer_class = ProfileSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.filter(pk=self.request.user.id)
        return qs

    def update(self, request, *args, **kwargs):
        # avatar가 이미지 필드이므로 해당 필드에 이미지 파일이 넘어와야하지만, 변경 전 기본상태에선 str이다.
        # 그러므로 이를 변경하기 위한 작업. Querydick은 수정이 불가하기에
        data = {
            "username": request.data["username"],
            "first_name": request.data["first_name"],
            "last_name": request.data["last_name"],
            "avatar": request.data["avatar"],
            "phone_number": request.data["phone_number"],
            "website_url": request.data["website_url"],
        }

        if type(request.data["avatar"]) == str:
            data["avatar"] = request.user.avatar

        user = self.get_object()
        serializer = self.get_serializer(user, data=data)
        # serializer = self.get_serializer(user, data=request.data)
        # 지금 is_valid를 통과하지 못하는 중. model의 모든 데이터가 다 있어야한다. blank 옵션이 아니기 때문에. 기본값 넣어주자.
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=["PUT"])
    def pass_change(self, request, pk):
        if request.data["pass_data"]:
            user = get_object_or_404(get_user_model(), id=pk)
            user.set_password(request.data["pass_data"])
            user.save()
            return Response(status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)


@api_view(["GET"])
@login_required
def login_user(request):
    username = str(request.user)
    userpk = str(request.user.pk)
    return Response({"username": username, "userpk": userpk})


@api_view(["POST"])
def user_follow(request):
    username = request.data["username"]
    follow_user = get_object_or_404(get_user_model(), username=username, is_active=True)
    request.user.following_set.add(follow_user)
    follow_user.follower_set.add(request.user)
    return Response(status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
def user_unfollow(request):
    username = request.data["username"]
    follow_user = get_object_or_404(get_user_model(), username=username, is_active=True)
    request.user.following_set.remove(follow_user)
    follow_user.follower_set.remove(request.user)
    return Response(status.HTTP_204_NO_CONTENT)
