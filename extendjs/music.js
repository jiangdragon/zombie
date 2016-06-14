/*
 音乐管理类
 */
var MusicManager=Manager.extend({
	init			:	function(json){
		this.player={};
		this.container={};
		this.object={};
		this.path='music/';
		this.currentPlay='';
		this.musicLib={
			main		:	'Watery Graves.swf',//'Faster.swf',
			faster		:	'Faster.swf'
		};
		this._super(json);
		return this.initContainer();
	},
	initContainer	:	function(){
		css(this.container=c('div',{id:'musicContainer'},document.body),{
			height		:	'0px'
		});
		this.play();
		var This=this;
		var i=0;
		setInterval(function(){
			var name=i%2==1?'faster':'main';
			This.change(name);
			i++;
		},60*1000);
		return this;
	},
	initPlayer		:	function(src){
		this.container.innerHTML=this.getHtml(src);
		return this;
	},
	getHtml			:	function(name){
		return '<object width="0" height="0" align="middle">'
			+		'<param name="allowScriptAccess" value="always">'
			+		'<param name="allowFullScreen" value="false">'
			+		'<param name="movie" value="'+this.path+this.musicLib[name||'main']+'">'
			+		'<param name="quality" value="high">'
			+		'<param name="bgcolor" value="#ffffff">'
			+		'<embed width="0" height="0" src="'+this.path+this.musicLib[name||'main']+'" quality="high" align="middle"					play="true" loop="true"	scale="showall" wmode="window" devicefont="false" bgcolor="#ffffff" name="ad"					menu="true"	allowfullscreen="false" allowscriptaccess="always" salign=""												type="application/x-shockwave-flash">'
			+	'</object>';
	},
	play			:	function(name){
		this.initPlayer(name);
		return this;
	},
	change			:	function(name){
		this.stop();
		this.play(name);
		return this;
	},
	stop			:	function(){
		this.container.innerHTML='';
		return this;
	}
});