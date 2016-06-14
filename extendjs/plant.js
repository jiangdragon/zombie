/*
 植物管理类
 */
var PlantManager=Base.extend({
	init			:	function(json){
		this.game={};
		this.plantFactory=new PlantFactory({manager:this});
		this._super(json);
		return this;
	},
	resetCache		:	function(arr){
		this.plantFactory.resetCache(arr);
		return this;
	},
	getPlant		:	function(name){
		return this.plantFactory.get(name);
	}
});
/*
 植物的父类
 */
var Plant=Base.extend({
	init			:	function(json){
		this.manager={};
		//植物的名称
		this.name='';
		//植物的阳光价格
		this.sunPrice='100';
		//植物出售的冷却时间
		this.cd=8*1000;
		//植物的血量
		this.blood=200;
		//包裹植物的Land对象
		this.li='';
		//能种植的土地
		this.growLand='lawn';
		//图片左侧的空白
		this.leftBlankSpace=0;
		//图片右侧的空白
		this.rightBlankSpace=0;
		//图片上面的空白
		this.topBlankSpace=0;
		//图片下面的空白
		this.bottomBlankSpace=0;
		//当前图片路径
		this.path='images/Plants/Peashooter/';
		//当前动作图片
		this.actionImg='';
		//当前的动作状态,枚举值
		this.action='free';
		//是否是活的
		this.isLiving=true;
		//当前被伤害级别
		this.hurtLevel=0;
		//伤害分级标准血量
		this.hurtLevelBlood={0:200};
		//当前的层级
		this.zIndex=0;

		//攻击定时器,给特殊技使用,不一定能用到
		this.attackTimer=null;

		//图片库
		this.imgLib={
			cardImg		:	{1:'Peashooter.png',0:'PeashooterG.png'},
			hurtState	:	{0:'Peashooter.gif'}
			//free		:	'Peashooter.gif'
		};
		this._super(json);
		return this.setActionImg();
	},
	setActionImg	:	function(){
		//this.actionImg=c('img',{src:this.path+this.imgLib.free},document.body);
		this.actionImg=this.actionImg||c('img',{},document.body);
		this.setActionSrc();
		css(this.actionImg,{
			//一定要比僵尸的基础层级高不然在有僵尸的土地上放不下去植物,因为你点到了僵尸上
			zIndex			:	3000,
			position		:	'absolute',
			border			:	_FC.DEBUG?'1px solid red':'',
			display			:	'none'
		});
		return this;
	},
	setActionSrc	:	function(){
		this.actionImg.src=this.path+this.imgLib.hurtState[this.hurtLevel];
		return this;
	},
	//植物的出生
	born			:	function(landLi,json){
		if (landLi){
			this.li=landLi;
		}
		//出生时有一次重新设定形象的机会.(男球还是女球啊?)
		if (json){
			this.reset(json);
		}
		this.zIndex=this.li.rowIndex(100)//?this.li.zIndex;
		this.li.plant=this;
		this.li.plantList().push(this);
		css(this.actionImg,{
			zIndex			:	200+this.li.rowIndex(),
			display			:	'block',
			left			:	(this.li.left()+this.li.width()/2-(this.actionImg.offsetWidth-
			this.leftBlankSpace-this.rightBlankSpace)/2+this.leftBlankSpace)+'px',
			top				:	(this.li.top()+this.li.height()-_FC.RANGE_LI_BOTTOM-this.actionImg.offsetHeight)+'px'
		});
		this.consumeSunShine();
		return this;
	},
	dead			:	function(){
		this.clearInfo();
		this.blood=-10;
		this.li.plant=null;
		this.li.plantList().del(this);
		if (this.isLiving){
			this.isLiving=false;
			document.body.removeChild(this.actionImg);
		}
		return false;
	},


	//这里没有像僵尸的被攻击一样传入攻击类型的附加攻击力，因为僵尸只有吃和秒杀两种攻击，其余视为特殊技能
	beated			:	function(attackPow,attackType){
		var This=this;
		this.blood-=attackPow;
		return this.updateLevel();
	},

	consumeSunShine	:	function(){
		this.li.manager.game.sunshine.consume(this.sunPrice);
		return this;
	},
	updateLevel		:	function(attackType){
		if (this.hurtLevelBlood[this.hurtLevel+1]&&this.blood<this.hurtLevelBlood[this.hurtLevel+1]){
			this.hurtLevel++;
			this.setActionSrc();
		}
		if (this.blood<=0){
			this.dead();
			return false;
		}
		return true;
	},
	left			:	function(){
		return realOffset(this.actionImg,'left')-this.leftBlankSpace;
	},
	right			:	function(){
		return realOffset(this.actionImg,'left')+this.actionImg.offsetWidth-this.rightBlankSpace;
	},
	top				:	function(){
		return realOffset(this.actionImg,'top')+this.topBlankSpace;
	},
	getActionImg	:	function(){
		return '';
	},
	clearInfo		:	function(array){
		clearInterval(this.fireTimer);
		clearInterval(this.surveyTimer);
		clearInterval(this.sunTimer);
		if (array){
			for(var i=0,len=array.length;i<len;i++){
				clearInterval(array[i]);
				clearTimeout(array[i]);
			}
		}
	}
});
/*
 经济作物类
 */

var EconomicPlant=Plant.extend({
	init			:	function(json){
		//制造的阳光价格
		this.createSunValue=0;
		//制造阳光定时器
		this.sunTimer=null;
		//制造阳光频率
		this.sunF=13*1000;
		this._super(json);
		return this;
	},
	born			:	function(landLi,json){
		this._super(landLi,json);
		this.createSunShine();
		return this;
	},
	createSunShine	:	function(){
		var This=this;
		clearInterval(this.sunTimer);
		this.sunTimer=setInterval(function(){
			This.li.manager.game.sunshine.getSunshine().born({
				//value			:	This.createSunValue,
				manager			:	This.li.manager.game.sunshine,
				defaultBornLeft	:	This.right()-30,
				defaultBornTop	:	This.top()+20
			});
		},this.sunF);
		return this;
	}
});
/*
 攻击植物类
 */
var AttackPlant=Plant.extend({
	init			:	function(json){
		//是否已经射击
		this.isHasShot=false;
		//默认子弹类型
		this.defaultBulletType='normal';
		//检测敌人的频率
		this.surveyF=500;
		//开火定时器,貌似没用上
		this.fireTimer=null;
		//探测定时器
		this.surveyTimer=null;
		this._super(json);
		return this;
	},
	born			:	function(landLi,json){
		this._super(landLi,json);
		this.survey();
		return this;
	},
	survey			:	function(){
		var This=this;
		clearInterval(this.surveyTimer);
		this.surveyTimer=setInterval(function(){
			var isFire=false;
			for(var i=0,corpseList=This.li.corpseList();i<corpseList.length;i++){
				var isIn=This.isIn(corpseList[i]);
				if (isIn){
					isFire=This.fire(corpseList[i]);
					break;
				}
			}
			if (!isFire){
				clearInterval(This.fireTimer);
			}
		},this.surveyF);
		return this;
	},
	isIn			:	function(corpse){
		//活僵尸进入检测区  此处用的是土地横格边界做的判断,在屋顶的时候很显然就会出错,但先这样吧!
		return corpse.isLiving&&this.right()<=corpse.left()
			&&corpse.left()<=(this.li.width()*this.li.brotherLength()+_FC.LI_LEFT);
	},
	fire			:	function(corpse){
		//这里以后会设计成从缓存中取子弹
		//右行子弹创建
		if (this.isHasShot){
			return this;
		}
		/**
		 new Bullet({
								type		:	this.defaultBulletType,
								plant		:	this,
								plantLeft	:	this.left(),
								plantRight	:	this.right(),
								rowUl		:	this.li.ul()
							}).born();
		 */
		this.li.manager.game.bulletManager.getBullet().born({
			type		:	this.defaultBulletType,
			plant		:	this,
			plantLeft	:	this.left(),
			plantRight	:	this.right(),
			rowUl		:	this.li.ul()
		});
		this.isHasShot=true;
		/**
		 //左行子弹创建
		 new Bullet({
								type		:	this.defaultBulletType,
								plantLeft	:	this.left(),
								plantRight	:	this.right(),
								rowUl		:	this.li.ul(),
								direction	:	-1
							}).born();
		 */
		return this;
	}
});
/*
 防御植物类------>其实这玩意好像没什么用一旦有任何一种其他功能它就变成了其他类植物，防御本身血厚就好了嘛!~~~~直接继承父类呗!
 */
var DefensePlant=Plant.extend({
	init			:	function(json){
		this._super(json);
		return this;
	}
});

/*
 向日葵
 */
var SunFlower=EconomicPlant.extend({
	init			:	function(json){
		this._super({
			name		:	'SunFlower',
			path		:	'images/Plants/SunFlower/',
			createSunValue	:	25,
			imgLib		:	{
				cardImg		:	{1:'SunFlower.png',0:'SunFlowerG.png'},
				hurtState	:	{0:'SunFlower.gif'}
			}
		});
		this._super(json);
		return this;
	}
});
/*
 豌豆射手
 */
var Peashooter= AttackPlant.extend({
	init			:	function(json){
		this._super({
			name		:	'Peashooter',
			imgLib		:	{
				cardImg		:	{1:'Peashooter.png',0:'PeashooterG.png'},
				hurtState	:	{0:'Peashooter.gif'}
			}
		});
		this._super(json);
		return this;
	}
});


/*
 小土豆地雷
 */
var PotatoMine=AttackPlant.extend({
	init			:	function(json){
		this._super({
			name		:	'PotatoMine',
			path		:	'images/Plants/PotatoMine/',
			isAult		:	false,
			growUpTime	:	15*1000,
			imgLib		:	{
				cardImg		:	{1:'PotatoMine.png',0:'PotatoMineG.png'},
				hurtState	:	{0:'PotatoMine.gif'},
				xipu		:	'ExplosionSpudow.gif',
				boom		:	'PotatoMine_mashed.gif',
				ault		:	'PotatoMine.gif',
				baby		:	'PotatoMineNotReady.gif'
			}
		});
		this._super(json);
		return this;
	},
	born			:	function(landLi,json){
		var This=this;
		this._super(landLi,json);
		This.actionImg.src=This.path+This.imgLib.baby;
		setTimeout(function(){
			This.actionImg.src=This.path+This.imgLib.ault;
			This.isAult=true;
		},this.growUpTime);
		return this;
	},
	isIn			:	function(corpse){
		return corpse.isLiving&&(corpse.left()<=this.right()+this.li.width()/2.5)&&!(corpse.right()<=this.left())
		//return corpse.isLiving&&(this.right()>=corpse.left()||this.left()<=corpse.right());
	},
	fire			:	function(corpse){
		if (!this.isAult){
			return this;
		}
		var This=this;
		this.xipu();
		for(var i=0,corpseList=This.li.corpseList();i<corpseList.length;i++){
			var isIn= corpseList[i].isLiving&&((this.right()+this.li.width()/2)>=corpseList[i].left()
				||(this.left()-this.li.width()/2)<=corpseList[i].right());
			if (isIn){
				corpseList[i].beated(0,'boom');
			}
		}
		this.actionImg.src=This.path+This.imgLib.boom;
		setTimeout(function(){
			This.dead();
		},1500);
		return this;
	},
	xipu			:	function(){
		var oXipu=c('img',{src:this.path+this.imgLib.xipu},document.body);
		css(oXipu,{
			position	:	'absolute',
			left		:	this.right()+'px',
			top			:	this.top()+'px',
			zIndex		:	3000
		});
		setTimeout(function(){
			document.body.removeChild(oXipu);
		},1000);
	}

});
/*
 樱桃炸弹
 */
var CherryBomb=AttackPlant.extend({
	init			:	function(json){
		this._super({
			name		:	'CherryBomb',
			path		:	'images/Plants/CherryBomb/',
			boomTimer	:	500,
			deadTimer	:	500,
			imgLib		:	{
				cardImg			:	{0:'CherryBombG.png',1:'CherryBomb.png'},
				hurtState		:	{0:'CherryBomb.gif'},
				boom			:	'Boom.gif'
			}
		});
		this._super(json);
		return this;
	},
	born			:	function(landLi,json){
		var This=this;
		this._super(landLi,json);
		setTimeout(function(){
			This.fire();
			This.actionImg.src=This.path+This.imgLib['boom'];
			css(This.actionImg,{
				position		:	'absolute',
				left			:	(This.li.left()+This.li.width()/2-This.actionImg.offsetWidth/2)+'px',
				top				:	(This.li.top()+This.li.height()/2-This.actionImg.offsetHeight/2)+'px'
			});
			setTimeout(function(){
				This.dead();
			},This.deadTimer);
		},this.boomTimer);
		return this;
	},
	fire			:	function(corpse){
		var index=this.li.rowIndex();
		var cols=[index,index-1,index+1];
		for(var j=0;j<cols.length;j++){
			if (cols[j]<this.li.manager.getTopUlIndex()||cols[j]>this.li.manager.getBottomUlIndex()){
				continue;
			}
			for(var i=0,corpseList=this.li.corpseList(cols[j]);i<corpseList.length;i++){
				var isIn= corpseList[i].isLiving&&
					((this.li.right()+this.li.width()+corpseList[i].width())>=corpseList[i].right()
					&&(this.li.left()-this.li.width()-corpseList[i].width())<=corpseList[i].left());
				if (isIn){
					corpseList[i].beated(0,'boom');
				}
			}
		}
		return this;
	}
});
/*
 食人花
 */
var Chomper=AttackPlant.extend({
	init			:	function(json){
		this._super({
			name		:	'Chomper',
			path		:	'images/Plants/Chomper/',
			rightBlankSpace	:	40,
			topBlankSpace	:	20,
			isDigest	:	false,
			digestTimer	:   60*1000,
			imgLib		:	{
				cardImg			:	{0:'ChomperG.png',1:'Chomper.png'},
				hurtState		:	{0:'Chomper.gif'},
				eat				:	'ChomperAttack.gif',
				digest			:	'ChomperDigest.gif'
			}
		});
		this._super(json);
		return this;
	},
	isIn			:	function(corpse){
		//原版的食人花绝对能隔着一个植物吃人,可这个图片就这样了，我加上这个宽度反而显得诡异了,于是就除个2.5吧!
		//corpse.isLiving&&(corpse.left()<=this.right()+this.li.width());
		return corpse.isLiving&&(corpse.left()<=this.right()+this.li.width()/2.5)&&!(corpse.right()<=this.left());
	},
	fire			:	function(corpse){
		var This=this;
		if (this.isDigest){
			return this;
		}
		this.actionImg.src=this.path+this.imgLib.eat;
		this.isDigest=true;
		setTimeout(function(){
			corpse.beated(0,'eat');
			This.actionImg.src=This.path+This.imgLib.digest;
		},800);
		setTimeout(function(){
			This.isDigest=false;
			This.actionImg.src=This.path+This.imgLib.hurtState[0];
		},this.digestTimer);
		return this;
	}

});
/*
 小坚果墙
 */
var WallNut=DefensePlant.extend({
	init			:	function(json){
		this._super({
			name		:	'WallNut',
			blood		:	1000,
			path		:	'images/Plants/WallNut/',
			imgLib		:	{
				cardImg			:	{0:'WallNutG.png',1:'WallNut.png'},
				hurtState		:	{0:'WallNut.gif',1:'Wallnut_cracked1.gif',2:'Wallnut_cracked2.gif'}
			},
			hurtLevelBlood	:	{0:1000,1:600,2:200}
		});
		this._super(json);
		return this;
	}
});
/*
 大坚果墙
 */
var TallNut=DefensePlant.extend({
	init			:	function(json){
		this._super({
			name		:	'TallNut',
			blood		:	3000,
			path		:	'images/Plants/TallNut/',
			imgLib		:	{
				cardImg			:	{0:'TallNutG.png',1:'TallNut.png'},
				hurtState		:	{0:'TallNut.gif',1:'TallnutCracked1.gif',2:'TallnutCracked2.gif'}
			},
			hurtLevelBlood	:	{0:3000,1:1600,2:600}
		});
		this._super(json);
		return this;
	}
});
