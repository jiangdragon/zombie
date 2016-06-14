/*
 卡片管理类
 */
var CardManager=Base.extend({
	init			:	function(json){
		this.game={};
		//所有卡片所在的div,所有的定位都是相对于他
		this.cardDiv=$('cardDiv')||c('div',{id:'cardDiv'},$('home'));
		//植物卡片所在的Ul
		this.cardUl=c('ul',{id:'cardUl'},this.cardDiv);
		//出场植物名字集合数组
		this.plantNameList=['Peashooter','SunFlower','PotatoMine','CherryBomb','TallNut','Chomper','WallNut'];
		this.setCardDivCss().setCardUlCss();
		//植物卡片数组
		this.plantCardList=[];
		//植物卡片图片对象数组
		this.plantCardImgList=[];
		//阳光卡片和铲子卡片的间距
		this.sunShovelSpan=20;
		//阳光卡片
		this.sunshineCard={};
		//铲子卡片
		this.shovelCard={};
		this._super(json);
		//return this.initCard().fillPlantCard();
		return this;
	},
	setCardDivCss	:	function(){
		css(this.cardDiv,{
			position		:	'absolute',
			width			:	'140px',
			height			:	'300px',
			border			:	_FC.DEBUG?'blue solid 1px':''
		});
		return this;
	},
	setCardUlCss	:	function(){
		css(this.cardUl,{
			position		:	'absolute',
			left			:	'10px',
			top				:	'60px',
			width			:	'100px',
			//height			:	(60*this.plantNameList.length)+'px',
			height			:	(60*(this.plantNameList.length||10))+'px',
			border			:	_FC.DEBUG?'green solid 1px':''
		});
		return this;
	},
	initCard		:	function(){
		//阳光卡片
		this.sunshineCard=new SunshineCard(this);
		//铲子卡片
		this.shovelCard=new ShovelCard(this);
		return this;
	},
	fillPlantCard	:	function(){
		for(var i=0;i<this.plantNameList.length;i++){
			var plantCard=new PlantCard(this,i);
			this.plantCardList.push(plantCard);
			this.plantCardImgList.push(plantCard.oImg);
		}
		return this.isMoneyEnough();
	},
	getSunCount		:	function(){
		return this.game.getSunCount();
	},
//-------->有很多遗留问题未解决
	isMoneyEnough	:	function(){
		for(var i=0,len=this.plantCardImgList.length;i<len;i++){
			var oImg=this.plantCardImgList[i];
			var isSale=this.getSunCount()<oImg.plant.sunPrice?0:1;
			//this.plantCardImgList[i].src=this.plantCardList[i].path+this.imgLib[this.plantCardImgList[i].plantName][isSale];
			oImg.src=this.plantCardList[i].path+oImg.plant.imgLib['cardImg'][isSale];
			if (isSale&&!oImg.isCD){
				oImg.shade.noCover();
			}else{
				oImg.shade.justCover();
			}
		}
		return this;
	}
});
/*
 卡片类
 */
var Card=Base.extend({
	init			:	function(json){
		//容器
		this.container={};
		//自己的管理者
		this.manager={};
		this.path='images/interface/';
		//背景图片
		this.backImg='/';
		this._super(json);
		return this;
	},
	//点击拖拽
	clickDrag		:	function(obj,fnMove,fnDown,fnStart){
		var This=this;
		clickDrag(obj,function(json){
			if (fnMove) fnMove.call(This,obj,json);
		},function(ev){
			if (fnDown) fnDown.call(This,obj,ev);
		},function(json){
			if (fnStart) fnStart.call(This,obj,json);
		});
		return this;
	},
	//拖拽检测
	survey			:	function(obj,fn){
		var targetLand=fn.call(obj);
		if (targetLand){
			css(obj,{
				display		:	'block',
				left		:	(targetLand.left()+((targetLand.width()-obj.offsetWidth)/2))+'px',
				top			:	(targetLand.top()+targetLand.height()-_FC.RANGE_LI_BOTTOM-obj.offsetHeight)+'px'
			});
		}
		return this;
	},
	//获得最近的碰撞土地
	getNear			:	function (obj,attr){
		var iMinIndex=-1;
		var jMinIndex=-1;
		var nearest=99999999;
		for(var i=0,len=attr.length;i<len;i++){
			for(var j=0;j<attr[i].length;j++){
				//if (obj==attr[i])continue;
				if (this.collision(obj,attr[i][j].li)){
					var s=this.getSqrt(obj,attr[i][j].li);
					if (s<nearest){
						nearest=s;
						iMinIndex=i;
						jMinIndex=j;
					}
				}
			}
		}
		if (iMinIndex==-1&&jMinIndex==-1){
			return null;
		}else{
			return attr[iMinIndex][jMinIndex];
		}
	},
	//与土地的碰撞检测
	collision		:	function (obj1,obj2){
		var l1=realOffset(obj1,'left');
		var r1=l1+obj1.offsetWidth;
		var t1=realOffset(obj1,'top');
		var b1=t1+obj1.offsetHeight;
		var l2=realOffset(obj2,'left');
		var r2=l2+obj2.offsetWidth;
		var t2=realOffset(obj2,'top');
		var b2=t2+obj2.offsetHeight;
		if (r1<l2||b1<t2||l1>r2||t1>b2){
			return false;
		}else{
			return true;
		}
	},
	//获得距离
	getSqrt			:	function (obj1,obj2){
		var a=(realOffset(obj1,'left')+obj1.offsetWidth/2)-(realOffset(obj2,'left')+obj2.offsetWidth/2);
		var b=(realOffset(obj1,'top')+obj1.offsetHeight/2)-(realOffset(obj2,'top')+obj2.offsetHeight/2);
		return Math.sqrt(a*a+b*b);
	},
	//自定义右键事件
	rightClick		:	function(obj,fn){
		var obj=obj||this.container;
		obj.oncontextmenu=function(){
			if (fn){
				fn.call(obj);
			}
			return false;
		};
		return this;
	},
	cancelRightClick:	function(obj){
		var obj=obj||this.container;
		obj.oncontextmenu=null;
		return this;
	},
	//容器宽度
	width			:	function(){
		return this.container.offsetWidth||0;
	},
	//容器高度
	height			:	function(){
		return this.container.offsetHeight||0;
	},
	//容器左边距
	left			:	function(){
		return this.container.offsetLeft||0;
	},
	//容器右边的边距
	top				:	function(){
		return this.container.offsetTop||0;
	}
});
/*
 阳光卡片类
 */
var SunshineCard=Card.extend({
	init			:	function(manager){
		this._super({
			manager			:	manager,
			container		:	c('div',{id:'sunDiv'},manager.cardDiv),
			backImg			:	'SunBack.png'
		});
		//阳光拾起目标点
		this.packUpTarget={
			left			:	_FC.LI_LEFT,
			top				:	0
		};
		//阳光总数显示牌
		this.sunCountLed=c('h2',{id:'sunCountLed'},this.container);
		return this.setContainerCss().setLedCss().viewCount(manager.game.getSunCount());
	},
	setContainerCss	:	function(){
		css(this.container,{
			position		:	'absolute',
			width			:	'123px',
			height			:	'34px',
			zIndex			:	900,
			left			:	this.packUpTarget.left+'px',
			top				:	this.packUpTarget.top+'px',
			background		:	'url('+this.path+this.backImg+') no-repeat',
			display			:	'block',
			border			:	_FC.DEBUG?'white solid 3px':''
		});
		return this;
	},
	setLedCss		:	function(){
		css(this.sunCountLed,{
			position		:	'absolute',
			width			:	74+'px',
			height			:	30+'px',
			left			:	39+'px',
			top				:	3+'px',
			textAlign		:	'center',
			background		:	_FC.DEBUG?'#BBB':''
		});
		return this;
	},
	viewCount		:	function(value){
		this.sunCountLed.innerHTML=value||0;
		this.manager.isMoneyEnough();
		return this;
	},
	left			:	function(){
		return this.container.offsetLeft||_FC.LI_LEFT;
	},
	right			:	function(){
		return this.left()+this.width();
	},
	top				:	function(){
		return this.container.offsetTop||this.packUpTarget.top;
	}
});
/*
 铲子卡片类
 */
var ShovelCard=Card.extend({
	init			:	function(manager){
		this._super({
			manager			:	manager,
			container		:	c('div',{id:'shovelDiv'},manager.cardDiv),
			backImg			:	'ShovelBack.png',
			shovelImg		:	'Shovel.png'
		});
		//之所以放到body中是为了方便计算拖拽
		this.shovelImg=c('img',{
			src				:	this.path+this.shovelImg,
			id				:	'shoveImg',
			isMove			:	false
		},document.body);
		return this.setContainerCss().setShovelImgCss().
			clickDrag(this.shovelImg,this.shovelDragMove,this.shovelDragDown,this.shovelDragStart);
	},
	setContainerCss	:	function(){
		css(this.container,{
			position		:	'absolute',
			width			:	'71px',
			height			:	'35px',
			zIndex			:	1050,
			left			:	this.left()+'px',
			top				:	this.top()+'px',
			background		:	'url('+this.path+this.backImg+') no-repeat',
			display			:	'block',
			border			:	_FC.DEBUG?'white solid 3px':''
		});
		return this;
	},
	setShovelImgCss	:	function(){
		var This=this;
		css(this.shovelImg,{
			position		:	'absolute',
			left			:	realOffset(this.container,'left')+'px',
			top				:	realOffset(this.container,'top')+'px',
			//我为什么要给图片设宽高？难道影响了布局？我忘了......
			width			:	'76px',
			height			:	'34px',
			zIndex			:	1051,
			border			:	_FC.DEBUG?'1px solid red':''
		});
		return this.setShadow();
	},
	setShadow		:	function(){
		var shadowImg=c('img',{src:this.shovelImg.src},document.body);
		css(shadowImg,{
			position	:	'absolute',
			display		:	'none',
			opacity		:	50/100,
			filter		:	"alpha(opacity=50)"
		});
		attr(this.shovelImg,{
			left			:	this.shovelImg.offsetLeft,
			top				:	this.shovelImg.offsetTop,
			shadowImg		:	shadowImg
		});
		return this;
	},
	shovelDragStart	:	function(obj,json){
		/**
		 var This=this;
		 this.rightClick(obj,function(){
								This.goBack(obj);								
							});
		 */
	},
	shovelDragMove	:	function(obj,json){
		var This=this;
		obj.hasMove=true;
		css(obj,{left:json.left+'px',top:json.top+'px'});
		this.survey(obj.shadowImg,function(){
			obj.targetLand=This.getNear(obj,This.manager.game.getAllLand());
			return obj.targetLand;
		});
		return this;
	},
	shovelDragDown	:	function(obj){
		obj.hasMove=false;
		if (obj.targetLand&&obj.targetLand.plant){
			obj.targetLand.plant.dead();
		}
		return this.goBack(obj);
	},
	goBack			:	function(obj){
		css(obj,{
			left			:	this.shovelImg.left+'px',
			top				:	this.shovelImg.top+'px'
		});
		obj.shadowImg.style.display='none';
		//document.onmousemove=document.onclick=null;
		//this.cancelRightClick(obj);
		return this;
	},
	left			:	function(){
		return this.manager.sunshineCard.right()+this.manager.sunShovelSpan;
	},
	top				:	function(){
		return this.manager.sunshineCard.top();
	}
});
/*
 游戏进程卡片类
 */
var ProgressCard=Card.extend({
	init			:	function(manager){

	},
	fuck			:	function(){}
});
/*
 植物卡片类
 */
var PlantCard=Card.extend({
	init			:	function(manager,i){
		this._super({
			manager			:	manager,
			path			:	'images/Card/Plants/',
			container		:	c('li',{index:i},manager.cardUl)
		});
		this.oImg={};
		this.setContainerCss().setOImg().setShadowImg().setPriceDiv().clickDrag(this.oImg,this.cardDragMove,this.cardDragDown);
		return this;
	},
	setContainerCss	:	function(){
		css(this.container,{
			width		:	'100px',
			height		:	'60px',
			border		:	_FC.DEBUG?'red solid 1px':''
		});
		return this;
	},
	setOImg			:	function(){
		var plant=this.getPlant(this.manager.plantNameList[this.container.index]);
		this.oImg=c('img',{
			//这个地址还是放在植物的类里比较好
			src			:	this.path+plant.imgLib['cardImg'][1],
			plant		:	plant,
			plantName	:	this.manager.plantNameList[this.container.index],
			name		:	this.manager.plantNameList[this.container.index],
			isCD		:	false,
			hasMove		:	false,
			card		:	this,
			targetLand	:	''
		},this.container);
		css(this.oImg,{
			position	:	'absolute',
			zIndex		:	999
		});
		return this.setShadowImg();
	},
	setShadowImg	:	function(){
		var shadowImg=c('img',{src:this.oImg.plant.actionImg.src,hasMove:false},document.body);
		css(shadowImg,{
			position	:	'absolute',
			display		:	'none',
			opacity		:	50/100,
			filter		:	"alpha(opacity=50)"
		});
		attr(this.oImg,{
			shadowImg	:	shadowImg,
			shade		:	new Shade({parasitifer:this.oImg})
		});
		return this;
	},
	setPriceDiv		:	function(){
		var This=this;
		//创建价格牌 50,20
		var priceDiv=c('h4',{innerHTML:this.oImg.plant.sunPrice},this.container);
		css(priceDiv,{
			position		:	'absolute',
			zIndex			:	1000,
			width			:	40+'px',
			height			:	20+'px',
			left			:	(realOffset(this.oImg,'left')+48)+'px',
			top				:	(realOffset(this.oImg,'top')-20)+'px',//剪掉自身高度20
			textAlign		:	'center',
			background		:	_FC.DEBUG?'#BBB':''
		});
		priceDiv.onclick=function(){
			This.oImg.onclick();
		};
		return this;
	},
	getPlant		:	function(name){
		return this.manager.game.plantManager.plantFactory.get(name);
	},

	/*
	 clickDrag		:	function(obj,fnMove,fnDown,fnStart){
	 var This=this;
	 clickDrag(obj,function(json){
	 if (fnMove) fnMove.call(This,obj,json);
	 },function(ev){
	 if (fnDown) fnDown.call(This,obj,ev);
	 },function(json){
	 if (fnStart) fnStart.call(This,obj,json);
	 });
	 return this;
	 },
	 clickDrag(this.oImg,this.cardDragMove,this.cardDragDown)
	 */
	cardDragMove	:	function(obj,json){
		var This=this;
		//由于中间不是像铲子一样只操作一个对象,只好借他人之手把信息传过去
		obj.hasMove=obj.plant.actionImg.hasMove=true;
		css(obj.plant.actionImg,{
			position		:	'absolute',
			left			:	json.ev.clientX-obj.offsetWidth/2+'px',
			top				:	json.ev.clientY-obj.offsetHeight/2+'px',
			display			:	'block'
		});
		this.survey(obj.shadowImg,function(){
			obj.targetLand=This.getNear(obj.plant.actionImg,This.manager.game.getAllLand());
			if (obj.targetLand&&!obj.targetLand.isCanGrow()) obj.targetLand=null;
			return obj.targetLand;
		});
		return this;
	},
	cardDragDown	:	function(obj){
		obj.hasMove=obj.plant.actionImg.hasMove=false;
		if (obj.targetLand){
			obj.plant.born(obj.targetLand);
			obj.shade.cover(obj.plant.cd);
			//换一个新的植物
			obj.plant=this.getPlant(obj.plantName);
		}else{
			obj.plant.actionImg.style.display='none';
		}
		obj.shadowImg.style.display='none';
		return this;
	}
});