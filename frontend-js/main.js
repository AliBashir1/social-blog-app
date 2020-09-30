import Search from './modules/search'
import Chat from './modules/chat'
import RegistrationFrom from './modules/RegistrationForm'


if(document.querySelector("#registration-form")){ new RegistrationFrom() }

if(document.querySelector("#chat-wrapper")){ new Chat() }

// search icon exits than run new search
if(document.querySelector(".header-search-icon")){ new Search() }


