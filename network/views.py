from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.db import models
from django.contrib.auth.decorators import login_required
import json

from .models import User, Post, Comment
from .forms import PostForm, IntroductionForm


def index(request):
    post_form = PostForm()
    Introduction_form = IntroductionForm()
    return render(request, "network/index.html", {
        "post_form": post_form,
        "introduction_form": Introduction_form
    })

@login_required
def posts(request):
    # Get all posts in descending order
    posts = Post.objects.all().order_by('-timestamp')
    if request.method == "POST":
        print("request.POST:", request.POST)
        post = PostForm(request.POST)
        # Return error if form is invalid
        if not post.is_valid():
            return render(request, 'network/index.html', {
                "post_form": post
            })
        post = post.save(commit=False)
        post.poster = request.user
        post.save()
        return HttpResponseRedirect(reverse("index"))
    # GET
    else:
        post_list = [{
            "id": post.id,
            "poster": post.poster.username,
            "content": post.content,
            "likes": post.likes.aggregate(models.Count('likes'))["likes__count"],
            "timestamp": post.timestamp
        } for post in posts]
            
        return JsonResponse({
            "post_list": post_list,
            "user": request.user.username
            }, status=200)

def edit_post(request, post_id):
    print(request.method)
    if request.method == "PUT":
        # Convert byte string to python dict
        data = json.loads(request.body)
        post = Post.objects.filter(pk=post_id).first()
        # Check if the poster is the user
        if not post.poster == request.user:
            return JsonResponse({"error": "You are not the poster of this post"}, status=400)
        try:
            post.edit_post(data["content"])
        except ValueError:
            return JsonResponse({"error": "Content's max_length is 300."}, status=400)
        return JsonResponse({"message": "Post edited successfully"}, status=201)
    

@login_required
def profile(request, username=None):
    # Edit profile introduction
    if request.method == "POST":
        user_with_new_introduction = IntroductionForm(request.POST)
        if not user_with_new_introduction.is_valid():
            return JsonResponse({"error": "Form is invalid"}, status=400)
        user = user_with_new_introduction(commit=False)
        user.save()
        return HttpResponseRedirect(reverse("index"))
    # GET => return JSON about user and user's posts
    else:
        # Check if there is target user or not
        if not username:
            user = request.user
            posts = Post.objects.filter(poster=user).order_by("-timestamp")
        else:
            user =User.objects.get(username=username)
            posts = Post.objects.filter(poster=user).order_by("-timestamp")

        follows_and_followers = user.get_follow_and_follower()
        follows = follows_and_followers["follows"]
        followers = follows_and_followers["followers"]
        post_list = [{
            "id": post.id,
            "poster": post.poster.username,
            "timestamp": post.timestamp,
            "content": post.content,
            "likes": post.likes.aggregate(models.Count("likes"))["likes__count"]
        } for post in posts]

        return JsonResponse({
            "user_info":{
            "username": user.username,
            "introduction":user.introduction,
            "follows": follows,
            "followers": followers
            },
            "posts": post_list
        }, status=200)
    


@login_required
def following(request):
    user = request.user
    # who are this user following
    follows = user.follow.all()
    # get posts from those followed users
    posts = [
        {
        "poster": post.poster.username,
        "timestamp": post.timestamp,
        "content": post.content,
        "likes": post.likes.aggregate(models.Count("likes"))["likes__count"]
        }
        # first loop executed first
        for follow in follows
        for post in Post.objects.filter(poster=follow).order_by('-timestamp')
        ]
    
    return JsonResponse({
        "posts": posts,
    }, status=200)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
