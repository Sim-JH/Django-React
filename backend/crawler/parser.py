import errno
import urllib
import os
from os.path import abspath, dirname


import time
from urllib.request import Request, urlopen, urlretrieve
from urllib.parse import quote_plus
from bs4 import BeautifulSoup as bs

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def google_crawler(search_name, search_limit):
    baseUrl = "https://www.google.com/search?q="
    url = baseUrl + quote_plus(search_name) + "&hl=ko&tbm=isch"
    SCROLL_PAUSE_TIME = 1
    scroll_count = search_limit // 30
    img_list = []

    print("parameters :", search_name, search_limit, url)

    driver_path = dirname(dirname(abspath(__file__))) + r"\chromedriver.exe"

    options = webdriver.ChromeOptions()
    # 창이 뜨지 않게 설정
    options.add_argument("headless")
    # gpu 사용안함
    options.add_argument("disable-gpu")
    # 언어 설정
    options.add_argument("lang=ko_KR")
    # bot이 아님을 표현
    options.add_argument(
        "user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6)"
        + "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
    )

    driver = webdriver.Chrome(driver_path, options=options)
    result = driver.get(url)

    last_height = driver.execute_script(
        "return document.body.scrollHeight"
    )  # 스크롤 높이 가져옴

    for x in range(scroll_count):
        # 끝까지 스크롤 다운
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

        time.sleep(0.5)

        # 스크롤 다운 후 스크롤 높이 다시 가져옴
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight-50);")

        # 스크롤이 된 후의 창 높이를 새로운 높이로 저장
        new_height = driver.execute_script("return document.body.scrollHeight")

        # 새로운 높이가 이전 높이와 변하지 않았으면 스크롤 종료
        if new_height == last_height:
            break

        last_height = new_height
        print(x)

    images = driver.find_elements_by_css_selector(
        ".rg_i.Q4LuWd"
    )  # 이미지를 눌렀을때 나오는 큰 이미지의 태그를 찾는다.
    count = 0

    for image in images:
        try:
            if count != search_limit:
                image.click()
                # 이미지를 클릭 후, 최대 1초까지 기다린다. (CSS_SELECTOR 값이 나올때까지)
                WebDriverWait(driver, 0.5).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".rg_i.Q4LuWd"))
                )
                time.sleep(0.2)
                imgURL = driver.find_element_by_xpath(
                    "/html/body/div[2]/c-wiz/div[3]/div[2]/div[3]/div/div/div[3]/div[2]/c-wiz/div/div[1]/div[1]/div/div[2]/a/img"
                ).get_attribute("src")

                # svg 확장자를 cairopng로 변환해줘도 되지만, 현재 사용하는 크롤러에서 svg확장자 사진이 필요할 것 같진 않으므로 제외
                # 마찬가지 이유로 base64로 되어있는 이미지 또한 제외. 만약 디코딩 하려는 경우 백업파일 참조
                if imgURL.split(".")[-1] == "svg" or "base64" in imgURL.split(",")[0]:
                    continue

                img_list.append(imgURL)
                count += 1
                print(len(img_list))
            else:
                print("count_success", len(img_list))
                return img_list

        except Exception as e:
            # 클릭 오류 인한 경우에는 그냥 반복문 계속 진행하도록
            if str(e).find("element click intercepted"):
                print("pass")
                continue
            else:
                print("count_stop :", len(img_list))
                print(e)
                return img_list

    driver.close()


def crawlDownloader(request):
    print(request)
    url = list(request["checkList"])
    path = str(request["downloadPath"])
    search_name = str(request["searchName"]) + "_"

    cnt = 0
    error_cnt = 0

    try:
        if not (os.path.isdir(path)):
            os.makedirs(os.path.join(path))
    except OSError as e:
        if e.errno != errno.EEXIST:
            print("Failed to create directory")
            raise

    for img_src in url:
        cnt += 1
        name = search_name + str(cnt)
        print(name)
        ext = img_src.split(".")[-1]

        if ext != "jpg" or ext != "png":
            ext = "jpg"

        try:
            urllib.request.urlretrieve(img_src, f"{path}/{name}.{ext}")

        # 권한 문제 등으로 실패할 가능성 있음
        except Exception as e:
            cnt -= 1
            error_cnt += 1
            print(e)

    return cnt, error_cnt
