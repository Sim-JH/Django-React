import re

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Post, Comment, Tag


class AuthorSerializer(serializers.ModelSerializer):
    # request의 avatar_url은 앞의 호스트 명이 생략되어 나타나기에
    # react 단에서 avatar_url을 호출할 시 앞에 호스트 명을 추가해줘야하는 번거로움이 있다.
    # 이를 avatar_url자체가 전체 표기를 하여 호출 자체로도 아바타가 나올수 있도록 세팅
    avatar_url = serializers.SerializerMethodField("avatar_url_field")

    def avatar_url_field(self, author):
        # http(s는 변동가능):// 로 시작한다면 avatar_url을 그대로 넘겨줌.
        if re.match(r"^https?://", author.avatar_url):
            return author.avatar_url

        # 그게 아니라 request를 통해 올 경우
        if "request" in self.context:
            scheme = self.context["request"].scheme  # scheme = "http" or "https"
            host = self.context["request"].get_host()  # scheme을 제외한 호스트
            return (
                scheme + "://" + host + author.avatar_url
            )  # 결과적으로 3개를 조합한 http(s) + 호스트 + url을 반환해준다.

    class Meta:
        model = get_user_model()
        fields = ["username", "name", "avatar_url"]


class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    is_like = serializers.SerializerMethodField("is_like_field")
    # tags = serializers.SerializerMethodField("tags_field")

    def is_like_field(self, post):
        # 현재 로그인 유저를 알고 싶지만 self.request로 받아오는 건 calss view에서 가능한 것.
        # 그러므로 get_context를 통해 view단에서 request를 담아서 넘겨준걸 받아온다.
        if "request" in self.context:
            user = self.context["request"].user
            return post.like_user_set.filter(
                pk=user.pk
            ).exists()  # exists로 해당 유저 존재여부 확인 후 True OR False 전달
        return False

    # serializer 상에서 데이터를 변형하면 모든 데이터에 대해 일괄적으로 변형이 가해진다.
    # 그러므로 전체적인 값의 형식을 통일하거나 하는 용도로 사용해야하며 포스트마다 개별적인 값의 변경은 이뤄져선 안된다.
    # def tags_field(self, post):
    #     if "request" in self.context:
    #         all_data = self.context["request"].POST
    #         tags = all_data.get("tags", "").split(",")
    #         for tag in tags:
    #             if not tag:
    #                 continue
    #             else:
    #                 tmp = tag.strip()
    #                 _tag, _ = Tag.objects.get_or_create(name=tmp)
    #                 # tag_id = Tag.objects.filter()

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "created_at",
            "photo",
            "caption",
            "location",
            "tags",
            "tag_set",
            "is_like",
        ]


class CommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "author", "message", "created_at"]
