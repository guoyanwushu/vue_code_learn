function test(options){
    console.log(this.al)
    this.al(options.name);
}
test.prototype = {
    al:function(text){
        alert(text);
    }
}
