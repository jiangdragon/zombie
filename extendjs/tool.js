/**
 IE真垃圾，我不做个缓存就运行不动了
 还是chrome  NB,但是chrome总是有些东西没在开始的时候初始化

 var _FC={};
 (function(obj){
	obj.DEBUG			=	false;
	obj.UL_LEFT			=	254;
	obj.UL_TOP			=	80;
	obj.HOME_RIGHT_SIDE	=	1000;
	obj.HOME_LEFT_SIDE	=	200;
})(_FC);
 */
/**

 这些全局变量最后都会移动到Menu类中
 */
var _FC={
	DEBUG			:	false,
	PAUSE			:	false,
	LI_LEFT			:	254,
	LI_TOP			:	80,
	HOME_RIGHT_SIDE	:	1000,
	HOME_LEFT_SIDE	:	200,
	RANGE_LI_BOTTOM	:	30	//植物的底部距离土地底部的距离
};
Array.prototype.del=function(val){
	for(var i=0,length=this.length;i<length;i++){
		if (val===this[i]){
			this.splice(i,1);
			break;
		}
	}
};
function simpleTest(){
	_FC.DEBUG=true;
	init();
}
function test(){
	//开启测试模式
	_FC.DEBUG=true;
	init();
	var aUl=document.getElementsByTagName('ul');
	//drag($('cardDl'));

	new Corpse({rowUl:aUl[aUl.length-1]}).born();
	new Corpse({rowUl:aUl[aUl.length-1],defaultLeft:1020}).born();
	new Corpse({rowUl:aUl[aUl.length-1],defaultLeft:1060}).born();
	new Corpse({rowUl:aUl[aUl.length-2]}).born();
	new Corpse({rowUl:aUl[aUl.length-3]}).born();
	new Corpse({rowUl:aUl[aUl.length-4]}).born();
	new Corpse({rowUl:aUl[aUl.length-5]}).born();
	/***/
	new Plant({li:aUl[aUl.length-2].children[2].landLi}).born();
	new Plant({li:aUl[aUl.length-1].children[0].landLi}).born();
	new Plant({li:aUl[aUl.length-3].children[0].landLi}).born();
	new Plant({li:aUl[aUl.length-3].children[2].landLi}).born();
	new Plant({li:aUl[aUl.length-1].children[1].landLi}).born();
	new Plant({li:aUl[aUl.length-5].children[2].landLi}).born();
	new Plant({li:aUl[aUl.length-4].children[0].landLi}).born();
}
function init(){
	new Card();
}
/**
 该方法只是前期的初始化方法，写到后来这种方法已经不行了
 */
function init1(){
	var aUl=$('landDiv').getElementsByTagName('ul');
	var oDiv = $('msg');
	if (oDiv){
		css(oDiv,{
			display		:	_FC.DEBUG?'block':'none',
			width		:	'1200px',
			height		:	'40px',
			border		:	'1px solid red'
		});
	}

	for(var i=0,length=aUl.length;i<length;i++){
		attr(aUl[i],{
			corpseList		:	[],
			plantList		:	[],
			bulletList		:	[],
			index			:	i
		});
		var aLi=aUl[i].getElementsByTagName('li');
		/**
		 //ul的宽高貌似设置的没什么意义
		 var height=css(aLi[0],'height')||'100px';
		 var width=parseInt(css(aLi[0],'width'))*aLi.length+'px'||'100px';
		 css(aUl[i],{
			width		:	width,
			//border		:	_FC.DEBUG?'1px solid black':'',
			height		:	height
		});
		 */
		for(var j=0,lengthj=aLi.length;j<lengthj;j++){
			css(attr(aLi[j],{
					innerHTML	:	_FC.DEBUG?(i+1)+"_"+(j+1):'',
					rowIndex	:	i,
					colIndex	:	j
				}),
				{
					position	:	'absolute',
					//background	:	'url(images/interface/sod1row.png) no-repeat -6 -6',//-10 -10
					left		:	((parseInt(css(aLi[j],'width'))*j)+_FC.LI_LEFT)+'px',
					top			:	(aUl[i].defaultTop=(parseInt(css(aLi[j],'height'))*i)+_FC.LI_TOP)+'px',
					border		:	_FC.DEBUG?'#CCC solid 1px':'',
					zIndex		:	j
				}
			);
		}
	}
}
function $(id){
	return document.getElementById(id)
}
function msg(msg,isAppend,isBr){
	var oMsg=$('msg');
	oMsg.innerHTML=isAppend?(oMsg.innerHTML+(isBr?'<br>':'')+msg):msg;
}
function css(obj,attr,val){
	if (!val){
		if (typeof attr=='string'){
			return getStyle(obj,attr);
		}else if(typeof attr=='object'){
			for(var key in attr){
				obj.style[key]=attr[key];
			}
		}
	}else{
		obj.style[attr]=val;
	}
	return obj;
}
function attr(obj,name,val){
	if (!val){
		if (typeof name=='string'){
			return obj.getAttribute(name,val);
		}else if (typeof name=='object'){
			for(var key in name){
				//obj.setAttribute(key,name[key]);
				obj[key]=name[key];
			}
		}
	}else{
		obj.setAttribute(name,val);
		obj[key]=name[key];
	}
	return obj;
}
function getStyle(obj,attr){
	if (obj.currentStyle){
		return obj.currentStyle[attr];
	}else{
		return getComputedStyle(obj,false)[attr];
	}
}
function c(name,json,parent){
	var obj=document.createElement(name);
	if (parent){
		parent.appendChild(obj);
	}
	attr(obj,json);
	return obj;
}
function realOffset(obj,str){
	var result=0;
	while(obj){
		result+=obj['offset'+str.substring(0,1).toUpperCase()+str.substring(1)];
		obj=obj.offsetParent;
	}
	return result;
}
function move(obj,json,fn,f){
	clearInterval(obj.timer);
	obj.timer=setInterval(function(){
		var iCur=0;
		var bBn=true;
		for(var attr in json){
			var iSpeed=0;
			if ('opacity'==attr){
				if (Math.round(parseFloat(getStyle(obj,attr))*100)==0){
					iCur=Math.round(parseFloat(getStyle(obj,attr))*100);
				}else{
					iCur=Math.round(parseFloat(getStyle(obj,attr))*100)||100;
				}
				iSpeed=(json[attr]-iCur)/30;
			}else{
				iCur=parseInt(getStyle(obj,attr))||0;
				iSpeed=(json[attr]-iCur)/8;
			}
			iSpeed=iSpeed>0?Math.ceil(iSpeed):Math.floor(iSpeed);
			if (json[attr]!=iCur){
				bBn=false;
			}
			if ('opacity'==attr){
				obj.style.filter="alpha(opacity="+(iCur+iSpeed)+")";
				obj.style.opacity=(iCur+iSpeed)/100;
			}else{
				obj.style[attr]=(iCur+iSpeed)+"px";
			}
		}
		if (bBn){
			clearInterval(obj.timer);
			if (fn){
				fn.call(obj);
			}
		}
	},f?f:30);
}
/**
 以下一个拖拽事件都没有加滚轮事件啊，有时间再加吧

 */
function drag(obj,fnMove,fnEnd,fnStart){
	obj.onmousedown=function(ev){
		var ev=ev||window.event;
		//注释的这个不对
		//var disX=ev.clientX-realOffset(obj,'left');  
		//var disY=ev.clientY-realOffset(obj,'top');
		var disX=ev.clientX-obj.offsetLeft;
		var disY=ev.clientY-obj.offsetTop;
		if (obj.setCapture){
			obj.setCapture();
		}
		if (fnStart){
			fnStart.call(obj,{disX:disX,disY:disY,ev:ev});
		}
		document.onmousemove=function(ev){
			var ev=ev||window.event;
			if (fnMove){
				//因为你不一定要移动这个原始的元素，可能要创建一个新的元素代替他移动所以就没有在判断的外面调用css
				//而是将这个目标值留给回调函数用
				fnMove.call(obj,{left:ev.clientX-disX,top:ev.clientY-disY,ev:ev});
			}else{
				css(obj,{left:ev.clientX-disX+"px",top:ev.clientY-disY+"px"});
				//obj.style.left=ev.clientX-disX+'px';
				//obj.style.top=ev.clientY-disY+'px';
			}
		};
		document.onmouseup=function(){
			var ev=ev||window.event;
			document.onmouseup=document.onmousemove=null;
			if (fnEnd){
				fnEnd.call(obj,ev);
			}
			if (obj.releaseCapture){
				obj.releaseCapture();
			}
		};
		return false;
	};
	return obj;
}
function clickDrag(obj,fnMove,fnEnd,fnStart){
	obj.onclick=function(ev){
		var ev=ev||window.event;
		var disX=ev.clientX-obj.offsetLeft;
		var disY=ev.clientY-obj.offsetTop;
		if (obj.setCapture){
			obj.setCapture();
		}
		if (fnStart){
			fnStart.call(obj,{disX:disX,disY:disY,ev:ev});
		}
		document.onmousemove=function(ev){
			var ev=ev||window.event;
			if (fnMove){
				fnMove.call(obj,{left:ev.clientX-disX,top:ev.clientY-disY,ev:ev});
			}else{
				css(obj,{left:ev.clientX-disX+"px",top:ev.clientY-disY+"px"});
			}
		};
		//这里他妈忘了document.onclick=function(ev)中的ev传进去了,导致火狐判断失败了,着实找了半天
		document.onclick=function(ev){
			var ev=ev||window.event;
			var srcElement=getEventTarget(ev);
			if (srcElement.hasMove){
				document.onclick=document.onmousemove=null;
				if (fnEnd){
					fnEnd.call(obj,ev);
				}
			}
			if (obj.releaseCapture){
				obj.releaseCapture();
			}
		};
		return false;
	};
	return obj;
}
function getEventTarget(e) {
	e = e || window.event;
	return e.target || e.srcElement;
}

function toggle(obj){
	var _arg=arguments;
	addToggle(obj);
	function addToggle(obj){
		var count=0;
		ggAddEvent(obj,'click',function(){
			var index=count++%(_arg.length-1);
			_arg[index+1].call(obj);
		});
	}
	return obj;
}
/**
 函数名：ran
 min：期望生成的随机数的最小边界
 max：期望生成的随机数的最大边界
 num：期望生成的随机数个数
 isRepeat:是否重复 true-重复，false-不重复
 return：一个数组（强制了从小到大排序排序）
 isPositive:如何排序,true:正序,false:逆序
 window.onload=function(){
		var result=ran(1,10,6,false,true);
		alert(result);
	};
 */
function ran(min,max,num,isRepeat,isPositive)
{
	!num?num=max:num=num;
	var result=[];
	for(var i=0;i<num;i++){
		var random=Math.floor(Math.random()*(max-min))+min;
		var isHave=false;
		if (!isRepeat&&result.length!=0){
			for(var j=0,len=result.length;j<len;j++){
				if (result[j]==random){
					isHave=true;
					break;
				}
			}
			!isHave?result.push(random):i--;
		}else{
			result.push(random);
		}
	}
	result.sort(function(num1,num2){
		return isPositive? num1-num2:num2-num1;
	});
	return result;
}
function getRandom(min,max){
	return Math.floor(Math.random()*(max-min+1))+min;
}
function ggAddEvent(obj,sEv,fn){
	if (obj.attachEvent){
		obj.attachEvent("on"+sEv,function(){
			if (!fn.call(obj)){
				event.cancelBubble=true;
				return false;
			}
		});
	}else{
		obj.addEventListener(sEv,function(ev){
			if (!fn.call(obj)){
				ev.cancelBubble=true;
				ev.preventDefault();
			}
		},false);
	}
}

/*
 实现aop功能的函数
 */
function actsAsAspect(object) {
	object.yield = null;
	object.rv    = { };
	object.before  = function(method, f) {
		var original = eval("this." + method);
		this[method] = function() {
			f.apply(this, arguments);
			return original.apply(this, arguments);
		};
	};
	object.after   = function(method, f) {
		var original = eval("this." + method);
		this[method] = function() {
			this.rv[method] = original.apply(this, arguments);
			return f.apply(this, arguments);
		}
	};
	object.around  = function(method, f) {
		var original = eval("this." + method);
		this[method] = function() {
			this.yield = original;
			return f.apply(this, arguments);
		}
	};
	return object;
}
//将一个函数的参数转化为真正的数组
function args() {
	return [].slice.call(arguments, 0);
}
/*
 获得浏览器类型
 */
function getBroswerType(){
	var Sys = {};
	var ua = navigator.userAgent.toLowerCase();
	var s;
	(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
		(s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
			(s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
				(s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
					(s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
	return Sys;
}
function getCNum(index){
	return ['零','一','二','三','四','五','六','七','八','九','十'][index||1];
}
//暂停功能
function pause(){
	if (_FC.PAUSE) return ;
}


