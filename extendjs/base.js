/*
 实现继承功能
 */
(function() {
	var initializing = false;
	jClass = function() { };
	jClass.extend = function(prop) {
		var baseClass = null;
		if (this !== jClass) {
			baseClass = this;
		}
		function F() {
			if (!initializing) {
				if (baseClass) {
					this._superprototype = baseClass.prototype;
				}
				this.init.apply(this, arguments);
			}
		}
		if (baseClass) {
			initializing = true;
			F.prototype = new baseClass();
			F.prototype.constructor = F;
			initializing = false;
		}
		F.extend = arguments.callee;
		for (var name in prop) {
			if (prop.hasOwnProperty(name)) {
				if (baseClass && typeof (prop[name]) === "function" && typeof (F.prototype[name]) === "function" && /\b_super\b/.test(prop[name])) {
					F.prototype[name] = (function(name, fn) {
						return function() {
							this._super = baseClass.prototype[name];
							return fn.apply(this, arguments);
						};
					})(name, prop[name]);
				} else {
					F.prototype[name] = prop[name];
				}
			}
		}
		return F;
	};
})();
/*
 所有类的父类


 */
var Base=jClass.extend({
	init			:	function(json){
		return this.reset(json);
	},
	reset			:	function(json){
		for(var key in json){
			//模拟构造函数,只对属性初始化不对方法初始化
			if ((typeof json[key]).toLowerCase() =='function') continue;
			this[key]=json[key];
		}
		return this;
	}
});
/*
 游戏的主控制类  --->记得监察所有的born
 */
var Game=Base.extend({
	init			:	function(json){
		this.arg={
			game			:	this
		};
		//游戏的剧本类,也就是关卡信息
		this.drama= new Drama(this.arg);
		//游戏的菜单管理类,管理游戏中所有的菜单
		this.menu=new MenuManager(this.arg);
		//游戏的音乐管理类,管理所有的音效(淫笑)
		this.music=new MusicManager(this.arg);
		this.menu.showMainMenu();

		//阳光管理类 要初始化在card前面因为他要用
		this.sunshine=new SunshineManager({
			sunShineCount	:	10000,
			game			:	this
		});

		//游戏的土地管理类,管理游戏中的地图信息,这个也要初始化在card前面
		this.land={}
		//游戏的卡片管理类,管理游戏中所有的卡片信息(如:出场植物卡片,阳光卡片，铲子卡片，进度卡片等)
		//记得给上场植物列表
		this.card={};
		//游戏的植物工厂,管理所有植物的生产
		this.plantManager=new PlantManager(this.arg);

		//游戏的僵尸工厂,管理所有僵尸的生产
		this.corpseManager=new CorpseManager(this.arg);
		//游戏的子弹工厂,管理所有子弹的生产
		this.bulletManager=new BulletManager(this.arg);

		//已激活植物列表
		this.activationPlantList=[];
		//本轮登场僵尸配置
		this.appearCorpseList=[];
		this._super(json);
		return this.loading();
	},
	//游戏开始之前的加载动画
	loading			:	function(){
		return this;
	},
	//游戏开始
	start			:	function(season,episode){
		this.drama.scriptDrama({
			currentBroadcasrSeason	:	season||1,
			currentBroadcastEpisode	:	episode||1
		});
		this.land=new LandManager(this.arg).openedWasteland();
		this.card=new CardManager(this.arg).initCard().fillPlantCard();
		this.sunshine.beginShine();
		this.drama.play();
		//this.music.change();
		return this;
	},
	//游戏暂停功能,计划用aop实现
	pause			:	function(){
		return this;
	},
	gameover		:	function(){
		return this;
	},
	end				:	function(){
		alert('给你个大植物!~');
		return this;
	},
	getAllLand		:	function(){
		return this.land.aLi;
	},
	getSunshineCard	:	function(){
		return this.card.sunshineCard;
	},
	getSunCount		:	function(){
		return this.sunshine.sunShineCount;
	},
	corpseComeOn	:	function(arr,isIntellect){
		return this.corpseManager.corpseComeOn(arr,isIntellect);
	}
});
/*
 各种管理类的父类
 */
var Manager=Base.extend({
	init			:	function(json){
		this.game={};
		this._super(json);
		return this;
	}
});