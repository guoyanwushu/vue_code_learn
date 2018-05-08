function Watcher(vm,node,key,updateFun) {
    console.log("初始化绑定watcher");
    console.log(node)
    this.get(vm,key);
    this.node = node;
    this.updateFun = updateFun;
}
Watcher.prototype = {
    get: function(vm,key) {
        console.log("触发watcher-get");
        Dep.target = this;
        var value = vm[key];
        Dep.target = null;
    },
    update:function(newval,oldval) {
        var self = this;
        console.log(self.node);
        this.updateFun(self.node,newval,oldval);
    }
}