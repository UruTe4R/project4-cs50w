from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # symmetrical is False because user can follow and the follower user does not need to follow back
    follow = models.ManyToManyField('self', symmetrical=False, related_name="follows" )

    def __str__(self):
        return f"{self.username} follows {self.follow.count()} users and followed by{User.objects.aggregate(models.Count('follor'))['follow__count']} users"

class Post(models.Model):
    poster = models.ForeignKey(User, on_delete=models.CASCADE, related_name="poster")

    likes = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")

    content = models.TextField(max_length=300)

    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.poster} posted on {self.timestamp} with {self.likes} likes"
    
class Comment(models.Model):
    commenter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="commenter")

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="post")