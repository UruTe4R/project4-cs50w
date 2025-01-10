// Define Nav Buttons
const all_posts = document.querySelector('#all-posts')
const following = document.querySelector('#following')
const user_info = document.querySelector('#username')

// Define Views
const post_view = document.querySelector('#all-posts-view')
const following_view = document.querySelector('#following-view')
const profile_view = document.querySelector('#profile-view')

document.addEventListener('DOMContentLoaded', () => {
  // Use Buttons to Toggle Views
  document.querySelector('#all-posts').addEventListener('click', loadPosts)
  document.querySelector('#following').addEventListener('click', loadFollowing)
  document.querySelector('#username').addEventListener('click', loadProfile)

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
  profile_view.style.display = 'none'

  const posts = document.querySelector('#posts').innerHTML = ''
  // Fetch to Load Posts
  fetch('/posts')
  .then(response => response.json())
  .then(posts => {
    console.log('posts:', posts)
    posts["post_list"].forEach(post => {
      const user = posts["user"]
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

      // Add Edit Button if poster is the user
      if (user == poster) {
        const edit_button = document.createElement('button')
        edit_button.classList.add('edit_button', 'btn', 'btn-outline-primary')
        edit_button.innerHTML = 'Edit'
        button_wrapper.append(edit_button)
      }

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
  post_view.style.display = 'none'
  following_view.style.display = 'block'
  profile_view.style.display = 'none'
}

function loadProfile() {
  console.log('loadProfile')
  post_view.style.display = 'none'
  following_view.style.display = 'none'
  profile_view.style.display = 'block'

  document.querySelector('#profile-content').innerHTML = ''
  
  // Fetch to Get User Info
  fetch('/profile')
  .then(response => response.json())
  .then(profile => {
    // For TEST
    console.log('profile:', profile)
    console.log(profile["username"], profile["follows"], profile["followers"])

    // Create Elements
    const profile_container = document.createElement('div')
    profile_container.classList.add('profile-container')

    const profile_header = document.createElement('div')
    profile_header.classList.add('profile-header')

    const profile_follow_container = document.createElement('div')
    profile_follow_container.classList.add('profile-follow-container')

    // save element as JSobject
    const profile_DOM = {}
    Object.keys(profile["user_info"]).forEach(element => {
      const div = document.createElement('div')
      console.log('element:', element)
      div.classList.add(element)
      div.innerHTML = profile[element]
      profile_DOM[`profile-${element}`] = div
    })

    // create edit button
    const edit_button_container = document.createElement('div')
    const edit_button = document.createElement('button')
    edit_button.classList.add('edit_button', 'btn', 'btn-outline-primary')
    edit_button.innerHTML = 'Edit'
    edit_button_container.append(edit_button)

    profile_header.append(profile_DOM["profile-username"], edit_button_container)
    profile_container.append(profile_header, profile_DOM["profile-introduction"])
    profile_DOM["profile-follows"].innerHTML = `follows ${profile["follows"]}`
    profile_DOM["profile-followers"].innerHTML = `followers ${profile["followers"]}`

    profile_follow_container.append(profile_DOM["profile-follows"], profile_DOM["profile-followers"])
    profile_container.append(profile_follow_container)
    document.querySelector('#profile-content').append(profile_container)

    console.log(profile["posts"])

  })
  .catch(error => {
    console.log('error:', error)
  })
}