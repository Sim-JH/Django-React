from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models
from django.core.mail import send_mail
from django.contrib.auth.models import AbstractUser
from django.shortcuts import resolve_url
from django.template.loader import render_to_string


class User(AbstractUser):
    # class GenderChoices(models.TextChoices):
    #     MALE = "M", "남성"
    #     FEMALE = "F", "여성"

    follower_set = models.ManyToManyField("self", blank=True)
    following_set = models.ManyToManyField("self", blank=True)

    website_url = models.URLField(blank=True)
    phone_number = models.CharField(
        max_length=13,
        validators=[RegexValidator(r"^010-?[1-9]\d{3}-?\d{4}$")],
        blank=True,
    )
    # gender = models.CharField(max_length=1, blank=True, choices=GenderChoices.choices)
    avatar = models.ImageField(
        blank=True,
        upload_to="accounts/avatar/%Y/%m/%d",
        help_text="48px * 48px 크기의 png/jpg 파일을 업로드 해주세요.",
    )

    # name = models.TextField(max_length=10, blank=False)
    # name으로 접근하면 아래 내용 반환
    @property
    def name(self):
        return f"{self.first_name} {self.last_name}".strip()

    # profile 이미지 없을경우 대체해주는 코드, layout에 구현했다가 중복 사용이 있을 것 같아 코드화
    @property
    def avatar_url(self):
        if self.avatar:
            return self.avatar.url
        else:
            return resolve_url("pydenticon_image", self.username)

    # Sendgrid이용 가입환영 메일을 보내는 함수
    def send_welcome_email(self):
        subject = render_to_string(
            "accounts/welcome_email_subject.txt",
            {
                "user": self,
            },
        )
        content = render_to_string(
            "accounts/welcome_email_content.txt",
            {
                "user": self,
            },
        )
        sender_email = settings.WELCOME_EMAIL_SENDER
        send_mail(subject, content, sender_email, [self.email], fail_silently=False)
