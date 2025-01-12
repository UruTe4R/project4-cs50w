from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now


class User(AbstractUser):
    # symmetrical is False because user can follow and the follower user does not need to follow back
    follow = models.ManyToManyField('self', symmetrical=False, related_name="follows")

    introduction = models.TextField(max_length=200, blank=True, null=True, default="Hi I'm new!")

    def get_follow_and_follower(self):
        return {
            "follows" : self.follow.count(),
            "followers": User.objects.filter(follow=self).count()
        }

    def __str__(self):
        return f"{self.username} follows {self.follow.count()} follower {User.objects.filter(follow=self).count()}"

class Post(models.Model):
    poster = models.ForeignKey(User, on_delete=models.CASCADE, related_name="poster")

    likes = models.ManyToManyField(User, related_name="likes", blank=True, null=True)

    content = models.TextField(max_length=300)

    timestamp = models.DateTimeField(auto_now_add=True)

    def edit_post(self, new_content):
        if len(new_content) > 300:
            raise ValueError("Content's max_length is 300.")
        self.content = new_content
        self.save()

    def liked_by(self, username):
        """
        Add a user to the likes field, and ensure the poster cannot like their own post.
        """
        try:
            # Fetch the user by username
            user = User.objects.get(username=username)

            # Add the user to the likes
            self.likes.add(user)

            # If the poster is in likes, remove them
            if self.poster == user:
                self.likes.remove(self.poster)
        except User.DoesNotExist:
            raise ValueError(f"User with username '{username}' does not exist.")



    def __str__(self):
        return f"{self.poster}: {self.content}"
    
class Comment(models.Model):
    commenter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="commenter")

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="post")

    comment = models.TextField(max_length=300)

    comment_timestamp = models.DateTimeField(auto_now_add=True)

    comment_likes = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comment_likes", blank=True, null=True)

    def __str__(self):
        return f"{self.commenter} commented on {self.post}"