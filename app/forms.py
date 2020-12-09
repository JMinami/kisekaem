from django import forms
from .models import Category, Part, Avatar


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['c_picture', 'c_z_index']


class PartForm(forms.ModelForm):
    class Meta:
        model = Part
        fields = ['p_picture', 'p_category', 'p_selected']


class AvatarForm(forms.ModelForm):
    class Meta:
        model = Avatar
        fields = ['a_number', 'a_category', 'a_part']
