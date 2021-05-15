from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.shortcuts import render
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404, ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from .models import Post, Comment, Tag
from .serializers import PostSerializer, CommentSerializer


# Generic View는 하나의 url에 대한 하나의 기능
# ViewSet은 다수를 엮어서 처리

# def post_list(request):
# request.method => 2개 분기 (get, post)
# pass

# def post_detail(request, pk):
# request.method => 3개 분기 (get, put, delete)
# 각 분기에 해당하는 url은 urls 에서 구현


# ModelViewSet은 Create, Retrieve, Update, DestroyModelMixin, List 등의 클래스 상속과 GenericViewSet을 사용할 수 있다.
# create = POST, list = GET, retrieve = GET, Detail 그 외 action은 찾아아보자
# GenericViewSet에 get_object, get_queryset  emddl vhgkaehlsek.
class PostViewSet(ModelViewSet):
    # queryset = Post.objects.all().select_related('author')
    # 불필요한 쿼리 횟수를 줄이기 위해 필터링
    queryset = (
        Post.objects.all()
        .select_related("author")
        .prefetch_related("tag_set", "like_user_set")
    )
    serializer_class = PostSerializer
    # request는 클래스 뷰셋에서만 받아올 수 있기에 다른 곳에서도 받아 쓸 수 있도록 넘겨줌
    # 이때 리퀘스트의 이름은 context["request"]
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    # permission_classes 대신 react로부터 jwtToken을 받아와 인증한다.
    # DEFAULT_PERMISSION_CLASSES 설정에 따라 인증이 될 경우에만 permission_classes 접속이 허용되므로 접속이 불가능하다.
    # permission_classes = [AllowAny] # 설정과 무관하게 모든 접속을 허용할 경우의 선언
    # permission_classes = [IsAuthenticated] # 인증을 보장받음

    # get_queryset 맴버함수를 재정의하여 쿼리셋 필터링
    def get_queryset(self):
        # timesince = timezone.now() - timedelta(days=3) # 3일 이내 포스트
        qs = super().get_queryset()
        qs = qs.filter(  # self.request.user 로 현재 접속 유저 데이터를 받아올 수 있음.
            # Q객체(복잡한 질의를 수행하기 위한 객체)를 통해 자신이 작성자이거나 follower_set에 포함되어있는 글 목록을 보여줌
            Q(author=self.request.user)
            | Q(
                author__in=self.request.user.following_set.all()
            )  # __in은 리스트 안에 존재하는 자료 검색
        )
        # 위 조건에 추가적으로 timesince 까지 적용
        # qs = qs.filter(created_at__gte=timesince)
        return qs

    # perform_create는 create() 동작의 일부를 overriding한다. 단 create에서 is_valid()를 통과했다는 가정하에 사용가능한 방법.
    # 이를 통해 태깅 작업과 Author를 남긴다.
    def perform_create(self, serializer):
        if serializer.is_valid(raise_exception=True):
            # 익히 봐왔던 아래 동작을 serializer에선 업데이트 하고 싶은 인자를 아래처럼 구현
            # post = form.save(commit=False)
            # post.author = self.request.user
            # post.save()
            # print(self.request.data)
            post = serializer.save(
                author=self.request.user,
                # add 함수에 다중 값을 넣을 경우 아래와 같이 활용가능.
                # add(obj1, obj2, obj3, ...) 혹은,
                # add(*[obj1, obj2, obj3]) # model에 작성한 extract_tag_list()로 태그 리스트를 받아와 이 형식으로 적용중.
                tag_set=extract_tag_list(self.request.data["tags"]),
            )
            # post로 object를 얻어서 아래처럼 사용도 가능함.
            # 이 경우 post object가 self로 넘어가게되니, models의 Post model상에서 extract_tag_list함수를 선언해 사용가능
            # post.tag_set.add(*post.extract_tag_list())

            return super().perform_create(
                post
            )  # 현 상황에선 굳이 필요하진 않지만, 차후 커스텀 된 data를 넣을 수 있으므로
            # return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # @action으로 현재 url의 아래 경로에 함수명에 해당하는 url을 생성해즘. 이를 통해 접근 가능
    @action(detail=True, methods=["GET"])
    def tag(self, request, pk):
        post = self.get_object()
        tags = post.tags.split(",")
        return Response(tags)

    # ViewSet에 EndPoint 추가. detail 옵션은 게시판 글 목록 전체시 False 게시판 특정 글 상세 내용시 True
    @action(detail=True, methods=["POST"])
    def like(self, request, pk):
        post = self.get_object()
        post.like_user_set.add(self.request.user)
        return Response(status.HTTP_201_CREATED)

    @like.mapping.delete
    def unlike(self, request, pk):
        post = self.get_object()
        post.like_user_set.remove(self.request.user)
        return Response(status.HTTP_204_NO_CONTENT)


class CommentViewSet(ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.filter(post__pk=self.kwargs["post_pk"])
        return qs

    def perform_create(self, serializer):
        post = get_object_or_404(Post, pk=self.kwargs["post_pk"])
        serializer.save(author=self.request.user, post=post)
        return super().perform_create(serializer)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TagViewSet(PostViewSet):
    def get_queryset(self):
        # timesince = timezone.now() - timedelta(days=3) # 3일 이내 포스트
        qs = super().get_queryset()
        # ulrs에서 받은 값은 self.kwargs 에서 찾을 수 있다.
        qs = qs.filter(tag_set=self.kwargs["tag_set_idx"])
        return qs


class LikeListAPIView(ListAPIView):
    serializer_class = PostSerializer
    queryset = Post.objects.all()

    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.filter(like_user_set=self.request.user.pk)
        return qs


# Logic부분, 차후 필요시 분리
def extract_tag_list(data):
    print(data)

    tags = data.split(",")
    tag_list = []
    for tag in tags:
        if not tag:
            continue
        else:
            tmp = tag.strip()
            # Tag 모델에 tags로 넘어온 값 추가하기
            _tag, _ = Tag.objects.get_or_create(name=tmp)
            tag_list.append(_tag)
    return tag_list


# request = serializer.context["request"].POST # serializer에서 데이터 얻기
# request = self.request.POST.get("tags", "").split(",") # request에서 데이터 얻기

# Tag id 얻기 쿼리. react에서 보내주기로 수정함
# qs = Tag.objects.all()
# tag_id = qs.filter(name=tags).values("id")[0]["id"]

#     @action(detail=True, methods=["GET", "POST"])
#     def tag(self, request, pk):
#         if request.method == "GET":
#             post = self.get_object()
#             tags = post.tags.split(",")
#             print(tags, type(tags))
#             return Response(tags)
#         # TODO: https://www.google.com/search?q='태그명' 처럼
#         else:
#             post_id = []
#             tag_id = list(dict(request.data).keys()).pop()
#             qs = self.get_queryset()
#             # tag_set 필드에서 tag_id로 색인 후 해당하는 레코드의 id 가져옴
#             filtering_post = qs.filter(tag_set=tag_id).values("id")
#             for post in filtering_post:
#                 post_id.append(post["id"])
#
#             return Response(post_id)

# def perform_create(self, serializer):
#     if serializer.is_valid(raise_exception=True):
#         # 익히 봐왔던 아래 동작을 serializer에선 업데이트 하고 싶은 인자를 아래처럼 구현
#         # post = form.save(commit=False)
#         # post.author = self.request.user
#         # post.save()
#         # print(self.request.data)
#         post = serializer.save(author=self.request.user)  # object 얻기
#         # add 함수에 다중 값을 넣을 경우 아래와 같이 활용가능.
#         # add(obj1, obj2, obj3, ...)
#         # add(*[obj1, obj2, obj3]) # model에 작성한 extract_tag_list()로 태그 리스트를 받아와 이 형식으로 적용중.
#         post.tag_set.add(*post.extract_tag_list())
#     return Response(serializer.data)
#     # return Response(status.HTTP_201_CREATED)
#     # return super().perform_create(serializer)
#
# def extract_tag_list(self):
#     tags = self.tags.split(",")
#     tag_list = []
#     for tag in tags:
#         if not tag:
#             continue
#         else:
#             tmp = tag.strip()
#             # Tag 모델에 tags로 넘어온 값 추가하기
#             _tag, _ = Tag.objects.get_or_create(name=tmp)
#             tag_list.append(_tag)
#     print(self)
#     print(tag_list)
#     return tag_list
