/**
 *
 */
function watcher(key,val) {
    // 自身维护一个对应的变量数组
    var latestSet = [];
    if (latestSet[key]!=val) {
        latestSet[key] = val;
        // 检测到数据变化,需要更新视图
        updateView(latestSet);
    }
}
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
                var reg = /\{\{\w*\}\}/;
                if(resg)


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
                    vm[attr.name];
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
    compileTextNode: function (dom,vm) {
        var nodeValue = dom.textContent,
            reg = /\{\{\w*\}\}/;
        if (reg.test(nodeValue)) {
            dom.textContent = nodeValue.replace(reg,vm[RegExp.$1]);
        }

    }
}