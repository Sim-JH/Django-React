from django.db import models


class Crawler(models.Model):
    keyword = models.CharField(max_length=100)
    amount = models.IntegerField()
