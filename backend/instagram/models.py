import re
from django.conf import settings
from django.db import models
from django.urls import reverse

# 데이터테이블 생성없이 부모로서만 사용
class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 상속목적으로만 DB 생성 X
    class Meta:
        abstract = True


class Post(TimeStampedModel):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="my_post_set", on_delete=models.CASCADE
    )
    photo = models.ImageField(upload_to="instagram/post/%Y/%m/%d")
    caption = models.TextField(max_length=500)
    # tag 관련 필드는 필수로 두지 않을 것이므로 blank 필수 빼먹어서 고생하지 말자.
    tags = models.TextField(max_length=20, blank=True)
    # ManyToManyField는 기본적으로 Tag.objects.all()이 쿼리셋으로 지정되어있다.
    tag_set = models.ManyToManyField("Tag", blank=True)
    location = models.CharField(max_length=100)
    # 위의 author와 AUTH_USER_MODEL가 충돌 가능하므로 related_name 설정
    like_user_set = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True, related_name="like_post_set"
    )

    def __str__(self):
        return self.caption

    # caption의 내용을 tag필드로 추가. 현재는 caption을 없애고 따로 태그 데이터를 받아서 넘기게 했으므로 주석처리.
    # self로 post object를 요구함
    # def extract_tag_list(self):
    #     tag_name_list = re.findall(r"#([a-zA-Z\dㄱ-힣]+)", self.caption)
    #     tag_list = []
    #     print(tag_list)
    #     for tag_name in tag_name_list:
    #         tag, _ = Tag.objects.get_or_create(name=tag_name)
    #         tag_list.append(tag)
    #     return tag_list

    def extract_tag_list(self):
        tags = self.tags.split(",")
        print(tags)
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

    # def is_like_user(self, user):
    #     return self.like_user_set.filter(pk=user.pk).exists()

    class Meta:
        ordering = ["-id"]


class Comment(TimeStampedModel):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    message = models.TextField()

    class Meta:
        ordering = ["-id"]


class Tag(TimeStampedModel):
    name = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name


# like_user_set을 클래스 형식으로 추가 가능
# class LikeUser(models.Model):
#     post = models.ForeignKey(Post, on_delete=models.CASCADE)
#     user = models.ForeignKey(settings.AUTH_USER_MDEOL, on_delete=models.CASCADE)
