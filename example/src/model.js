definer(['./event.js', './user.js'], function (event, user, require, module) {
    console.log(require('./event.js').click)
    const e = {
        btn: document.querySelector('button'),
        input: document.querySelector('input'),
        ul: document.querySelector('ul'),
        setItem(text) {
            const li = document.createElement('li');
            li.innerText = `${text} - created by ${user.getUser()}`;
            this.ul.appendChild(li);
        },
        init() {
            this.btn.addEventListener('click', event.click)
        }
    }
    return e;
})