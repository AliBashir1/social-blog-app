import axios from 'axios'
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

    if(value != "" && value != this.previousValue){
      clearTimeout(this.typingWaitTimer)
      this.showLoaderIcon()
      this.typingWaitTimer = setTimeout(() => this.sendRequest(), 3000);
    }
    this.previousValue = value

   }
   // axios send a post request to search url
  sendRequest(){
    // data to following url
    axios.post('/search', {searchTerm: this.inputField.value}).then(()=>{}).catch(()=>{alert("request failed")})
  }
  
  // make visible loader icon
  showLoaderIcon(){
     this.loaderIcon.classList.add("circle-loader--visible")
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
            <div class="live-search-results">
              <div class="list-group shadow-sm">
                <div class="list-group-item active"><strong>Search Results</strong> (4 items found)</div>
    
                <a href="#" class="list-group-item list-group-item-action">
                  <img class="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128"> <strong>Example Post #1</strong>
                  <span class="text-muted small">by barksalot on 0/14/2019</span>
                </a>
                <a href="#" class="list-group-item list-group-item-action">
                  <img class="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128"> <strong>Example Post #2</strong>
                  <span class="text-muted small">by brad on 0/12/2019</span>
                </a>
                <a href="#" class="list-group-item list-group-item-action">
                  <img class="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128"> <strong>Example Post #3</strong>
                  <span class="text-muted small">by barksalot on 0/14/2019</span>
                </a>
                <a href="#" class="list-group-item list-group-item-action">
                  <img class="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128"> <strong>Example Post #4</strong>
                  <span class="text-muted small">by brad on 0/12/2019</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- search feature end -->`)
   }


}