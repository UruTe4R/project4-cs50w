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
    if (word_length.innerHTML < 20) {
      word_length.style.color = 'red'
    } else {
      word_length.style.color = 'green'
    }
  })

})



function loadPosts() {
  console.log('loadPosts')
  // Only Show All Posts
  post_view.style.display = 'block'
  following_view.style.display = 'none'
  user_info_view.style.display = 'none'

  const posts = document.querySelector('#posts').innerHTML = ''
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

      // div.post_container>div.poster+button.edit-button+div.post-content+div.post-timestamp+div.post-likes+div.post-comment

      // CREATE POST AND RENDER
      // Create elements
      const post_container = document.createElement('div')
      post_container.classList.add('post_container')

      const post_header = document.createElement('div')
      post_header.classList.add('post_header')

      const post_footer = document.createElement('div')
      post_footer.classList.add('post_footer')

      post_elements = {
        'post_poster': poster,
        'post_content': content,
        'post_timestamp': timestamp,
        'post_likes': `&#9829;${likes}`,
        'post_comment': 'comment'}

      const elements = {}
      
      // create divs from post_elements and save to elements
      Object.keys(post_elements).forEach(element => {
        const div = document.createElement('div')
        div.classList.add(element)
        div.innerHTML = post_elements[element]
        elements[element] = div
      })

      const button_wrapper = document.createElement('div')
      button_wrapper.classList.add('button_wrapper')

      const edit_button = document.createElement('button')
      edit_button.classList.add('edit_button', 'btn', 'btn-outline-primary')
      edit_button.innerHTML = 'Edit'
      button_wrapper.append(edit_button)

      post_header.append(elements["post_poster"], elements["post_timestamp"], button_wrapper)
      post_container.append(post_header, elements["post_content"])

      post_footer.append(elements["post_comment"], elements["post_likes"])
      post_container.append(post_footer)
      document.querySelector('#posts').append(post_container)
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