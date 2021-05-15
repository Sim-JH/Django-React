from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .parser import google_crawler, crawlDownloader
from .serializers import CrawlerSerializer
from .models import Crawler


@api_view(["GET", "POST"])
def crawler(request):
    if request.method == "POST":
        # API 인증을 위해서 시리얼라이저는 필수
        serializer = CrawlerSerializer(data=request.data)
        # print("serializer :", serializer)
        if serializer.is_valid():
            print(f"serializer data: {serializer.data}")
            image_list = google_crawler(
                serializer.data["keyword"], serializer.data["amount"]
            )
            return Response(image_list)
        print(f"serializer.errors: {serializer.errors}")
        return Response(serializer.errors, status=400)

        # if serializer.is_valid():
        #     serializer.save()
        #     return Response(serializer.data, status=201)
        # return Response(serializer.errors, status=400)

    else:
        serializer = CrawlerSerializer(Crawler.objects.all(), many=True)
        print("request", request.data)
        return Response(serializer.data)


# @api_view(["POST"])
# def crawler(request):
#     print(request)
#     try:
#         image_list = google_crawler(request.data["keyword"], request.data["amount"])
#         return Response(image_list)
#     except Exception as e:
#         return Response(e, status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def crawlerDownloader(request):
    try:
        success, fail = crawlDownloader(request.data)
        return Response([success, fail])
    except Exception as e:
        return Response(e, status.HTTP_400_BAD_REQUEST)
