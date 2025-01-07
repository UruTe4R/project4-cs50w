from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ["content"]
        labels = {
            "content": "New Post"
        }
        widgets = {
            "content": forms.TextInput(attrs={
                "class": "form-control"
            })
        }