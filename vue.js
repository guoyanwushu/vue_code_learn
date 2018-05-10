function Vue(options) {
    var tar = document.querySelector(options.el);
    Observe(this,options.data);
    nodeToFragment(tar,this);
}
var app = new Vue({
    el:"#app",
    data:{
        name:"Yao Ming",
        country: "China"
    }
})