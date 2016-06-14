/**
 僵尸管理类
 */
var CorpseManager=Base.extend({
	init			:	function(json){
		this.game={};
		this.corpseFactory=new CorpseFactory({manager:this});
		this._super(json);
		return this;
	},
	resetCache		:	function(arr){
		this.corpseFactory.resetCache(arr);
		return this;
	},
	getCorpse		:	function(name){
		return this.corpseFactory.get(name);
	},
	corpseComeOn	:	function(arr,isIntellect){
		var result=false;
		var index=0;
		var landIndex=0;
		var corpse={};
		while(!result){
			if (arr.length==0){
				result=true;
			}else{
				index=getRandom(0,arr.length-1);
				for(var key in arr[index]){
					if (arr[index][key]<=0){
						arr.del(arr[index]);
						break;
					}else{
						corpse=this.corpseFactory.get(key);
						if (isIntellect){
							var min=0;
							var select=[];
							for(var i=0,aUl=this.game.land.aUl;i<aUl.length;i++){
								if (i==0) min=aUl[i].corpseList.length;
								if (min>aUl[i].corpseList.length){
									min=aUl[i].corpseList.length;
									select=[];
									select.push(i);
								}else if (min==aUl[i].corpseList.length){
									select.push(i);
								}
							}
							landIndex=select[getRandom(0,select.length-1)];
							//alert(select+'---'+landIndex);
						}else{
							landIndex=getRandom(0,this.game.land.aUl.length-1);
						}
						corpse.born(this.game.land.aUl[landIndex]);
						arr[index][key]--;
						return result;
					}
				}
			}
		}
		return result;
	}
});
/*
 僵尸的父类
 */

var Corpse=Base.extend({
	init			:	function(json){
		//僵尸的名字
		this.name='';
		//僵尸的血量
		this.blood=400;
		//包裹僵尸的盒子,用于移动，碰撞检测等---->设计多余了,貌似没用!
		this.box='';
		//层级
		this.zIndex=10;
		//僵尸是否是活的?貌似本来就是死了才是僵尸......
		this.isLiving=true;
		//默认的僵尸的初始出生位置的左边距
		this.defaultLeft=1000;
		//默认的僵尸的初始出生位置的上边距
		this.defaultTop=400;
		//僵尸每一帧的移动速度
		this.speed=1;
		//行走的频率
		this.walkF=90;
		//攻击的频率
		this.attackF=500;
		//图片文件夹
		this.path='images/Zombies/Zombie/';
		//卸甲图片文件夹
		this.unloadArmorLevelPath='images/Zombies/Zombie/';
		//僵尸当前的动作，枚举值
		this.action='free'//this.action='sleep';
		//僵尸当前的动作图片
		this.actionImg='';
		/**
		 动作图片的宽高,妈的我算是服了浏览器在图片没加载完取宽高不准这事了,擦我自己动定义着总行了吧
		 其实这个可以定义成死的,只要是僵尸的行走图片的宽高就行,因为就是僵尸在一开始的时候需要用宽高定位
		 以后出现意外再说,我可实在不想每个图片定义一个属性记着宽高
		 要么就把所有图片在开始的loading界面全家加载进来然后把层级设的极低，之后所有的东西层级都比他们高
		 把他们挡在最底下需要出现时再改层级可惜我一开始不是这么设计的以后再说吧
		 */
		this.actionImgWidth=166;
		this.actionImgHeight=144;
		//僵尸的攻击力
		this.attackPow=20;
		//僵尸的损伤级别，用于切换图片
		this.hurtLevel=0;
		//伤害分级血量标准
		this.hurtLevelBlood={0:400,1:150};
		//卸掉装备的级别
		this.unloadArmorLevel=0;
		//是否卸掉了装备
		this.isUnloadArmor=false;
		//是否掉了脑袋
		this.isLostHead=false;
		//图片左侧的空白宽度
		this.leftBlankSpace=80;
		//图片右侧的空白宽度
		this.rightBlankSpace=30;
		//图片上面的空白
		this.topBlankSpace=0;
		//图片下面的空白
		this.bottomBlankSpace=0;
		//僵尸所在行的Ul
		this.rowUl=null;
		//移动定时器
		this.moveTimer=null;
		//死亡定时器
		this.deadTimer=null;
		//攻击定时器
		this.attackTimer=null;
		//被攻击定时器
		this.beatedTimer=null;
		//探测定时器
		this.surveyTimer=null;
		//减速延时器,移动和攻击速度都受这个影响
		this.slowTimer=null;
		//该僵尸所有的图片包
		this.imgLib={
			attack		:	{0:'ZombieAttack.gif',1:'ZombieLostHeadAttack.gif'},
			//iceAttack	:	{},
			walk		:	{0:'Zombie2.gif',1:'ZombieLostHead.gif'},
			//iceWalk		:	{},
			free		:	{0:'1.gif',1:'2.gif',2:'3.gif'},
			lostHead	:	'ZombieHead.gif',
			//iceLostHead	:	{},
			//iceDead	:	{},
			die			:	{normal:'ZombieDie.gif',boom:'boomDie.gif'}
			//先默认这些级别的血量都比掉脑袋的血量高

		};
		this._super(json);
		return this.setActionImg();
	},
	setActionImg	:	function(){
		this.actionImg=c('img',{/*src:this.path+this.getActionImg()*/},document.body);
		this.setActionSrc();
		this.actionImg.style.display='none';
		return this;
	},
	setActionSrc	:	function(){
		this.actionImg.src=this.path+this.getActionImg();
		return this;
	},
	born			:	function(rowUl,json){
		if (rowUl){
			this.rowUl=rowUl;
		}
		if (json){
			this.init(json);
		}
		this.rowUl.corpseList.push(this);
		css(this.actionImg,{
			zIndex		:	100+this.rowUl.index,
			display		:	'block',
			position	:	'absolute',
			left		:	this.defaultLeft+'px',
			top			:	(realOffset(this.rowUl.children[0],'top')+this.rowUl.children[0].offsetHeight-
			_FC.RANGE_LI_BOTTOM-this.actionImgHeight-this.topBlankSpace)+'px',
			border		:	_FC.DEBUG?'1px solid yellow':''
		});
		this.walk();
		return this;
	},
	//僵尸死亡
	dead			:	function(attackType){
		var This=this;
		this.clearInfo();
		this.isLiving=false;
		if (attackType&&attackType.toLowerCase()=='eat'){
			document.body.removeChild(This.actionImg);
			This.rowUl.corpseList.del(This);
		}else{
			this.actionImg.src=(!this.isUnloadArmor?this.unloadArmorLevelPath:this.path)+this.getDeadImg(attackType);
			This.rowUl.corpseList.del(This);
			setTimeout(function(){
				document.body.removeChild(This.actionImg);
			},5000);
		}
		//return true;
	},
	//僵尸移动
	walk			:	function(f){
		var This=this;
		this.survey();
		this.updateAction('walk');
		//this.actionImg.src=this.path+(this.hurtLevel?'ZombieLostHead.gif':'Zombie2.gif');
		clearInterval(this.moveTimer);
		this.moveTimer=setInterval(function(){
			css(This.actionImg,{
				left	:	(realOffset(This.actionImg,'left')-This.speed)+'px'
			});
			//This.beated(1,'boom');
			if (This.left()<=_FC.HOME_LEFT_SIDE&&This.isLiving){
				clearInterval(This.moveTimer);
				alert('你的猪脑子被吃了!~');
			}
		},f?f:this.walkF);
		return this;
	},
	//停止僵尸的所有动作 
	sleep			:	function(){
		return this;
	},
	//僵尸攻击
	attack			:	function(plant){
		var This=this;
		this.updateAction('attack');
		clearInterval(this.moveTimer);
		clearInterval(this.attackTimer);
		clearInterval(this.surveyTimer);
		this.attackTimer=setInterval(function(){
			if(!plant.beated(This.attackPow)){
				clearInterval(This.attackTimer);
				This.walk();
			}
		},this.attackF);
		return this;
	},
	//僵尸的特殊技能
	skill			:	function(){
		return this;
	},
	//僵尸被打
	beated			:	function(attackPow,attackType,attackTypePow){
		var This=this;
		//先检测是否是特殊的死亡方式
		this.specialBeat(attackType);
		this.blood-=(attackPow+(attackTypePow?attackTypePow:0));
		move(this.actionImg,{opacity:50},function(){
			move(This.actionImg,{opacity:100},null,10);
		},10);

		return this.updateLevel(attackType);
	},
	updateLevel		:	function(attackType){
		if (this.hurtLevelBlood[this.hurtLevel+1]&&this.blood<=this.hurtLevelBlood[this.hurtLevel+1]){
			this.hurtLevel++;
			if (this.hurtLevel&&this.hurtLevel==this.unloadArmorLevel){
				this.path=this.unloadArmorLevelPath;
				this.isUnloadArmor=true;
			}
			this.setActionSrc();
			//留一个级别变化后调用的接口
			this.onLevelChange();
		}
		if (this.blood<=0){
			this.dead();
			return false;
		}else if(this.blood<=150&&this.blood>0&&!this.isLostHead){//&&!this.hurtLevel
			//this.hurtLevel++;
			this.isLostHead=true;
			this.lostHead();
		}
		return true;
	},
	//留给子类想拓展updateLevel又不想全重写用的
	onLevelChange	:	function(){
		return this;
	},
	//被特殊技攻击时调用
	specialBeat		:	function(attackType){
		var This=this;
		if (attackType.toLowerCase()=='ice'){
			this.walkF*=3;
			clearTimeout(this.slowTimer);
			this.slowTimer=setTimeout(function(){
				This.walkF/=3;
			},1000);
		}else if (attackType.toLowerCase()=='eat'||attackType.toLowerCase()=='boom'){
			this.dead(attackType);
		}
		return this;
	},
	//僵尸掉脑袋
	lostHead		:	function(){
		this.setActionSrc();
		this.storyboard({
			left		:	this.left(),
			top			:	(this.top()-34),
			//哎呀就这样一个脑袋,写死了吧,前面那块猝死和正常死亡抢一个文件夹路径已经不可开交了,你就别搀和了
			imgSrc		:	this.imgLib.lostHead.indexOf('/')!=-1?this.imgLib.lostHead:
			'images/Zombies/Zombie/'+this.imgLib.lostHead,//this.path+this.imgLib.lostHead,
			time		:	5000
		});
		return this;
	},
	storyboard		:	function(json){
		var oDiv=c('div',{},document.body);
		css(oDiv,{
			width		:	this.actionImg.offsetWidth+'px',
			height		:	this.actionImg.offsetHeight+'px',
			display		:	'block',
			zIndex		:	this.zIndex+100,
			position	:	'absolute',
			left		:	json.left+'px',
			top			:	json.top+'px',
			border		:	_FC.DEBUG?'1px solid green':''
		});
		var oImg=c('img',{src:json.imgSrc},oDiv);
		setTimeout(function(){
			document.body.removeChild(oDiv);
		},json.time);
		return this;
	},
	//获取僵尸图形(注意我说的不是图片)距离屏幕的左距离
	left			:	function(){
		return realOffset(this.actionImg,'left')+this.leftBlankSpace;
	},
	//获取僵尸图形右侧距离屏幕的距离
	right			:	function(){
		return realOffset(this.actionImg,'left')+this.actionImg.offsetWidth-this.rightBlankSpace;
	},
	//获取僵尸距离屏幕的顶距离
	top				:	function(){
		return realOffset(this.actionImg,'top')+this.topBlankSpace;
	},
	//僵尸的宽度(注意我说的不是图片)
	width			:	function(){
		return this.actionImg.offsetWidth-this.leftBlankSpace-this.rightBlankSpace;
	},
	//僵尸的高度
	height			:	function(){
		return this.actionImg.offsetWidth-this.topBlankSpace-this.bottomBlankSpace;
	},
	//僵尸只找自己面前的植物进行检测是否攻击(后面的不管)
	survey			:	function(){
		var This=this;
		clearInterval(this.surveyTimer);
		this.surveyTimer=setInterval(function(){
			for(var i=0,list=This.rowUl.plantList,len=list.length;i<len;i++){
				if (list[i].left()>This.left()) continue;
				if (This.left()<=list[i].right()){
					clearInterval(This.surveyTimer);
					This.attack(list[i]);
					break;
				}
			}
		},30);
		return this;
	},
	getActionImg	:	function(){
		return this.imgLib[this.action][this.hurtLevel];
	},
	getDeadImg		:	function(attackType){
		return this.imgLib.die[attackType?attackType:'normal'];
	},
	updateAction	:	function(action){
		this.action=action;
		//this.actionImg.src=this.path+this.getActionImg();
		return this.setActionSrc();
	},
	//清除所有的定时器 
	clearInfo		:	function(array){
		clearInterval(this.moveTimer);
		clearInterval(this.attackTimer);
		clearInterval(this.beatedTimer);
		clearInterval(this.deadTimer);
		clearInterval(this.surveyTimer);
		clearInterval(this.timer);
		clearTimeout(this.slowTimer);
		if (array){
			for(var i=0,len=array.length;i<len;i++){
				clearInterval(array[i]);
				clearTimeout(array[i]);
			}
		}
		return this;
	}

});


/*
 普通的僵尸
 */
var Zombie=Corpse.extend({
	init			:	function(json){
		this._super(json);
		this.imgLib={
			attack		:	{0:'ZombieAttack.gif',1:'ZombieLostHeadAttack.gif'},
			//iceAttack	:	{},
			walk		:	{0:'Zombie3.gif',1:'ZombieLostHead.gif'},
			//iceWalk		:	{},
			free		:	{0:'3.gif',1:'2.gif',2:'3.gif'},
			lostHead	:	'ZombieHead.gif',
			//iceLostHead	:	{},
			//iceDead	:	{},
			die			:	{normal:'ZombieDie.gif',boom:'boomDie.gif'}
		};
		return this;
	}
});
/*
 草帽僵尸
 */
var StrawHat=Corpse.extend({
	init			:	function(json){

		this._super({
			name		:	'StrawHat',
			blood		:	600,
			path		:	'images/Zombies/ConeheadZombie/',
			imgLib		:	{
				attack		:	{0:'ConeheadZombieAttack.gif',1:'ZombieAttack.gif',2:'ZombieLostHeadAttack.gif'},
				//iceAttack	:	{},
				walk		:	{0:'ConeheadZombie.gif',1:'Zombie2.gif',2:'ZombieLostHead.gif'},
				//iceWalk		:	{},
				free		:	{0:'1.gif',1:'1.gif',2:'3.gif'},
				lostHead	:	'ZombieHead.gif',
				//iceLostHead	:	{},
				//iceDead	:	{},
				die			:	{normal:'ZombieDie.gif',boom:'boomDie.gif'}
			},
			hurtLevelBlood	:	{0:600,1:400,2:150}	,
			unloadArmorLevel	:	1
		});
		this._super(json);
		return this;
	}
});
/*
 铁桶僵尸
 */
var FePail=Corpse.extend({
	init			:	function(json){
		this._super({
			name		:	'FePail',
			blood		:	800,
			path		:	'images/Zombies/BucketheadZombie/',
			imgLib		:	{
				attack		:	{0:'BucketheadZombieAttack.gif',1:'ZombieAttack.gif',2:'ZombieLostHeadAttack.gif'},
				//iceAttack	:	{},
				walk		:	{0:'BucketheadZombie.gif',1:'Zombie2.gif',2:'ZombieLostHead.gif'},
				//iceWalk		:	{},
				free		:	{0:'1.gif',1:'1.gif',2:'3.gif'},
				lostHead	:	'ZombieHead.gif',
				//iceLostHead	:	{},
				//iceDead	:	{},
				die			:	{normal:'ZombieDie.gif',boom:'boomDie.gif'}
			},
			hurtLevelBlood	:	{0:800,1:400,2:150}	,
			unloadArmorLevel	:	1
		});
		this._super(json);
		return this;
	}
});
/*
 撑杆跳僵尸
 */
var PoleVault=Corpse.extend({
	init			:	function(json){
		this._super({
			name		:	'Newspaper',
			blood		:	700,
			leftBlankSpace	:	180,
			rightBlankSpace	:	80,
			topBlankSpace	:	70,
			bottomBlankSpace:	16,
			actionImgHeight	:	130,
			speed		:	2,
			isHadJump	:	false,
			path		:	'images/Zombies/PoleVaultingZombie/',
			//对于没有变身还想用自己的死亡图片的僵尸类一定要把这个属性加上
			unloadArmorLevelPath	:	'images/Zombies/PoleVaultingZombie/',
			imgLib		:	{
				attack		:	{
					0	:	'PoleVaultingZombieAttack.gif',
					1	:	'PoleVaultingZombieAttack.gif',
					2	:	'PoleVaultingZombieLostHeadAttack.gif'
				},
				walk		:	{
					0	:	'PoleVaultingZombie.gif',
					1	:	'PoleVaultingZombieWalk.gif',
					2	:	'PoleVaultingZombieLostHeadWalk.gif'
				},
				free		:	{0:'1.gif',1:'1.gif',2:'3.gif'},
				lostHead	:	'images/Zombies/PoleVaultingZombie/PoleVaultingZombieHead.gif',
				jump		:	{0:'PoleVaultingZombieJump.gif',1:'PoleVaultingZombieJump2.gif'},
				die			:	{normal:'PoleVaultingZombieDie.gif',boom:'BoomDie.gif'}
			},
			hurtLevelBlood	:	{0:700,1:500,2:150}
		});
		this._super(json);
		return this;
	},
	onLevelChange	:	function(){
		if (this.hurtLevel==1&&!this.isHadJump){
			this.hurtLevel--;
			this.setActionSrc();
			this.hurtLevel++;
		}
		return this;
	},
	attack			:	function(plant){
		if (this.hurtLevel!=2&&!this.isHadJump){
			this.jump(plant);
		}else{
			this._super(plant);
		}
		return this;
	},
	jump			:	function(plant){
		var This=this;
		this.clearInfo();
		this.actionImg.src=this.path+this.imgLib.jump[0];
		setTimeout(function(){
			if (!this.isLiving){
				return This;
			}
			//还得判断植物是不是大坚果墙若果是跳不过去
			css(This.actionImg,{
				left	:	(realOffset(This.actionImg,'left')-This.actionImg.offsetWidth+This.leftBlankSpace+50)+'px'
			});
			This.actionImg.src=This.path+This.imgLib.jump[1];
			setTimeout(function(){
				This.isHadJump=true;
				This.hurtLevel=1;
				/*
				 css(This.actionImg,{
				 left	:	(plant.left()-2)+'px'
				 });
				 */
				This.speed=1;
				This.walk();
			},1000);
		},1000);
		return this;
	}
});
/*
 看报纸僵尸
 */
var Newspaper=Corpse.extend({
	init			:	function(json){
		this._super({
			name		:	'Newspaper',
			blood		:	700,
			path		:	'images/Zombies/NewspaperZombie/',
			//对于没有变身还想用自己的死亡图片的僵尸类一定要把这个属性加上
			unloadArmorLevelPath	:	'images/Zombies/NewspaperZombie/',
			imgLib		:	{
				attack		:	{0:'HeadAttack1.gif',1:'HeadAttack0.gif',2:'LostHeadAttack0.gif'},
				//iceAttack	:	{},
				walk		:	{0:'HeadWalk1.gif',1:'HeadWalk0.gif',2:'LostHeadWalk0.gif'},
				//iceWalk		:	{},
				free		:	{0:'1.gif',1:'1.gif',2:'3.gif'},
				lostHead	:	'images/Zombies/NewspaperZombie/Head.gif',
				lostNewspaper	: 'LostNewspaper.gif',
				//iceLostHead	:	{},
				//iceDead	:	{},
				die			:	{normal:'Die.gif',boom:'BoomDie.gif'}
			},
			hurtLevelBlood	:	{0:700,1:500,2:150}
		});
		this._super(json);
		return this;
	},
	onLevelChange	:	function(){
		var This=this;
		if (this.hurtLevel==1){
			this.speed*=3;
			this.clearInfo();
			this.actionImg.src=this.path+this.imgLib.lostNewspaper;
			setTimeout(function(){
				This.walk();
			},500);
		}
		return this;
	}
});
/*
 橄榄球僵尸
 */
var Football=Corpse.extend({
	init			:	function(json){
		this._super({
			name		:	'Football',
			speed		:	3,
			blood		:	1200,
			path		:	'images/Zombies/FootballZombie/',
			//对于没有变身还想用自己的死亡图片的僵尸类一定要把这个属性加上
			unloadArmorLevelPath	:	'images/Zombies/FootballZombie/',
			imgLib		:	{
				attack		:	{0:'Attack.gif',1:'FootballZombieOrnLostAttack.gif',2:'LostHeadAttack.gif'},
				//iceAttack	:	{},
				walk		:	{0:'FootballZombie.gif',1:'FootballZombieOrnLost.gif',2:'LostHead.gif'},
				//iceWalk		:	{},
				free		:	{0:'1.gif',1:'1.gif',2:'3.gif'},
				lostHead	:	'ZombieHead.gif',
				//iceLostHead	:	{},
				//iceDead	:	{},
				die			:	{normal:'Die.gif',boom:'BoomDie.gif'}
			},
			hurtLevelBlood	:	{0:1200,1:600,2:150}
		});
		this._super(json);
		return this;
	}
});
/*
 杰克逊的小弟僵尸
 */

/*
 杰克逊僵尸
 */

