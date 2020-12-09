from django.shortcuts import render, HttpResponse
from django.http import QueryDict
from django.http.response import JsonResponse
from .models import Category, Part, Avatar
from .forms import CategoryForm, PartForm, AvatarForm
from django.core import serializers
from django.conf import settings


def index(request):
    if settings.DEBUG:
        debug = 1
    else:
        debug = 0
    context = {
        'debug': debug
    }
    return render(
        request,
        'app/index.html',
        context
    )


def category(request, id=None):
    if request.method == 'GET':
        categories = Category.objects.all().order_by('-c_z_index')
        sl_categories = serializers.serialize('python', categories)
        return JsonResponse(data=sl_categories, safe=False)

    if request.method == "POST":
        d = {'c_z_index': Category.getNextZIndex()}
        form = CategoryForm(d, request.FILES)
        if form.is_valid():
            form.save()
            returnJson = {'responseCode': True}
        else:
            returnJson = {'responseCode': False}
        return JsonResponse(data=returnJson)

    if request.method == 'DELETE':
        Category.objects.get(id=id).delete()
        Category.arrangeAscZIndex()

    if request.method == 'PATCH':
        dropId = int(request.GET['dropId'])
        dragId = int(request.GET['dragId'])
        Category.changeZIndex(dropId, dragId)

    return HttpResponse('')


def part(request, id=None, category_id=None):
    if request.method == 'GET':
        selectParts = Part.objects.filter(p_category=category_id)
        sl_parts = serializers.serialize('python', selectParts)
        return JsonResponse(data=sl_parts, safe=False)

    if request.method == 'POST':
        form = PartForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            returnJson = {'responseCode': True}
        else:
            returnJson = {'responseCode': False}
        return JsonResponse(data=returnJson)

    if request.method == 'DELETE':
        Part.objects.get(id=id).delete()

    return HttpResponse('')


def avatar(request, number=None):
    if request.method == 'GET':
        if number is None:
            # 選択アバター番号を取得
            currentAvatarNumber = Avatar.getCurrentAvatarNumber()
            returnJson = {'number': currentAvatarNumber}
            return JsonResponse(returnJson)
        else:
            # 選択アバターを取得
            selectAvatars = Avatar.selectAvatar(number)
            return JsonResponse(data=selectAvatars, safe=False)

    if request.method == 'POST':
        number = int(request.POST['a_number'])
        selectPart = Part.objects.get(id=request.POST['a_part'])
        selectCategory = Category.objects.get(id=selectPart.p_category.id)
        d = {
            'a_number': number,
            'a_category': selectCategory,
            'a_part': selectPart,
        }
        isSameCategory, avatar = Avatar.checkSameCategory(number, selectCategory)
        if isSameCategory:
            form = AvatarForm(d, instance=avatar)
        else:
            form = AvatarForm(d)
        if form.is_valid():
            form.save()
            returnJson = {'responseCode': True}
        else:
            returnJson = {'responseCode': False}
        return JsonResponse(data=returnJson)
