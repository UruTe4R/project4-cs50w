// TODOS
// Follow and Unfollow
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
  document.querySelector('#all-posts').addEventListener('click', () => {
    loadPosts()
  })
  document.querySelector('#following').addEventListener('click', () => {
    loadFollowing()
  })
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

function loadPosts(page=1) {
  console.log('loadPosts')
  // Only Show All Posts
  post_view.style.display = 'block'
  following_view.style.display = 'none'
  profile_view.style.display = 'none'

  document.querySelector('#posts').innerHTML = ''
  // Fetch to Load Posts
  fetch('/posts')
  .then(response => response.json())
  .then(post_info => {
    console.log('posts:', post_info)
    const username = post_info["user"]
    const paginated_posts = post_info["paginated_posts"]
    const posts = paginated_posts[`page${page}`]["post_list"]
    const page_n = Object.keys(paginated_posts).length
    // By default render first page
    posts.forEach(post => {
      createPost(post, '#posts', username)
    })
    // Add pagination
    add_pagination('#posts', page, loadPosts, page_n)
  })
  .catch(error => {
    console.log('error:', error)
  })
}


function loadFollowing(page=1) {
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
    const paginated_posts = following["paginated_posts"]
    const posts = paginated_posts[`page${page}`]["post_list"]
    const page_n = Object.keys(paginated_posts).length
    console.log('posts:', posts)
    posts.forEach(post => {
      createPost(post, '#following-content')
    })
    add_pagination('#following-content', page, loadFollowing, page_n)
  })

}

function loadProfile(usernameArg='', page=1) {
  // if there is not usernameArg, user is visiting their own profile

  console.log('loadProfile')
  post_view.style.display = 'none'
  following_view.style.display = 'none'
  profile_view.style.display = 'block'

  document.querySelector('#profile-content').innerHTML = ''
  document.querySelector('#profile-posts').innerHTML = ''
  let url = usernameArg == '' ? '/profile' : `/profile/${usernameArg}`

  // Get csrf_token
  const csrf_token = document.querySelector("[name=csrfmiddlewaretoken]").value
  
  // Fetch to Get User Info
  fetch(url)
  .then(response => response.json())
  .then(profile => {
    const username = profile["user_info"]["username"]
    const following = profile["following"]
    console.log("following:", following)

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

    } else {

      // create follow button
      const follow_button = document.createElement('button')
      follow_button.classList.add('follow_button', 'btn')
      if (following) {
        follow_button.classList.add('btn-outline-danger')
        follow_button.innerHTML = 'Unfollow'
      } else {
        follow_button.classList.add('btn-outline-success')
        follow_button.innerHTML = 'Follow'
      }
      
      // follow feature
      follow_button.addEventListener('click', () => {
        console.log('usernameArg:', usernameArg)
        fetch(`/follow/${usernameArg}`, {
          method: 'PUT',
          headers: {
            "X-CSRFToken": csrf_token
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data["message"]) {
            console.log(data["message"])
            loadProfile(usernameArg)
          } else {
            console.log(data["error"])
          }
        })
        .catch(error => {
          console.log('error:', error)
        })
      })
      edit_button_container.append(follow_button)
    }

    profile_header.append(profile_DOM["profile-username"], edit_button_container)
    profile_container.append(profile_header, profile_DOM["profile-introduction"])
    profile_DOM["profile-follows"].innerHTML = `follows ${profile["user_info"]["follows"]}`
    profile_DOM["profile-followers"].innerHTML = `followers ${profile["user_info"]["followers"]}`

    profile_follow_container.append(profile_DOM["profile-follows"], profile_DOM["profile-followers"])
    profile_container.append(profile_follow_container)
    document.querySelector('#profile-content').append(profile_container)

    // Create User's Posts and Render
    const paginated_posts = profile["paginated_posts"]
    const posts = paginated_posts[`page${page}`]["post_list"]
    const page_n = Object.keys(paginated_posts).length
    posts.forEach(post => {
      if (usernameArg) {
        createPost(post, "#profile-posts")
      } else {
        createPost(post, "#profile-posts", username)
      }
      
    })

    add_pagination('#profile-posts', page, loadProfile, page_n)
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
}
function add_pagination(target_DOM_id, current_page_n=1, render_function, number_of_pages) {
  console.log('add_pagination', target_DOM_id, current_page_n, render_function, number_of_pages)
  
  // add pagination
  nav = document.createElement('nav')
  nav.setAttribute('aria-label', 'Page navigation')
  nav.classList.add('pagination_container')
  ul = document.createElement('ul')
  ul.classList.add('pagination')
  nav.append(ul)
  document.querySelector(target_DOM_id).append(nav)

  // add previous button to ul
  li = document.createElement('li')
  li.classList.add('page-item')
  a_before = document.createElement('a')
  a_before.classList.add('page-link')
  a_before.setAttribute('href', `#`)
  a_before.innerHTML = 'Previous'
  a_before.addEventListener('click', () => {
    if (current_page_n > 1) {
      const new_page_n = current_page_n - 1
      render_function(new_page_n)
    } 
  })
  // page does not go further
  if (current_page_n === 1) {
    li.classList.add('disabled')
  }
  li.append(a_before)
  ul.append(li)

  // add page numbers to ul
  for (let i = 0; i < number_of_pages; i++) {
    li = document.createElement('li')
    li.classList.add('page-item')
    if (i + 1 == current_page_n) {
      li.classList.add('active')
    }
    a = document.createElement('a')
    a.classList.add('page-link')
    a.setAttribute('href', `#`)
    a.innerHTML = i + 1
    a.addEventListener('click', () => {
      const new_page_n = i + 1
      render_function(new_page_n)
    })
    li.append(a)
    ul.append(li)
  }

  // add next button to ul
  li = document.createElement('li')
  li.classList.add('page-item')
  a_after = document.createElement('a')
  a_after.classList.add('page-link')
  a_after.setAttribute('href', `#`)
  a_after.innerHTML = 'Next'
  a_after.addEventListener('click', () => {
    if (current_page_n < number_of_pages) {
      const new_page_n = current_page_n + 1
      render_function(new_page_n)
    }
  })
  // page does not go further
  if (current_page_n === number_of_pages) {
    li.classList.add('disabled')
  }
  li.append(a_after)
  ul.append(li)

}