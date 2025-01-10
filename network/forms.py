from django import forms
from .models import Post, User

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ["content"]
        labels = {
            "content": ""
        }
        widgets = {
            "content": forms.Textarea(attrs={
                "class": "form-textarea"
            })
        }
class IntroductionForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["introduction"]
        labels = {
            "introduction": ""
        }
        widgets = {
            "introduction": forms.Textarea(attrs={
                "class": "form-textarea"
            })
        }