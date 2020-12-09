from django.urls import path

from .import views

urlpatterns = [
    path('', views.index, name='index'),
    path('category/', views.category, name='category'),
    path('category/<int:id>', views.category, name='category_id'),
    path('category/changeZIndex', views.category, name='category_ZIndex'),
    path('part/', views.part, name='part'),
    path('part/<int:id>', views.part, name='part_id'),
    path('part/select/<int:category_id>', views.part, name='part_select_category'),
    path('avatar/', views.avatar, name='avatar'),
    path('avatar/<int:number>', views.avatar, name='avatar_no'),
]
