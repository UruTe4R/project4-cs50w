from django.core.paginator import Paginator

def paginate_posts(posts_per_page, all_posts, request):
  p = Paginator(all_posts, posts_per_page)
  return {
      f"page{page_n}": {
      "has_previous": p.page(page_n).has_previous(),
      "has_next": p.page(page_n).has_next(),
      "post_list": [{
          "id": post.id,
          "poster": post.poster.username,
          "content": post.content,
          "likes": post.likes.all().count(),
          "liked": True if request.user in post.likes.all() else False,
          "timestamp": post.timestamp
          } for post in p.page(page_n).object_list]
      } for page_n in p.page_range}