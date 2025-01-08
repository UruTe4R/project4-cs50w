from django import forms
from .models import Post

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