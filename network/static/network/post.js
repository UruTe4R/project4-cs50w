// TODOS
// Render following posts
// liking feature
// comment feature
// UI when hovered over follows and followers 
// Edit profile
//  //

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
  document.querySelector('#username').addEventListener('click', () => {
    loadProfile()
  })

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

  document.querySelector('#posts').innerHTML = ''
  // Fetch to Load Posts
  fetch('/posts')
  .then(response => response.json())
  .then(posts => {
    console.log('posts:', posts)
    const username = posts["user"]
    posts["post_list"].forEach(post => {
      createPost(post, '#posts', username)
    })
  })
}


function loadFollowing() {
  console.log('loadFollowing')
  post_view.style.display = 'none'
  following_view.style.display = 'block'
  profile_view.style.display = 'none'

  document.querySelector('#following-content').innerHTML = ''

  // Fetch to Load Following User's Posts
  fetch('/following')
  .then(response => response.json())
  .then(following => {
    console.log('following:', following)
    following["posts"].forEach(post => {
      createPost(post, '#following-content')
    })
  })

}

function loadProfile(usernameArg='') {
  console.log('loadProfile')
  post_view.style.display = 'none'
  following_view.style.display = 'none'
  profile_view.style.display = 'block'

  document.querySelector('#profile-content').innerHTML = ''
  document.querySelector('#profile-posts').innerHTML = ''
  // ForTest
  console.log('usernameArg:', usernameArg)
  let url = usernameArg == '' ? '/profile' : `/profile/${usernameArg}`
  console.log('url:', url)
  // Fetch to Get User Info
  fetch(url)
  .then(response => response.json())
  .then(profile => {
    // For TEST
    console.log('profile:', profile)
    console.log(profile["user_info"])
    console.log(profile["user_info"]["username"], profile["user_info"]["follows"], profile["user_info"]["followers"])
    const username = profile["user_info"]["username"]

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
      div.innerHTML = profile["user_info"][element]
      profile_DOM[`profile-${element}`] = div
    })

    // create edit button if current user is the user accessing
    const edit_button_container = document.createElement('div')
    if (!usernameArg) {
      const edit_button = document.createElement('button')
      edit_button.classList.add('edit_button', 'btn', 'btn-outline-primary')
      edit_button.innerHTML = 'Edit'
      edit_button_container.append(edit_button)
    }

    profile_header.append(profile_DOM["profile-username"], edit_button_container)
    profile_container.append(profile_header, profile_DOM["profile-introduction"])
    profile_DOM["profile-follows"].innerHTML = `follows ${profile["user_info"]["follows"]}`
    profile_DOM["profile-followers"].innerHTML = `followers ${profile["user_info"]["followers"]}`

    profile_follow_container.append(profile_DOM["profile-follows"], profile_DOM["profile-followers"])
    profile_container.append(profile_follow_container)
    document.querySelector('#profile-content').append(profile_container)

    // Create User's Posts and Render
    profile["posts"].forEach(post => {
      const poster = post["poster"]
      const content = post["content"]
      const likes = post["likes"]
      const timestamp = post["timestamp"]
      // For TEST
      console.log(poster, content, likes, timestamp)

      if (usernameArg) {
        createPost(post, "#profile-posts")
      } else {
        createPost(post, "#profile-posts", username)
      }
      
    })

  })
  .catch(error => {
    console.log('error:', error)
  })
}

function createPost(post, target_DOM_id, username='') {
  const id = post["id"]
  const poster = post["poster"]
  const content = post["content"]
  const likes = post["likes"]
  const liked = post["liked"]
  const timestamp = post["timestamp"]
  // For TEST
  console.log(id ,poster, content, likes, timestamp)

  // div.post_container>div.poster+button.edit-button+div.post-content+div.post-timestamp+div.post-likes+div.post-comment

  // Get csrf_token from input tag in html
  const csrf_token = document.querySelector('[name=csrfmiddlewaretoken]').value

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

  // Add EventListener to USERNAME, enable profile page
  elements["post_poster"].addEventListener('click', () => {
    loadProfile(poster)
  })
  // Change like button color
  change_button_color(elements["post_likes"], 'black', 'red', liked)

  // Add EventListener to post_likes, enable like/unlike
  elements["post_likes"].addEventListener('click', () => {
    
    // fetch and toggle like
    fetch(`like/post/${id}`, {
      method: 'PUT',
      headers: {
        "X-CSRFToken": csrf_token
      }
    })
    .then(response => response.json())
    .then(result => {
        elements["post_likes"].innerHTML = `&#9829;${result["new_likes"]}`
        // toggle color
        change_button_color(elements["post_likes"], 'black', 'red', result["liked"])
      if (result["error"]){
        console.log('error:', result["error"])
      }
    })
    .catch(error => {
      console.log('error:', error)
    })

  })

  const button_wrapper = document.createElement('div')
  button_wrapper.classList.add('button_wrapper')

  // Add Edit Button if poster is the user
  if (username == poster) {
    const edit_button = document.createElement('button')
    edit_button.classList.add('edit_button', 'btn', 'btn-outline-primary')
    edit_button.innerHTML = 'Edit'
    button_wrapper.append(edit_button)
    edit_button.addEventListener('click', () => {
      // clear innerHTML
      const before = elements["post_content"].innerHTML
      elements["post_content"].innerHTML = ''
      // show edit form to user
      const edit_form = document.createElement('textarea')
      edit_form.classList.add('form-textarea')
      edit_form.id = 'edit-form'
      edit_form.value = before
      // change edit button to save button
      edit_button.remove()
      const save_button = document.createElement('button')
      save_button.classList.add('save_button', 'btn', 'btn-outline-success')
      save_button.innerHTML = 'Save'
      button_wrapper.append(save_button)
      // if save button is clicked, fetch and update post
      save_button.addEventListener('click', () => {
        
        fetch(`/edit/post/${id}`, {
          method: 'PUT',
          headers: {
            'X-CSRFToken': csrf_token
          },
          body: JSON.stringify({
            content: edit_form.value
          })
        })
        .then(response => response.json())
        .then(result => {
          // apply change to post view
          if (result["message"]) {
            console.log(result["message"])
            elements["post_content"].innerHTML = edit_form.value
          } else {
            console.log(result["error"])
            elements["post_content"].innerHTML = before
          }
        })
        .catch(error => {
          console.log('error:', error)
        })
        
        // after done editing, change save button to edit button
        save_button.remove()
        button_wrapper.append(edit_button)
      })

      elements["post_content"].append(edit_form)
    })
  }

  // Append everythihn to render
  post_header.append(elements["post_poster"], elements["post_timestamp"], button_wrapper)
  post_container.append(post_header, elements["post_content"])

  post_footer.append(elements["post_comment"], elements["post_likes"])
  post_container.append(post_footer)
  document.querySelector(target_DOM_id).append(post_container)
}

function change_button_color(HTMLelement, b_color, a_color, bool) {
  if (bool) {
    HTMLelement.style.color = a_color
  } else {
    HTMLelement.style.color = b_color
  }
  console.log(`color changed to ${HTMLelement.style.color}`)
}