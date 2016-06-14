/*
 游戏的土地管理类,管理游戏中的地图信息
 */
var LandManager=Base.extend({
	init			:	function(json){
		this.game={};
		//初始化几行草地
		this.lawnRowCount=5;
		//每一行初始化几列
		this.lawnColCount=9;
		//所有的UL
		this.aUl=[];
		//所有的LI
		this.aLi=[];
		//li默认的宽高
		this.cellLandWidth=82;
		this.cellLandHeight=100;
		//白天还是黑夜 枚举值 day,night
		this.dayOrNight='day';
		//土地的天气,枚举值(大雾，晴天神马的),暂时没启动
		this.weather='';
		//是否有泳池 枚举值land,lawn,swimming,housetop
		this.site='lawn';
		//存放图片的文件夹
		this.path='images/interface/';
		//家的背景图片
		this.homeImg='';
		//土地的图包
		this.imgLib={
			land		:	{
				day		:	{},
				night	:	{}
			},
			lawn		:	{
				day		:	{0:'',1:'',5:'background1.jpg'},
				night	:	{5:''}
			},
			swimming	:	{
				day		:	{6:''},
				night	:	{6:''}
			},
			housetop	:	{
				day		:	{5:''},
				night	:	{5:''}
			}
		};
		this._super(json);
		//return this.openedWasteland();
		return this;
	},
	//开荒
	openedWasteland :	function(json){
		this.lawnRowCount=this.site.toLowerCase()=='swimming'?6:this.lawnRowCount;
		this.setHomeImg();
		this.createLand();
		this.setMsgDiv();
		return this;
	},
	//制造土地
	createLand		:	function(){
		var index=this.lawnRowCount<5?this.lawnRowCount==3?1:2:0;
		for(var i=0;i<this.lawnRowCount;i++){
			var oUl=this.aUl[i]=c('ul',{
				id			:	'landUl',
				corpseList	:	[],
				plantList	:	[],
				bulletList	:	[],
				index		:	index++
			},$('landDiv')||c('div',{id:'landDiv'},$('home')));
			var li=[];
			for(var j=0;j<this.lawnColCount;j++){
				var oLi=c('li',{
					innerHTML	:	_FC.DEBUG?(i+1)+"_"+(j+1):'',
					rowIndex	:	oUl.index,
					arrayIndex	:	i,
					colIndex	:	j
				},oUl)
				var width=realOffset(li[j],'width')||this.cellLandWidth;
				var height=realOffset(li[j],'height')||this.cellLandHeight;
				css(oLi,{
					position	:	'absolute',
					width		:	width+'px',
					height		:	height+'px',
					left		:	(width*j+_FC.LI_LEFT)+'px',
					top			:	(height*i+_FC.LI_TOP)+'px',
					border		:	_FC.DEBUG?'#CCC solid 1px':'',
					zIndex		:	j
				});
				li[j]=new Land({
					manager		:	this,
					li			:	oLi,
					dayOrNight	:	this.dayOrNight,
					landType	:	(this.site.toLowerCase()=='siwmming')?((j==2||j==3)?'swimming':'lawn'):this.site
				});
				//纯粹是为了方便测试
				oLi.landLi=li[j];
			}
			this.aLi[i]=li;
		}
		return this;
	},
	//铺草坪
	paveLawn		:	function(index){
		return this;
	},
	isCanGrow		:	function(i,j){
		return this.aLi[i][j].isCanGrow();
	},
	//种植物
	growPlant		:	function(landLi,plant){
		landLi.growPlant(plant);
		return this;
	},
	//改良土地
	reformLand		:	function(landLi,plant){
		landLi.reformLand(plant);
	},
	getLandLi		:	function(li){
		return this.aLi[li.arrayIndex][li.colIndex];
	},
	getTopUlIndex	:	function(){
		return this.aUl[0].index;
	},
	getBottomUlIndex:	function(){
		return this.aUl[this.aUl.length-1].index;
	},
	setMsgDiv		:	function(){
		var oDiv = $('msg')||c('div',{id:'msg'},document.body);
		if (oDiv){
			css(oDiv,{
				display		:	_FC.DEBUG?'block':'none',
				width		:	'1200px',
				height		:	'80px',
				overflowY	:	'scroll',
				border		:	'1px solid red'
			});
		}
	},
	setHomeImg		:	function(){
		this.homeImg=this.imgLib[this.site][this.dayOrNight][this.lawnRowCount];
		css($('home')||c('div',{id:'home'},document.body),{
			width			:	'1400px',
			height			:	'600px',
			background		:	'url('+this.path+this.homeImg+') no-repeat',
			border			:	_FC.DEBUG?'1px solid green':''
		});
		return this;
	}
});


/*
 土地类
 */
var Land=Base.extend({
	init			:	function(json){
		this.manager={};
		//封装的li
		this.li=null;
		//种的植物
		this.plant=null;
		//如果是泳池回种荷叶(LilyPad),房顶会摆花盆(FlowerPot)
		this.rootGround=null;
		//土地状态 枚举值(land(秃地),lawn(草地),swimming(泳池),ice(冰地),boom(爆炸了的费地),housetop(屋顶),cemetery(墓地))
		this.landType='lawn',
			//白天还是黑夜 枚举值 day,night
			this.dayOrNight='day';
		//图片文件夹路径
		this.path='images/interface/';
		//冰地恢复延时器
		this.iceLandTimer=null;
		//冰地恢复时间
		this.iceResumeTime=3*60*1000;
		//炸地恢复延时器
		this.boomLandTimer=null;
		//炸地恢复时间
		this.boomResumeTime=3*60*1000;
		//图片包
		this.imgLib={
			lawn		:	{day:'',night:''}
		};

		this._super(json);
	},
	create			:	function(json){
		this.init(json);
		return this;
	},
	reformLand		:	function(obj){
		this.rootGround=obj.born(this);
		this.landType='lawn';
		return this;
	},
	growPlant		:	function(plant){
		plant.born(this);
		return this;
	},
	isCanGrow		:	function(plant){
		//特殊植物的判断还未实现
		return this.plant?false:!(this.landType.toLowerCase()=='ice'||this.landType.toLowerCase()=='boom'
		||this.landType.toLowerCase()=='cemetery'||this.landType.toLowerCase()=='land');
	},
	//污染土地
	polluteLand		:	function(polluteType){
		this.landType=polluteType;
		//因为有可能先被炸了又被冰了,自然得重新计时恢复时间不然炸地恢复了直接就把冰地也恢复了,所以全清了
		this.clearInfo();
		return this.updateImg().resumeLand();
	},
	//恢复土地 
	resumeLand		:	function(){
		var name=this.landType+'LandTimer';
		var This=this;
		clearTimeout(this[name]);
		this[name]=setTimeout(function(){
			This.landType='lawn';
			This.updateImg();
		},this[this.landType+'ResumeTime']);
		return this;
	},
	getImg			:	function(){
		return this.path+this.imgLib[this.landType][this.dayOrNight];
	},
	updateImg		:	function(){
		css(this.li,{
			background	:	'url('+this.getImg()+') no-repeat'
		});
		return this;
	},
	rowIndex		:	function(){
		return this.li.rowIndex||0;
	},
	colIndex		:	function(){
		return this.li.colIndex||0;
	},
	arrayIndex		:	function(){
		return this.li.arrayIndex||0;
	},
	html			:	function(str,isAppend){
		return (str!=0)?str:true?this.li.innerHTML=isAppend?this.li.innerHTML+str:str:this.li.innerHTML;
	},
	left			:	function(){
		return realOffset(this.li,'left');
	},
	width			:	function(){
		return this.li.offsetWidth;
	},
	right			:	function(){
		return this.left()+this.width();
	},
	top				:	function(){
		return realOffset(this.li,'top');
	},
	height			:	function(){
		return this.li.offsetHeight;
	},
	bottom			:	function(){
		return this.top()+this.height();
	},
	ul				:	function(index){
		if (index||index==0){
			return this.manager.aUl[index];
		}
		return this.li.parentNode;
	},
	//虽然在这里也实现了一个,不过不应该调用这个函数，这个事情还是应该在植物的类中做比较合适
	appendPlant		:	function(){
		this.ul().plantList.push(this.plant);
		return this;
	},
	corpseList		:	function(index){
		if (index>-1){
			return this.ul(index).corpseList;
		}
		return this.ul().corpseList;
	},
	plantList		:	function(index){
		if (index){
			return this.ul(index).plantList;
		}
		return this.ul().plantList;
	},
	bulletList		:	function(index){
		if (index){
			return this.ul(index).bulletList;
		}
		return this.ul().bulletList;
	},
	brotherLength	:	function(){
		return this.ul().children.length;
	},
	clearInfo		:	function(array){
		clearTimeout(this.iceLandTimer);
		clearTimeout(this.boomLandTimer);
		if (array){
			for(var i=0,len=array.length;i<len;i++){
				clearInterval(array[i]);
				clearTimeout(array[i]);
			}
		}
		return this;
	}
});