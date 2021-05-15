import re
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        user = User.objects.create(username=validated_data["username"])
        user.set_password(validated_data["password"])
        user.save()
        return user

    class Meta:
        model = User
        fields = ["pk", "username", "password"]


class SuggestionUserSerializer(serializers.ModelSerializer):
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
        model = User
        fields = ["username", "name", "avatar_url"]


class ProfileSerializer(SuggestionUserSerializer):
    class Meta:
        model = User

        fields = [
            "username",
            "first_name",
            "last_name",
            # avatar_url과 혼동주의
            "avatar",
            "phone_number",
            "website_url",
        ]
