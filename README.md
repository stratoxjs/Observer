# Observer
A super lightweight observer class.

### Usage
```js
let ob = new Observer($, ".wa-observe", 0.8);
ob.scroll(function() {
});

ob.observe(function() {
    console.log("In: www 1");
}, function() {
    console.log("Out: www 2");
});
```
