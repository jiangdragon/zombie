/**
 关卡类,但是我想叫他剧本
 没什么特别的，重点是剧情配置
 */
function Drama(json){
	//剧本所在菜单
	this.game={};
	//当前播出是第几季
	this.currentBroadcasrSeason=1;
	//当前播出集数
	this.currentBroadcastEpisode=1;
	//时间节点
	this.timing=['f','h','s','l'];
	//当前时间节点索引
	this.timingIndex=0;
	this.timingTimer=null;
	this.planTimer=null;
	this.plan={f:[],h:[],s:[],l:[]};
	//是否都出现了
	this.isAll=false;
	//时间节点僵尸密集系数
	this.denseCoefficient={
		f		:	2/10,
		h		:	3/10,
		s		:	2/10,
		l		:	3/10
	};
	//时间节点僵尸出生频率
	this.bornF={
		f		:	15*1000,
		h		:	5*100,
		s		:	13*1000,
		l		:	3*100
	};

	this.plot=DNA_plot;

	this.init(json);
}
Drama.prototype={
	init			:	function(json){
		for(var key in json ){
			this[key]=json[key];
		}
		return this;
	},
	//创作
	scriptDrama		:	function(json){
		this.init(json);
		this.initCorpseCache();
		return this;
	},
	initCorpseCache	:	function(){
		var neadCache=[];
		var cor=this.get('actorList').corpse;
		for(var key in cor ){
			if (cor[key].count>=5){
				neadCache.push[key];
			}
		}
		this.parseEpisode();
		this.game.corpseManager.resetCache(neadCache);
	},
	//开始播出 
	play			:	function(json){
		var This=this;
		this.planTimer=setTimeout(function(){
			This.corpseComeOn();
			This.timingPlay();
		},this.getPlanTime());
		return this;
	},
	timingPlay		:	function(){
		var This=this;
		clearInterval(this.timingTimer);
		this.timingTimer=setInterval(function(){
			This.corpseComeOn();
		},this.bornF[this.timing[this.timingIndex]]);
		return this;
	},
	corpseComeOn	:	function(){
		var This=this;
		var result=this.game.corpseComeOn(this.plan[this.timing[this.timingIndex]],this.get('isIntellect'));
		if (result){
			this.timingIndex++;
			clearInterval(this.timingTimer);
			if (this.timingIndex==this.timing.length){
				this.isAll=true;
			}else{
				setTimeout(function(){
					This.timingPlay();
				},20*1000);
			}
		}
		return this;
	},
	//重新播出 
	reprise			:	function(){
		clearTimeout(this.planTimer);
		return this;
	},
	//下一集
	nextEpisode		:	function(){

		return this;
	},
	//指定某一集
	appointEpisode	:	function(episodeId){

		return this;
	},
	//追加新一集
	appendEpisode	:	function(){
		return this;
	},
	//获得计划时间
	getPlanTime		:	function(){
		return this.plot[this.currentBroadcasrSeason][this.currentBroadcastEpisode].planTime;
	},
	//获得当前任何东西
	get				:	function(str){
		return this.plot[this.currentBroadcasrSeason][this.currentBroadcastEpisode][str];
	},
	//获得总季数
	getSeasonCount	:	function(){
		var result=0;
		for(var key in this.plot){
			result++;
		}
		return result;
	},
	//获得总集数
	getEpisodeCount	:	function(season){
		var result=0;
		for(var key in this.plot[season]){
			result++;
		}
		return result;
	},
	//解析本集
	parseEpisode	:	function(){
		var corpseActorList=this.plot[this.currentBroadcasrSeason][this.currentBroadcastEpisode].actorList.corpse;
		var app='';
		var aTiming=[];
		var always='f&h&s&l';
		for(var key in corpseActorList){
			app=corpseActorList[key].appearTiming.indexOf('a')!=-1?always:corpseActorList[key].appearTiming;
			aTiming=app.split('&');
			var count=0;
			var num=0;
			for(var i=0;i<aTiming.length;i++){
				if (i==aTiming.length-1){
					num=corpseActorList[key].count-count;
					count=0;
				}else{
					num=parseInt(this.denseCoefficient[aTiming[i]]*corpseActorList[key].count);
					count+=num;
				}
				//this.plan[aTiming[i]].push(eval('{'+key+':'+num+'}');//--->这么玩不行？
				var temp={};
				temp[key]=num;
				this.plan[aTiming[i]].push(temp);
			}
		}
		return this;
	}
};