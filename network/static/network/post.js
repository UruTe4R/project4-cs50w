// Define Nav Buttons
const all_posts = document.querySelector('#all-posts')
const following = document.querySelector('#following')
const user_info = document.querySelector('#username')

// Define Views
const post_view = document.querySelector('#all-posts-view')
const following_view = document.querySelector('#following-view')
const user_info_view = document.querySelector('#user-info-view')

document.addEventListener('DOMContentLoaded', () => {
  // Use Buttons to Toggle Views
  document.querySelector('#all-posts').addEventListener('click', loadPosts)
  document.querySelector('#following').addEventListener('click', loadFollowing)
  document.querySelector('#username').addEventListener('click', loadUserInfo)

  // By Default, Load All Posts View
  loadPosts()

  // show word length
  const word_length = document.querySelector('#word-length')
  let max_word_length = 300
  
  document.querySelector('.form-textarea').addEventListener('input', () => {
    word_length.innerHTML = max_word_length - document.querySelector('.form-textarea').value.length
  })

})



function loadPosts() {
  console.log('loadPosts')
  // Only Show All Posts
  post_view.style.display = 'block'
  following_view.style.display = 'none'
  user_info_view.style.display = 'none'

  

  // Fetch to Load Posts
  fetch('/posts')
  .then(response => response.json())
  .then(posts => {
    console.log('posts:', posts)
    posts["post_list"].forEach(post => {
      const poster = post["poster"]
      const content = post["content"]
      const likes = post["likes"]
      const timestamp = post["timestamp"]
      // For TEST
      console.log(poster, content, likes, timestamp)
      // TODO CREATE ELEMENT AND APPEND TO DOM BUT BEFORE THAT CREATE POST OBJECT

    })
  })
}

function loadFollowing() {
  console.log('loadFollowing')
  console.log(post_view)
  post_view.style.display = 'none'
  following_view.style.display = 'block'
  user_info_view.style.display = 'none'
  console.log('hit')
}

function loadUserInfo() {
  console.log('loadUserInfo')
  console.log(post_view)
  post_view.style.display = 'none'
  following_view.style.display = 'none'
  user_info_view.style.display = 'block'
  console.log('hit')
  
}