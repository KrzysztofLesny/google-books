document.addEventListener('DOMContentLoaded', function () {

    const searchField = document.getElementById('searchField');
    const searchButton = document.getElementById('searchButton');
    const loading = document.getElementById('loading');
    const books = document.getElementById('books');
    let searchIndex = 0;
    let totalResults = 0;
    let maxResults = 10;
    
    
    const comm = (commText, errorClass = ``) => {
        let message = document.createElement(`div`);
        message.innerHTML = `<h2 class="books__comm ${errorClass}">${commText}</h2>`;
        books.appendChild(message);
    }
    
    const isCorrectInput = () => {
        let invalidChar = /[\\\@\:\?\!\&\£\$\#\~\<\>\^\=\;\(\)\{\}\[\]]+/gi
        if (!invalidChar.test(searchField.value)) {
            return true;
        } else {
            comm(`Invalid character. The following characters are invalid: \ @ : ? ! & £ $ # ~ < > ^ = ; ( ) { } [ ] `, `books__comm--error`);         
        }
    }
    
    const showBook = book => {
        let {title, description} = book.volumeInfo;
        description = description ? description : 'No description available';
        description = description.length < 200 ? description : `${description.substr(0, description.indexOf(" ", 200))}...`;
        
        let {thumbnail} = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks : ``;
        thumbnail = thumbnail ? thumbnail : `./img/placeholder.png`;
        
        let newBook = document.createElement(`div`);
        newBook.classList.add('book');
        newBook.innerHTML = `<img src="${thumbnail}" class="book__cover"/> <h2 class="book__title">${title}</h2><p class="book__description">${description}</p>`;
        books.appendChild(newBook);
    }
    
    const continueSearch= () => {
        let bottom = books.offsetHeight - window.innerHeight + 50;
        let scrolled = document.documentElement.scrollTop;
        if (bottom === scrolled) {
            getBooks()
        }
    }

    const getBooks = () => {
        let searchfor = searchField.value.length>0 ? searchField.value : "empty space";
        let url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${searchfor}&maxResults=${maxResults}&fields=totalItems,items(volumeInfo/title,volumeInfo/description,volumeInfo/imageLinks/thumbnail)`;
        fetch(url).then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                return Promise.reject(response);
            }
        }).then(response => {
            totalResults = response.totalItems;
            loading.classList.add('container__loader--hidden');
            if (totalResults > 0){
                bookList = response.items;
                bookList.forEach(showBook);
                if (maxResults < 10) {
                    comm(`End of Search`);
                    document.removeEventListener('scroll', continueSearch);
                }
                searchIndex += 1;
                maxResults = (totalResults - searchIndex*10) < 10 ? (totalResults - searchIndex*10) : 10;
            } else {
                comm(`No results found.`);
            }
        }).catch(error => {
            loading.classList.add('container__loader--hidden');
            if (error.status === 404) {
                comm(`404 Error: incorrect url`, `books__comm--error`);
            } else if (error.status === 500) {
                comm(`500 Error: Server error`, `books__comm--error`);
            } else if (error.status === 400) {
                comm(`400 Error: Invalid field selection`, `books__comm--error`);
            } else {
                comm(`Unspecified error occured.`, `books__comm--error`)
            }
        })
    }
    
    // event listeners
    
    searchButton.addEventListener('click', function () {
        books.innerHTML = '';
        maxResults = 10;
        searchIndex = 0;
        if (isCorrectInput()) {
            loading.classList.remove('container__loader--hidden');
            document.addEventListener('scroll', continueSearch);
            getBooks()
        }
    });
    
    searchField.addEventListener('keyup', function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            searchButton.click();
        }
    });
});
