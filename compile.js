
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
            if(dom.childNodes) {
                new Compile(dom,vm);
            } 
        }
        else if(dom.nodeType==3){
            self.compileTextNode(dom,vm);
            
        }
    })
}
Compile.prototype = {
    isElementNode: function(node) {
        return node.nodeType==1?true:false;
    },
    compileTextNode: function(node,vm) {
        var text = node.nodeValue,
            reg = /\{\{(.*)\}\}/;
        var vim = vm;
        console.log(reg.test(text));
        if (reg.test(text)) {
            console.log(vm,RegExp.$1,vm[RegExp.$1]);
            text = text.replace(reg,vm[RegExp.$1]);
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
