/**
 * 辅助dom解析编译的部分，有点基础知识点没整牢固，所以整个编译解析部分都整得不好。借此补一下dom的相关基础知识。
 * 1.childNodes (是包含空白文本节点的，只遍历一层，包括firstChild lastChild 都是从包含空白节点算起的)
 * 2.parentNode.appendChild(newNode) 添加一个子节点   parentNode.insertBefore(newNode,targetNode) 在targetNode节点前面插入一个子节点 parentNode.removeChild(childNode) 移除一个子节点
 *   parentNode.replace(newNode, targetNode);   将目标节点替换为新的节点。 node.cloneNode(boolean) true表示复制该节点下的所有子节点,false表示只复制该节点本身。
 *   注意:如果是appendChild文档自身已经有的节点,那么该节点就会从原文档里被删除，添加到当前节点后面。
 * */
function nodeToFragment(dom,vm) {
    var child,
        fragment = document.createDocumentFragment();
    while (child = dom.firstChild) {
        fragment.appendChild(child);
    } 
    
    new Compile(fragment,vm);
    console.log(fragment);
    dom.appendChild(fragment);
}
function Compile(node,vm) {
    var self = this;
    var childNodes = node.childNodes;
    [].slice.call(childNodes).forEach(function(dom) {
        if(self.isElementNode(dom)) {
            new Compile(dom,vm);            //检测是否有vue属性 v-bind v-model v-on v-class v-src 等等,如果有都要进行转换,同时也要绑定更新函数卧槽
        }
        else if(dom.nodeType==3){
            self.compileTextNode(dom,vm);   //初始化进行文本替换，然后还要绑定更新函数。
            
        }
    })
}
Compile.prototype = {
    isElementNode: function(node) {
        return node.nodeType==1?true:false;
    },
    compileTextNode: function(node,vm) {
        var text = node.nodeValue, // 单纯对文本节点来说nodeValue 和 textContent 基本是一样的
            reg = /\{\{(.*?)\}\}/g;
        var vim = vm;
        //debuggers
        console.log(reg.test(text));
        if (reg.test(text)) {
            // 有几个情况
            // 1.文本本身不止一个{{}}  比如  my name is {{name}},i come from {{country}}
            // 2. {{}}不只单纯是变量 ，可能是简单或者复杂的表达式 比如 {{name+"John"}} {{name.toUpperCase()}} {{name|filterName}}
            console.log(vm,RegExp.$1,vm[RegExp.$1]);
            text = text.replace(/\{\{(.*?)\}\}/g,function (all,p1) { return vm[p1]});
            // 正则提取 好像不太行，正则提取要考虑太多规则了
            var reg = /([a-zA-Z_]\w*)[\+\-\*%\/\|]/
            node.nodeValue = text;   
        }
        else 
            return
        new Watcher(vm,node,RegExp.$1,updateText);
        
    }

}
function updateText(node,newval,oldval) {
    console.log("更新准备");
    console.log(node.nodeValue);
    if(newval === oldval)
        return
    else {
        node.nodeValue = newval;
        
    }
}
