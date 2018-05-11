// Dep.target 是根据现有dom里,已存在的{{}}动态生成的，也就是说data里没有在页面里面用到的元素都没有绑定到的，但是compile又只执行了一次，所以这里面会不会有漏洞。
// 上诉问题暂不解决，vue自身也没有对后添加的{{}}dom片断做任何处理，理论上也不应该处理。

// 第二个问题是，data里面属性值又是对象的情况下，这个对象也要遍历的，不然不能触发 属性值里的值这种情况下的dom更新.所以其实要为每一个层级的每一个key绑定监视器。
// 好像有个问题没有整清楚。 set 和 get 都是取的别的值，那这个别的值到底应该是哪个值,参照源码，理论上应该是 给了 一个 vm._data 来保存options.data的值，get取的值也是vm._data,
// set 设的值也是vm._data
// !!!  通过变量取对象的值,加入 var key = "name";var obj = {name:"DAIVID"} 不能用 obj.key 而要用obj[key]
function Observe(vm,odata) {
    var data = vm._data = odata;
    Object.keys(data).forEach(function(key){
        var dep = new Dep();
        var self =this;
        if(typeof data[key] === "object") {
            vm[key] = {};
            Observe(vm[key],data[key]);
            return
        }
        else {
            Object.defineProperty(vm,key,{
                configurable:false,
                enumerable:true,
                get: function() {
                    console.log("触发get请求");
                    console.log(Dep.target);
                    if(Dep.target)
                        dep.add(Dep.target);

                    return vm._data[key];

                },
                set: function(newval) {
                    console.log("触发set请求");
                    if (vm._data[key]!==newval) {
                        /*
                            下面这两行代码的顺序也是有讲究的,设置新值一定要在前，否则如果先notify，notify的时候要去get最新的值，然后最新的值在notify之后才设置上，这时候notify拿到的
                            其实是旧的值，造成的结果就是没有渲染上最新值。
                         */
                        vm._data[key] = newval;

                        dep.notify(newval,vm._data[key]);
                    }
                }
            })
        }

}) 
}
function OberveEvent(vm,methods) {
    Object.keys(methods).forEach(function (event) {
        vm[event] = methods[event];
    })
}
function Dep(){
    // 为什么是一个数组大概了解了，因为一个变量可能绑定在文档多个节点处，这个变量更新了，所有和该变量关联的节点都必须更新。所以遍历deps执行更新操作就是这么来的。
    this.deps = [];
}
Dep.prototype = {
    add: function(dep) {
        this.deps.push(dep);
    },
    notify: function(newval) {
        console.log("收到订阅更新通知");
        console.log(this.deps);
        this.deps.forEach(function (sub) {
            console.log(sub.update);
            sub.update(newval);
        })
    }
}