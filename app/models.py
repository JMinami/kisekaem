from django.db import models
from django.db.models import Max
import copy


class Category(models.Model):
    c_picture = models.ImageField(upload_to='images/category/')
    c_z_index = models.PositiveSmallIntegerField()

    def __str__(self):
        return str(self.id)

    def getNextZIndex():
        categories = Category.objects.all()
        if categories:
            agg = categories.aggregate(Max('c_z_index'))
            maxZIndex = agg['c_z_index__max'] + 1
        else:
            maxZIndex = 1
        return maxZIndex

    def arrangeAscZIndex():
        ascCategories = Category.objects.all().order_by('c_z_index')
        updCategories = []
        for index, category in enumerate(ascCategories):
            category.c_z_index = index + 1
            updCategories.append(category)
        Category.objects.bulk_update(updCategories, fields=['c_z_index'])

    def changeZIndex(dropId, dragId):
        dropZIndex = Category.objects.get(id=dropId).c_z_index
        dragZIndex = Category.objects.get(id=dragId).c_z_index
        categories = Category.objects.all().order_by('-c_z_index')
        upd_categories = []
        if dragZIndex > dropZIndex:
            for category in categories:
                currentZIndex = category.c_z_index
                if(dropZIndex > currentZIndex):
                    pass
                elif(dropZIndex <= currentZIndex and currentZIndex < dragZIndex):
                    category.c_z_index += 1
                    upd_categories.append(category)
                elif(dragZIndex == currentZIndex):
                    category.c_z_index = dropZIndex
                    upd_categories.append(category)
                else:
                    pass
        else:
            for category in categories:
                currentZIndex = category.c_z_index
                if(dragZIndex > currentZIndex):
                    pass
                elif(dragZIndex == currentZIndex):
                    category.c_z_index = dropZIndex
                    upd_categories.append(category)
                elif(dragZIndex < currentZIndex
                        and currentZIndex <= dropZIndex):
                    category.c_z_index -= 1
                    upd_categories.append(category)
                else:
                    pass
        Category.objects.bulk_update(upd_categories, fields=['c_z_index'])


class Part(models.Model):
    p_picture = models.ImageField(upload_to='images/part/')
    p_category = models.ForeignKey(Category, on_delete=models.CASCADE)
    p_selected = models.BooleanField(default=False)

    def __str__(self):
        return str(self.id)


class Avatar(models.Model):
    a_number = models.PositiveIntegerField()
    a_category = models.ForeignKey(Category, on_delete=models.CASCADE)
    a_part = models.ForeignKey(Part, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['a_number', 'a_category'],
                name="category_unique"
            ),
        ]

    def __str__(self):
        return str(self.id)

    def checkSameCategory(number, category):
        avatar = Avatar.objects.filter(a_number=number, a_category=category)
        if avatar:
            return True, avatar[0]
        else:
            return False, None

    def selectAvatar(number):
        selectAvatars = Avatar.objects.filter(a_number=number).order_by('a_category__c_z_index')
        returnJson = []
        for selectAvatar in selectAvatars:
            template = {
                'p_picture': selectAvatar.a_part.p_picture.url,
                'z_index': selectAvatar.a_category.c_z_index
            }
            returnJson.append(copy.deepcopy(template))
        return returnJson

    def getCurrentAvatarNumber():
        avatars = Avatar.objects.all()
        if avatars:
            currentNumber = avatars.aggregate(Max('a_number'))['a_number__max']
        else:
            currentNumber = 0
        return currentNumber
