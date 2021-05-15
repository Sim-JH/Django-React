from django.urls import path
from . import views

urlpatterns = [
    path("", view=views.crawler, name="crawler"),
    path("download/", view=views.crawlerDownloader, name="crawlerDownloader"),
]
