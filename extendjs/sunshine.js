/*
 阳光管理类
 */

var SunshineManager=Base.extend({
	init			:	function(json){
		this.game={};
		//阳光工厂
		this.sunshineFactory=new SunshineFactory();
		//阳光总数
		this.sunShineCount=0;
		//阳光列表
		this.sunShineList=[];
		//制造阳光定时器
		this.sunTimer=null;
		//制造阳光频率
		this.sunF=10*1000;
		//是否自动拾取阳光
		this.isAutoPackUp=true;
		//自动拾取阳光定时器
		this.autoPackUpTimer=null;
		//自动拾起阳光频率
		this.autoPackUpF=14*1000;
		this._super(json);
		return this;
	},
	resetCache		:	function(arr){
		this.sunshineFactory.resetCache(arr);
		return this;
	},
	getSunshine		:	function(name){
		return this.sunshineFactory.get();
	},
	//开始制造阳光
	beginShine		:	function(){
		var This=this;
		setTimeout(function(){
			This.createSunShine();
			This.autoPackUp();
		},this.sunF);
		return this;
	},
	//产生阳光
	createSunShine	:	function(json){
		var This=this;
		clearInterval(this.sunTimer);
		this.sunTimer=setInterval(function(){
			This.getSunshine().born(json||{
				manager		:	This
			});
		},this.sunF);
		return this;
	},
	//自动拾取阳光
	autoPackUp		:	function(){
		var This=this;
		this.autoPackUpTimer=setInterval(function(){
			if (This.isAutoPackUp){
				This.clearSunList();
			}
		},this.autoPackUpF);
		return this;
	},
	//清除已生产的阳光列表	
	clearSunList	:	function(){
		for(var i=0,len=this.sunShineList.length;i<len;i++){
			if (this.sunShineList[i].isLiving){
				this.sunShineList[i].packUp();
			}
		}
		return this;
	},
	//收获阳光
	harvest			:	function(value){
		this.sunShineCount+=value||0;
		return this.viewCount();
	},
	//消费阳光
	consume			:	function(value){
		this.sunShineCount-=value||0;
		return  this.viewCount();
	},
	//显示当前阳光总数
	viewCount		:	function(){
		this.game.getSunshineCard().viewCount(this.sunShineCount);
		return this;
	}

});
/*
 阳光类
 */
var Sunshine=Base.extend({
	init			:	function(json){
		this.manager={};
		this.value=25;
		this.path='images/interface/Sun.gif';
		this.defaultBornLeft='';
		this.defaultBornTop='';
		this.actionImg=c('img',{src:this.path},document.body);
		this.actionImg.style.display='none';
		this.fallTimer=null;
		this.isLiving=true;
		this.packUpTarget={
			left	:	_FC.LI_LEFT,
			top		:	0
		};
		this._super(json);
		return this;
	},
	//出生
	born			:	function(json){
		var This=this;
		if (json){
			if (typeof json=='object'){
				this.reset(json);
			}else{
				this.manager=json;
			}
		}
		this.manager.sunShineList.push(this);
		ggAddEvent(this.actionImg,'click',function(){
			This.packUp();
		});
		//this.actionImg.onclick=this.packUp;
		//没给出生位置说明是卡片制造的随机出生位置
		css(this.actionImg,{
			position	:	'absolute',
			display		:	'block',
			left		:	(this.defaultBornLeft||getRandom(260,1000))+'px',
			top			:	(this.defaultBornTop||0)+'px',
			zIndex		:	1000,
			border		:	_FC.DEBUG?'1px solid green':''
		});
		if (!this.defaultBornLeft) this.fall();
		return this;
	},
	//死亡
	dead			:	function(){
		this.isLiving=false;
		this.clearInfo();
		//一定要先把自己从列表中删除掉,不然可能你在刚删除了图片后card的自动拾取阳光启动了就造成了空指针
		this.manager.sunShineList.del(this);
		document.body.removeChild(this.actionImg);
		this.manager.harvest(this.value);
	},
	//降落
	fall			:	function(){
		var This=this;
		var target=getRandom(50,600);
		clearInterval(this.fallTimer);
		this.fallTimer=setInterval(function(){
			css(This.actionImg,{
				top		:	(This.top()+1)+'px'
			});
			if (target<=realOffset(This.actionImg,'top')){
				clearInterval(This.fallTimer);
			}
		},30);
		return this;
	},
	//拾起
	packUp			:	function(){
		var This=this;
		clearInterval(this.fallTimer);
		move(this.actionImg,{left:this.getTarget().left-10,top:this.getTarget().top},function(){
			This.dead();
		});
		//阻止冒泡了
		return false;
	},
	getTarget		:	function(){
		return this.manager.game.card.sunshineCard.packUpTarget;
	},
	left			:	function(){
		return realOffset(this.actionImg,'left');
	},
	top				:	function(){
		return realOffset(this.actionImg,'top');
	},
	clearInfo		:	function(array){
		clearInterval(this.fallTimer);
		clearInterval(this.actionImg.timer);
		if (array){
			for(var i=0,len=array.length;i<len;i++){
				clearInterval(array[i]);
				clearTimeout(array[i]);
			}
		}
	}
});
