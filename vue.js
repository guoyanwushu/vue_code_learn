function Vue(options) {
    var tar = document.querySelector(options.el);
    Observe(this,options.data);
    console.log(this);
    nodeToFragment(tar,this);
}
var app = new Vue({
    el:"#app",
    data:{
        name:"Yao Ming",
        country: "China",
        sex:{
            boy:'boy',
            year:{
                big:19
            }
        }
    }
})