/*
 子弹管理类
 */
var BulletManager=Base.extend({
	init			:	function(json){
		this.game={};
		this.bulletFactory=new BulletFactory();
		this._super(json);
		return this;
	},
	resetCache		:	function(arr){
		this.bulletFactory.resetCache(arr);
		return this;
	},
	getBullet		:	function(name){
		return this.bulletFactory.get(name);
	},
	giveBack		:	function(obj){
		this.bulletFactory.giveBack(obj);
		return this;
	}
});

/*
 子弹类
 */
var Bullet=Base.extend({
	init			:	function(json){
		//所在的Ul
		this.rowUl='';
		//图片的层级
		this.zIndex=10;
		//发射自己的植物
		this.plant={};
		//是否击中
		this.isHit=false;
		//默认的僵尸的初始出生位置的左边距
		this.defaultLeft=1000;
		//默认的僵尸的初始出生位置的上边距
		this.defaultTop=400;
		//植物的左边
		this.plantLeft=0;
		//植物的右边
		this.plantRight=0;
		//子弹的攻击力
		this.attackPow=30;
		//攻击的方向,1:→,-1:←
		this.direction=1;
		//子弹的攻击类型------貌似定义多余了,灭用上
		this.attackType;
		//子弹由于带有攻击类型附加的攻击力
		this.attackTypePow=0;
		//图片路径
		this.path='images/Plants/';
		//当前子弹类型 也是枚举值
		this.type='normal'; //normal,ice,fire,shroom
		//当前动作
		this.action='walk';
		//当前动作图片
		this.actionImg='';
		//向后走的子弹，左右就反着用
		//图片左侧的空白
		this.leftBlankSpace=26;
		//图片右侧的空白
		this.rightBlankSpace=2;
		//移动定时器
		this.moveTimer=null;
		//探测定时器
		this.surveyTimer=null;
		//移动速度
		this.speed=8;
		//图片库
		this.imgLib={
			normal		:	{left:'PB00.gif',right:'PB01.gif'},
			//因为没有能回头射的冰射手
			ice			:	{left:'PB-10.gif',right:'PB-10.gif'},
			fire		:	{left:'PB10.gif',right:'PB11.gif'},
			shroom		:	{left:'ShroomBullet.gif',right:'ShroomBullet.gif'},
			hit			:	{pee:'PeaBulletHit.gif',shroom:'ShroomBulletHit.gif'}
		};
		this._super(json);
		return this.setActionImg();
	},
	setActionImg	:	function(){
		this.actionImg=c('img',{src:this.getActionSrc()},document.body);
		this.actionImg.style.display='none';
		return this;
	},
	getActionSrc	:	function(){
		return this.path+this.imgLib[this.type][this.direction>0?'left':'right'];
	},
	born			:	function(json){
		if (json){
			this.init(json);
		}
		css(this.actionImg,{
			zIndex			:	this.zIndex,
			display			:	'block',
			position		:	'absolute',
			left			:	(this.direction>0?this.plantRight:(this.plantLeft-this.actionImg.offsetWidth))+'px',
			top				:	(realOffset(this.rowUl.children[0],'top'))+'px',
			border			:	_FC.DEBUG?'1px solid red':''
		});
		this.walk();
		return this;
	},

	dead			:	function(){
		var This=this;
		this.clearInfo();
		this.actionImg.src=this.path+this.imgLib.hit[this.type=='shroom'?'shroom':'pee'];
		setTimeout(function(){
			//document.body.removeChild(This.actionImg);
			This.plant.li.manager.game.bulletManager.giveBack(This);
			This.actionImg.style.display='none';
			This.actionImg.src=This.getActionSrc();
			This.rowUl.bulletList.del(This);
			This.plant.isHasShot=false;
		},30);
	},
	walk			:	function(){
		var This=this;
		this.survey();
		clearInterval(this.moveTimer);
		var isSide=false;
		this.moveTimer=setInterval(function(){
			isSide=This.direction>0?(This.right()>=_FC.HOME_RIGHT_SIDE):(This.left()<=_FC.LI_LEFT);
			if (isSide){
				This.dead();
			}
			css(This.actionImg,{
				left		:	(realOffset(This.actionImg,'left')+This.speed*This.direction)+'px'
			});
		},30);
		return this;
	},
	sleep			:	function(){
		return this;
	},
	attack			:	function(corpse){
		corpse.beated(this.attackPow,this.type);
		this.dead();
	},
	left			:	function(){
		return realOffset(this.actionImg,'left')-(this.direction>0?this.leftBlankSpace:this.rightBlankSpace);
	},
	right			:	function(){
		return realOffset(this.actionImg,'left')+this.actionImg.offsetWidth
			-(this.direction>0?this.rightBlankSpace:this.leftBlankSpace);
	},
	top				:	function(){
		return realOffset(this.actionImg,'top');
	},
	survey			:	function(){
		var This=this;
		clearInterval(this.surveyTimer);
		this.surveyTimer=setInterval(function(){
			for(var i=0,corpseList=This.rowUl.corpseList;i<corpseList.length;i++){
				//跟僵尸有了亲密接触
				var isTouch=This.direction>0?This.right()>=corpseList[i].left():
					(This.left()<=corpseList[i].right()&&This.left()>=corpseList[i].left());
				if (corpseList[i].isLiving&&isTouch){
					This.attack(corpseList[i]);
				}
			}

		},30);
		return this;
	},
	getTypeImg		:	function(){
		return this.imgLib[this.type][this.direction];
	},
	clearInfo		:	function(array){
		clearInterval(this.moveTimer);
		clearInterval(this.surveyTimer);
		if (array){
			for(var i=0,len=array.length;i<len;i++){
				clearInterval(array[i]);
				clearTimeout(array[i]);
			}
		}
		return this;
	}
});
