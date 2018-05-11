function Watcher(vm,node,updateFun,text) {
    Dep.target = null;
    console.log("初始化绑定watcher");
    console.log(node)
    this.vm = vm;
    this.node = node;
    this.text = text;
    this.updateFun = updateFun;
    Dep.target = this;
}
Watcher.prototype = {
    get: function(vm,key) {
        console.log("触发watcher-get");
        Dep.target = this;
        var value = vm[key];
        Dep.target = null;
    },
    update:function() {
        var self = this;
        console.log(self.node);
        console.log(self.updateFun);
        self.updateFun(self.node,this.text,this.vm);
    }
}