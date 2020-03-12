function Tree(options = {}){
  this.client_options = options;
  
  this.origin_options = {
    scrollCenter : false,
    showDown : 1,
    closeOtherTrees : false
  };

  this.custom_options = this.origin_options;
  this.initOptions(options);

  this.vertical_class = 'vtree';
  this.show_class = 'active';

  this.trees = document.getElementsByClassName('tree');
  this.run();
}

Tree.prototype.initOptions = function(options){
  if (null === options || typeof options !== 'object') return;
  
  typeof options.scrollCenter === 'boolean' && 
  (this.custom_options.scrollCenter = options.scrollCenter);

  typeof options.showDown === 'number' && options.showDown > 0
  (this.custom_options.showDown = parseInt(options.showDown))
  
  typeof options.closeOtherTrees === 'boolean' &&
  (this.custom_options.closeOtherTrees = options.closeOtherTrees)
}

Tree.prototype.scrollCenter = function(tree){
  if (!this.custom_options.scrollCenter) return;
  var vtree = this.vertical_class;

  this.eachChildNodes(tree, function(node){
    if (node.nodeName === 'UL'){
      if (tree.classList.contains(vtree)){
        tree.scrollTop = Math.floor((node.offsetHeight - tree.offsetHeight) / 2);
      }
      else{
        tree.scrollLeft = Math.floor((node.offsetWidth - tree.offsetWidth) / 2);
      }
      return;
    }
  });
}

Tree.prototype.showDown = function(tree, level = 0){
  var showDown = this.custom_options.showDown
  , showClass = this.show_class
  , me = this;

  if (showDown < 1 || level > showDown) return;

  me.eachChildNodes(tree, function(node){
    if (node.nodeName === 'UL'){
      node.classList.contains(showClass) || node.classList.add(showClass);

      me.eachChildNodes(node, function(li){
        li.nodeName === 'LI' && me.showDown(li, level + 1);
      });
    }
  });
}

Tree.prototype.addIconSubTree = function(tree){
  var me = this;
  me.eachChildNodes(tree, function(node){
    node.nodeName === 'UL' && me.eachChildNodes(node, function(li){
      var hasSub = false;

      if (li.nodeName === 'LI'){
        me.eachChildNodes(li, function(el){
          el.nodeName === 'UL' && (hasSub = true);
        });
        me.addIconSubTree(li);
      }

      hasSub && me.eachChildNodes(li, function(el){
        el.nodeName === 'DIV' && el.appendChild(me.elementIcon());
      });
    });
  });
}

Tree.prototype.eachChildNodes = function(tree, cb){
  tree.childNodes.forEach(cb);
}

Tree.prototype.onClickIcon = function(){
  var me = this;
  
  return function(event){
    event.preventDefault();
    var li = event.target.parentNode.parentNode;
    
    me.eachChildNodes(li, function(el){
      if (el.nodeName === 'UL'){
        el.classList.contains(me.show_class) ? el.classList.remove(me.show_class) : el.classList.add(me.show_class);
        me.scrollCenter(me.findRoot(li));
      }
    });
  }
}

Tree.prototype.findRoot = function(el){
  if (el.classList.contains('tree')) return el;
  return this.findRoot(el.parentNode);
}

Tree.prototype.elementIcon = function(){
  var el = document.createElement('span');
  el.classList.add('tree_icon');
  el.onclick = this.onClickIcon();
  return el;
}

Tree.prototype.run = function(){
  if (!this.trees) return;
  var me = this;

  Array.from(this.trees).forEach(function(tree){
    me.scrollCenter(tree);
    me.showDown(tree);
    me.addIconSubTree(tree);
  });
}