import Search from './modules/search'
import Chat from './modules/chat'


if(document.querySelector("#chat-wrapper")){ new Chat() }

// search icon exits than run new search
if(document.querySelector(".header-search-icon")){ new Search() }


