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
            self.compileElementNode(dom,vm);
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
    /*
    * 哈哈  一下午就把元素节点编译写得七七八八了，效果还不错的样子 有几个点要注意一下：
    * 正则真的是神器 ， 灵活运用正则带来的好处简直不能想象 ，比如 v-bind:src = "linkSrc" 要取指令类型(bind),取属性名(src),取属性值(linkSrc)，而且三个值都是不定的，如果不会用正则，光是这个地方
    * 怕是都要憋破头哈哈。 如果会正则就是一句话的事情，真的是神器！
    *
    * 原生js节点的属性和方法一定要熟悉，写框架是不能再去用jquery依赖的，不然光是大小就是个不合格的框架（除非是明确依赖jquey进行开发的，不过那种东西叫插件更合适）。
    * model 是实现双向绑定的指令，其实也简单的，为model的值绑watcher，然后为可输入框绑定change更新函数更新model的值。
    * 然后绑事件的oberve和属性observe还是稍微有点不一样的，大多数情况下事件项都是只读，而且事件项的值类型是函数，并不适合Object.defineProperty这种绑定方法，直接遍历挂载到vm实例上就好了。
    * v-if v-else v-for v-show v-hidden  还没有进行处理 ， v-class 表达式的情况也没有进行处理。
    * v-if 和 v-else 甚至和 v-else-if 都属于联动的情况，这个要咋个处理呢，得好好想一想了。
    * */
    compileElementNode: function (node,vm) {
        var self = this;
        //只关注节点本身的，后续的子节点前面遍历过 v-on v-bind v-class v-if v-else v-else-if v-for  v-model
        var attrs = node.attributes;
        var showFlag = true;
        var showText;
        /*
        *   如果有v-if 并且 还为false 要不要进行属性编译呢？ 还是要的吧，因为编译过程只有一次，如果因为v-if不编译,那后面v-if动态设置为真的时候,整个节点都处于为编译的状态，是错误的
        *   要么就把当前节点提取出来设置一个单独的编译过程，然后v-if为真的时候去动态编译节点。
        *   要么就直接全编译，通过display来响应v-if的动态变化。
        *   好像上面两个选择分别对应了 v-if 和 v-show啊 ,那就先实现一个再说
        * */
        [].slice.call(attrs).forEach(function (attr) {
            var attrName = attr.name;
            var attrVal = attr.value;
            var reg1 = /v-model/,
                reg2 = /:(.+)/,
                reg3 = /@(.+)/,
                showReg = /v-(if|show|hide)/,
                result;
            if(result = attrName.match(/v-model/)) {
                self.tagDeal(node,'model','model',attrVal,vm,attrName)
            }
            else if(result = attrName.match(reg2)) {
                self.tagDeal(node,"bind",result[1],attrVal,vm,attrName);
            }
            else if(result = attrName.match(reg3)) {
                self.tagDeal(node,"on",result[1],attrVal,vm,attrName);
            }
            else if(result = attrName.match(/^v-(\w+):(\w+)$/)) {
                self.tagDeal(node,result[1],result[2],attrVal,vm,attrName);
            }
            else if(result = attrName.match(showReg)) {
                var type = result[1];

                console.log("DDDDDDDDDDDDDDDDDD:"+type);
                if(type=="if"||type=="show") {
                    new Watcher(vm,node,updateDomShow,attrVal);
                    with(vm) {
                        showFlag = Boolean(eval(attrVal))?true:false;
                    }
                }
                else if(type=="hide") {
                    new Watcher(vm,node,updateDomHide,attrVal);
                    with(vm) {
                        showFlag = Boolean(eval(attrVal))?false:true;
                    }
                }
                Dep.target = null;
            }
        })
        if(!showFlag) {
            node.style.display = "none";
        }
    },
    tagDeal: function (node,type,name,value,vm,attrName) {
        switch(type) {
            case "on": {
                node.addEventListener(name,function () {
                    vm[value]();
                })
            };break;
            case "bind":{
                // 类要单独处理下，因为类的值要和原class的值共存
                if(name==="class") {
                    console.log(node.className);
                    node.className = node.className+" "+vm[value];
                }
                else {
                    node.setAttribute(name,vm[value]);
                }
            };break;
            case "model":{
                new Watcher(vm,node,updateInput,value);
                node.value = vm[value];
                Dep.target = null;
                node.addEventListener("change",function (event) {
                    vm[value] = event.target.value;
                });
            };break;
        }
        node.removeAttribute(attrName);
    },
    compileTextNode: function(node,vm) {
        // !!过滤器的情况还没有进行处理哦,而且过滤器本身是要自己定义的，这个里面逻辑要想一想
        var text = node.nodeValue, // 单纯对文本节点来说nodeValue 和 textContent 基本是一样的
            reg = /\{\{(.*?)\}\}/g;
        var vim = vm;
        var targetText,domArray=[];
        if (reg.test(text)) {

            // 有几个情况
            // 1.文本本身不止一个{{}}  比如  my name is {{name}},i come from {{country}}
            // 2. {{}}不只单纯是变量 ，可能是简单或者复杂的表达式 比如 {{name+"John"}} {{name.toUpperCase()}} {{name|filterName}}
            // ？？？3. 考虑用with 结合 eval的做法，倒是实现了所有需要的功能，但是又有个安全问题，没有对{{}}里面可能出现的危险性代码做处理。对比了一下vue原生的，貌似也没有做处理丫。这个问题先放着。
            targetText = text.replace(/\{\{(.*?)\}\}/g,function (all,p1) {
                var c;
                domArray.push(p1);
                new Watcher(vm,node,updateText,text);
                with(vm){
                    c = eval(p1);
                    return c
                }
                Dep.target = null;
            });
            node.nodeValue = targetText;
        }
        else 
            return
        //这种新建watcher的方法也有问题的,如果一个文本片断有两个或者多个变量，那这种新建监视器的方法就是不生效的。
        /*
            单独提出来说一下，以前给文本节点帮 watcher 带 key 的做法是错误的，因为一段文本 比如 {{name.toUpperCase()+country}},首先这个表达式你要区分出来谁tm到底是key，谁是计算的函数就很难
            然后key拿不到,还想用以前get()的方法去触发observer的方法就失效了。另外考虑到 在用with(vm){eval(p1))的过程中，其实已经用到了vm[key],事实上也触发了get,所以这eval的过程中{{}}里面有几个data的变量
            其实都触发到了这些变量的get了，既然都触发了，在这之前设置好Dep.target ，在get的时候直接就绑上了，岂不美哉，省得去解析key。而且这个过程也更加理性，并没有多余的触发动作发生。
            事实上，key的更新导致的视图更新并不只有key，这里面同样要计算其他key的值的，比如name更新了，你得更新这个视图吧，然后更新你就得知道country的最新值，country的值你又去哪里拿呢？目前我的解决方案
            就是把这个{{}}里面的部分作为需要更新的一个整体，不管哪一个变量更新了，触发的都是这个整体的更新。既然是整体，所以updateText的传参就稍微有点变化，要把{{}}里面的部分和当前node，当前的vm作用域传过去
            变量更新直接就解析整个模板的值从而触发视图更新。
        */
        // domArray.forEach(function (value) {
        //     console.log("xxxxxxxxxxxx:"+value);
        //     new Watcher(vm,node,value,updateText);
        // })
    }

}
function updateText(node,text,vm) {
    console.log("更新准备");
    console.log(node.nodeValue);
    console.log(vm.name);
    //console.log(vm);
    var text = text.replace(/\{\{(.*?)\}\}/g,function (all,p1) { console.log(all,p1);var c;with(vm){c = eval(p1);return c}});
    console.log(text);
    node.textContent = text;
}
function updateInput(node,key,vm) {
    node.value = vm[key];
}
function  updateDomShow(node,text,vm) {
    console.log(node);
    var flag;
    with(vm) {

        flag = Boolean(eval(text));
        if(flag) {
            node.style.display = "block"
        }
        else {
            node.style.display = "none"
        }
    }
}
function  updateDomHide(node,text,vm) {
    console.log(node);
    var flag;
    with(vm) {

        flag = Boolean(eval(text));
        if(flag) {
            node.style.display = "none"
        }
        else {
            node.style.display = "block"
        }
    }
}
