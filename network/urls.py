
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    # API routes
    path("posts", views.posts, name="posts"),
    path("profile", views.profile, name="profile"),
    path("profile/<str:username>", views.profile, name="profile"),
    path("following", views.following, name="following"),
    path("edit/post/<int:post_id>", views.edit_post, name="edit_post"),
    path("like/post/<int:post_id>", views.like_post, name="like_post"),
    path("follow/<str:username>", views.follow, name="follow")
]
