// Dep.target 是根据现有dom里,已存在的{{}}动态生成的，也就是说data里没有在页面里面用到的元素都没有绑定到的，但是compile又只执行了一次，所以这里面会不会有漏洞。
function Observe(vm,odata) {
    var data = this._data = odata;
    Object.keys(data).forEach(function(key){
        var dep = new Dep();
        var self =this;
        Object.defineProperty(vm,key,{
            configurable:false,
            enumerable:true,
            get: function() {
                console.log("触发get请求");
                console.log(Dep.target);
                if(Dep.target)
                    dep.add(Dep.target);
                return self._data[key];
                
            },
            set: function(newval) {
                // 通知监视器
                if (self._data[key]!==newval) {
                    dep.notify(newval,self._data[key]);
                    self._data[key] = newval;
                }             
            }
        })
}) 
}
function Dep(){
    this.deps = [];
}
Dep.prototype = {
    add: function(dep) {
        this.deps.push(dep);
    },
    notify: function(newval) {
        console.log("收到订阅更新通知");
        
        this.deps.forEach(function (sub) {
            console.log(sub.update);
            sub.update(newval);
        })
    }
}