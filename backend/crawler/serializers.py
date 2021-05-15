from .models import Crawler
from rest_framework import serializers


class CrawlerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crawler
        fields = "__all__"
