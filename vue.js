function Vue(options) {
    var tar = document.querySelector(options.el);
    Observe(this,options.data);
    OberveEvent(this,options.methods);
    console.log(this);
    nodeToFragment(tar,this);
}
var app = new Vue({
    el:"#app",
    data:{
        name:"Yao Ming",
        country: "China",
        ohref:"http://wwww.baidu.com",
        sex:{
            boy:'boy',
            year:{
                big:19
            }
        },
        title:"hello testing",
        class:'happy',
        flag:"hello"
    },
    methods:{
        alert:function () {
            alert("hello bind ok");
        }
    }
})