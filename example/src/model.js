definer(['./event.js', './user.js'], function (require, module) {
    const [event, user] = require.imports;
    require('./event.js')
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
    module.exports = e;
})