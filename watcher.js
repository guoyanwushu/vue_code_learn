/**
 *
 */
// 伪构造函数
function Vue(options) {
    this.options = options;
    addListener(this,options.data);
}
// 添加监视器
function addListener(vm,options) {
    var data = options.data;
    for (var key in data) {
        Object.defineProperty(data,'key',{
            configurable:false,
            enumerable:true,
            get: function() {
                return vm[key];
            },
            set: function(newval) {
                // 通知监视器
                watcher(key,newval);
                wm[key] = newval;
            }
        })
    } 
}
// 监视器
function watcher(key,val) {
    // 自身维护一个对应的变量数组
    var latestSet = [];
    if (latestSet[key]!=val) {
        latestSet[key] = val;
        // 检测到数据变化,需要更新视图  也不能立即就调用视图刷新 ，如果一定定时器1s内改了10000次，结果又变成最初始的值,那不是要去渲染一万次，还没渲染完数据又变了。所以应该加一个限制，把数据推到一个队列里，等
        // 队列里的数据到了一定规模后整体刷新。
        updateView(latestSet);
    }
}
// 视图更新器
function  updateView(dataset) {
    // 根据最新的变量值,生成对应的新的文档片段
}
var Vue = function (options) {
    this.init(options.el,options.data);
}
Vue.prototype  = {
    init: function (dom,data) {
        var virtuldom = this.createFragment(dom);

    },
    // 生成虚拟dom
    createFragment: function (dom) {
        var docE = document.createDocumentFragment(),
            child;
        while (child = dom.firstChild) {
            docE.appendChild(child);
        }
        return docE;
    },
    compileTemp: function (vdom) {
        var childnodes = vdom.childNodes;
        [].slice.call(childnodes).forEach(dom) {
            if (dom.nodeType==1) {
                // 编译元素节点
            }
            else if(dom.nodeType==3){
                // 编译文本节点
            }
        }
    },
    compileEleNode: function (node,vm) {
        var attrs = node.attributes;
        // 针对可输入框的绑定指令
        [].slice.call(attrs).forEach( function (attr) {
            var attrReg  = /^[:|v-bind:](\w?)$/,
                eventReg = /^[@|v-on:](\w?)$/;
            if (attr.name.test(attrReg)) {
                node.setAttribute(RegExp.$1,vm[attr.value]);
            }
            if (attr.name.test(eventReg)) {
                node.addEventListener(RegExp.$1,function () {
                    vm[attr.name]();
                },false)
            }
            if (node.childNodes&&node.childNodes.length!=0) {
                var child;
                while (child = node.childNodes) {
                    this.compileTemp(node,vm);
                }
            }
        })

    },
    // 编译文本节点
    compileTextNode: function (dom,vm) {
        var nodeValue = dom.textContent,
            reg = /\{\{\w*\}\}/;
        if (reg.test(nodeValue)) {
            dom.textContent = nodeValue.replace(reg,vm[RegExp.$1]);
        }
    }
}
