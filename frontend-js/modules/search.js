import axios from 'axios'
import domPurify from 'dompurify'
export default class Search{
    // 1. select DOM element
    constructor(){
    
        this.injectHTML()
        // select search icon
        this.headerSearchIcon = document.querySelector(".header-search-icon")
        // search overlay
        this.overlay = document.querySelector(".search-overlay")
        // close icon
        this.closeIcon = document.querySelector(".close-live-search")
        // searchfield
        this.inputField = document.querySelector("#live-search-field")
        // result area
        this.resultsArea = document.querySelector(".live-search-results")
        // animated loaderIcon
        this.loaderIcon = document.querySelector(".circle-loader")

        this.typingWaitTimer
        this.previousValue = ""


        // invoke events
        this.events()
        
    }

    //2. events
  events(){
       // caputure click even on search icon
       this.headerSearchIcon.addEventListener("click", (e)=>{
           e.preventDefault()
           this.openOverlay()

       })

       this.closeIcon.addEventListener("click", (e)=> this.closeOverlay())
       // keyup means as soon as user lift finger up the key
       this.inputField.addEventListener("keyup", ()=> this.keyPressHandler() )
   }

  // 3. Methods

  /**
   * keyPressHandler() 
   *    will execute with every stroke of button. since there is timer set, itll wait till that time hit before sending a search request
   *  cleanTimeout() 
   *    clears the typingWaitTimer
   */
  keyPressHandler(){
    // fetch value from search bar
    let value = this.inputField.value

    if(value == ""){
      clearTimeout(this.typingWaitTimer)
      this.hideLoaderIcon()
      this.hideResultArea()
    }

    if(value != "" && value != this.previousValue){
      clearTimeout(this.typingWaitTimer)
      this.showLoaderIcon()
      this.hideResultArea()
      this.typingWaitTimer = setTimeout(() => this.sendRequest(), 750);
    }
    this.previousValue = value

   }
   // axios send a post request to search url
  sendRequest(){
    // data to following url

    axios.post('/search', {searchTerm: this.inputField.value}).then(response=>{
      console.log(response.data)
      this.renderResultsHTML(response.data )
    }).catch(()=>{alert("request failed")})
  }

  renderResultsHTML(posts){
    if(posts.length){
      this.resultsArea.innerHTML = domPurify.sanitize(`<div class="list-group shadow-sm">
        <div class="list-group-item active"><strong>Search Results</strong> ${posts.length > 1 ? `${posts.length} items found!` : "1 item found!"}</div>
        ${posts.map((post)=>{
          let postDate = new Date(post.createdDate)
          return ` <a href="/post/${post._id}" class="list-group-item list-group-item-action">
          <img class="avatar-tiny" src="${post.author.avatar}"> <strong>${post.title}</strong>
          <span class="text-muted small">by ${post.author.username} on ${postDate.getMonth() + 1}/${postDate.getDate()}/${postDate.getFullYear()}</span>
        </a>`
        }).join()}
      </div>`)
    } else{
      this.resultsArea.innerHTML = `<p class="alert alert-danger text-center shadow-sm"> Sorry , we couldnt find any result.</p>`
    }

    this.hideLoaderIcon()
    this.showResultArea()
  }

  showResultArea(){

  }
  
  // make visible loader icon
  showLoaderIcon(){
     this.loaderIcon.classList.add("circle-loader--visible")
  }

  hideLoaderIcon(){
    this.loaderIcon.classList.remove("circle-loader--visible")
  }

  showResultArea(){
    this.resultsArea.classList.add("live-search-results--visible")
  }
  hideResultArea(){
    this.resultsArea.classList.remove("live-search-results--visible")
  }


  // search overlay
  openOverlay(){
        this.overlay.classList.add("search-overlay--visible")
        // this will wait for 50 miliseconds before running
        setTimeout(()=> this.inputField.focus(), 50) 
  }

  closeOverlay(){
       this.overlay.classList.remove("search-overlay--visible")
  }

  injectHTML(){
       // insert html into
      document.body.insertAdjacentHTML('beforeend', `
      <!-- search feature begins -->
      <div class="search-overlay">
        <div class="search-overlay-top shadow-sm">
          <div class="container container--narrow">
            <label for="live-search-field" class="search-overlay-icon"><i class="fas fa-search"></i></label>
            <input type="text" id="live-search-field" class="live-search-field" placeholder="What are you interested in?">
            <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
          </div>
        </div>
    
        <div class="search-overlay-bottom">
          <div class="container container--narrow py-3">
            <div class="circle-loader"></div>
            <div class="live-search-results"></div>
          </div>
        </div>
      </div>
      <!-- search feature end -->`)
   }


}