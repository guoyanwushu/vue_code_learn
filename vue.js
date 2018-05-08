function Vue(options) {
    var tar = document.querySelector(options.el);
    Observe(this,options.data);
    nodeToFragment(tar,this);
}
var app = new Vue({
    el:"#app",
    data:{
        name:{
            big:'what happend'
        }
    }
})