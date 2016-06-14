/*
 一些小道具类
 */


/*
 铲子类
 */
var Shovel=Base.extend({
	init			:	function(json){
		this.path='images/interface/';
		this.actionImg='Shovel.png';
		this._super(json);
		return this;
	},
	fuck			:	function(){}
});


/*
 遮罩类
 */
function Shade(json){
	this.shade='';
	this.resumeProgress='';
	this.resumeProgressTimer=null;
	//宿主
	this.parasitifer='';
	this.create(json);
}
Shade.prototype={
	init			:	function(json){
		for(var key in json ){
			this[key]=json[key];
		}
		return this;
	},
	create			:	function(json){
		this.init(json);
		css(this.shade=c('div',{innerHTML:_FC.DEBUG?'我是阻止点击div,正常情况下我是全透明的!~~':''},document.body),{
			zIndex			:	1001,
			opacity			:	_FC.DEBUG?0.6:0,
			filter			:	"alpha(opacity="+(_FC.DEBUG?60:0)+")",
			background		:	_FC.DEBUG?'white':''
		});
		css(this.resumeProgress=c('div',{innerHTML:_FC.DEBUG?'我是进度div,我自己会缩短!~~':''},document.body),{
			zIndex			:	1002,
			overflow		:	'hidden',
			opacity			:	70/100,
			filter			:	"alpha(opacity=70)",
			background		:	'#CCC'
		});
		this.setCss([this.shade,this.resumeProgress],{
			position		:	'absolute',
			fontSize		:	12+'px',
			display			:	'none'
		});
		return this;
	},
	//我宁肯在两种覆盖方法上每次都现去模仿宿主，也不在初始化时模仿
	justCover		:	function(){
		this.imitate(this.shade);
		this.shade.style.display='block';
		return this;
	},
	noCover			:	function(){
		this.shade.style.display='none';
		return this;
	},
	//覆盖
	cover			:	function(time){
		var This=this;
		this.parasitifer.isCD=true;
		this.imitate(this.shade).imitate(this.resumeProgress);
		clearInterval(this.resumeProgressTimer);
		this.shade.style.display='block';
		this.resumeProgress.style.display='block';
		var speed=this.resumeProgress.offsetHeight*30/time;
		var countSpeed=0;
		var notEnoughSpeed=0;
		var realSpeed=0;
		var height=this.resumeProgress.offsetHeight;
		this.resumeProgressTimer=setInterval(function(){
			countSpeed=speed+notEnoughSpeed;
			notEnoughSpeed=countSpeed-parseInt(countSpeed);
			//msg(This.resumeProgress.offsetHeight+"|  |",true,true);
			if (countSpeed>=1){
				realSpeed=(This.resumeProgress.offsetHeight-parseInt(countSpeed))?
					parseInt(countSpeed):This.resumeProgress.offsetHeight;
				This.resumeProgress.style.height=(This.resumeProgress.offsetHeight-realSpeed)+'px';
			}
			if (This.resumeProgress.offsetHeight<=0){
				clearInterval(This.resumeProgressTimer);
				This.parasitifer.isCD=false;
				This.parasitifer.card.manager.isMoneyEnough();
				//This.shade.style.display=this.parasitifer.isCanSale?'none':'block';
				css(This.resumeProgress,{
					display	:	'none',
					height	:	height+'px'
				});
			}
		},30);
		return this;
	},
	setCss			:	function(arr,json){
		for(var i=0,len=arr.length;i<len;i++){
			css(arr[i],json);
		}
		return this;
	},
	//模仿宿主
	imitate			:	function(obj){
		css(obj,{
			display			:	'block',
			width			:	this.parasitifer.offsetWidth+'px',
			height			:	this.parasitifer.offsetHeight+'px',
			left			:	realOffset(this.parasitifer,'left')+'px',
			top				:	realOffset(this.parasitifer,'top')+'px'
		});
		obj.style.display='none';
		return this;
	},
	fuck			:	function(){}
};