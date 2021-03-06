function showStrategy2(keywords, suits){
	var suitNames = [];
	function haveKeywords(clothes){
		if(keywords == null){
			return true;
		}
		var strs = $.unique(clothes["name"].split(""));
		_size = strs.length + keywords.length;
		var newArray = $.merge(strs, keywords);
		size_ = $.unique(newArray).length;
		if(_size > size_)
			return true;
		return ($.inArray(clothes["isSuit"],suitNames)>=0);
	}
	
	var $strategy = $("<div/>").addClass("strategy_info_div");
		
	var theme = allThemes[$("#theme").val()];
	var filters = clone(criteria);
	filters.own = true;
	filters.missing = true;
	
	var $title = p($("#theme").val() == "custom" ? "....." : $("#theme").val(),"title");
	$strategy.append($title);
	
	var $author = p("配装器一键攻略@黑的升华", "author");
	$strategy.append($author);
	
	if(keywords != null){
		var $keywords_p = p("关键字: "+keywords, "");
		$strategy.append($keywords_p);
		$.each(suits, function(){
			suitNames.push(this.name + "(" + this.score + ")");
		});
		var $suits = p("套装: "+suitNames.join(", "), "");
		$strategy.append($suits);
	}
	
	var $skill_title = p("NPC's Skill: ", "skill_title");
	$strategy.append($skill_title);
	
	if($("#skillInfo").text()){
		var $skill_ops = p($("#skillInfo").text().replace("公主", "        公主"), "skill_ops");
		$strategy.append($skill_ops);
	}
	else if($("#theme").val().indexOf("竞技场") < 0) {
		var $skill_ops = p("对手技能: ", "skill_ops");
		$strategy.append($skill_ops);		
	}
	
	var $skill_my = p("Recommended Skills: ", "skill_my");
	if($("#theme").val().indexOf("竞技场") >= 0){
		$skill_my = p("推荐携带: 微笑 飞吻 挑剔 沉睡", "skill_my");
	}
	$strategy.append($skill_my);
	
	var $criteria_title = p("Attributes-" + (uiFilter["balance"] ? "Balanced Weight" : "Ture Weight") + ": ", "criteria_title");
	$strategy.append($criteria_title);
	
	var $criteria = p(getStrCriteria(filters),"criteria");
	$strategy.append($criteria);
	
	var $tag = p(getstrTag(filters), "tag");
	$strategy.append($tag);
	
	if($("#hintInfo").text()){
		var $hint = p($("#hintInfo").text().replace("Stage Hint:",""), "hint", "Stage Hint: ", "hint_tiele");
		$strategy.append($hint.clone());
	}
	else if($("#theme").val().indexOf("竞技场") < 0 && $("#theme").val().indexOf("联盟委托") < 0){
		var $hint = p("This stage doesn't have hint for now", "hint", "Stage Hint: ", "hint_tiele");
		$strategy.append($hint);
	}
	
	if($("#categoryFInfo").text()){
		var $F = p($("#categoryFInfo").text().replace("","").replace("会导致", "  <br/>  会导致"), "hint", "", "");
		$strategy.append($("#categoryFInfo").clone().attr("id", ""));
	}
		
	var $clotheslist_title = p("Recommended Items: ", "clotheslist_title");
	$strategy.append($clotheslist_title);
	
	for (var i in CATEGORY_HIERARCHY) {
		if(i == "Hosiery"){
			filters[CATEGORY_HIERARCHY[i][0]] = true;	
			filters[CATEGORY_HIERARCHY[i][1]] = true;	
		}
		if(i != "Accessory"){
			filters[CATEGORY_HIERARCHY[i]] = true;	
		}
		else{
			for (var j in CATEGORY_HIERARCHY[i]) {
				filters[CATEGORY_HIERARCHY[i][j]] = true;
			}			
		}
	}
	var result = {};
	for (var i in clothes) {		
		if (matches(clothes[i], {}, filters)) {
			clothes[i].calc(filters);
			if (clothes[i].isF||$.inArray(clothes[i].type.type,skipCategory)>=0||clothes[i].sumScore == 0) continue;
			if (keywords != null 
				&& (clothes[i].type.type == "Dress"
				|| clothes[i].type.type == "Top"
				|| clothes[i].type.type == "Bottom")
			) {
				if (!result["手选" + clothes[i].type.type]) {
					result["手选" + clothes[i].type.type] = [];
				}
				result["手选" + clothes[i].type.type].push(clothes[i]);
			}
			if (!haveKeywords(clothes[i]) && clothes[i].type.type != "萤光之灵") continue;
			if (!result[clothes[i].type.type]) {
				result[clothes[i].type.type] = [];
			}
			result[clothes[i].type.type].push(clothes[i]);
		}
	}	
	
	for (var r in result){
		result[r].sort(byActScore);
	}
	
	if(keywords != null){
		$strategy.append(p(getstrClothes(result["手选Dress"]), "clothes", "手选Dress", "clothes_category"));
		$strategy.append(p(getstrClothes(result["手选Top"]), "clothes", "手选Top", "clothes_category"));	
		$strategy.append(p(getstrClothes(result["手选Bottom"]), "clothes", "手选Bottom", "clothes_category"));
	}
	for (var c in category){
		var name = category[c];
		if(name.indexOf("Accessory")>=0)
			continue;
		if (result[name]){
			$strategy.append(p(getstrClothes(result[name]), "clothes", name, "clothes_category"));
		}
	}
	
	$strategy.append(p("————————Accessory(Just wear 9 pieces if you don't have most of them)————————", "divide"));
	
	for (var c in category){
		var name = category[c];
		if(name.indexOf("Accessory")<0)
			continue;
		if (result[name]) {
			var categoryContent = p(getstrClothes(result[name]), "clothes", name, "clothes_category");
			if (isGrey(name,result)) categoryContent.addClass("stgy_grey");
			$strategy.append(categoryContent);
		}
	}

	$author_sign = $("<div/>").addClass("stgy_author_sign_div");
	var d = new Date();
	$author_sign.append(p("nikkiup2u3 One Key Strategy@Black Sublimation", "author_sign_name"));
	$author_sign.append(p("generate in " + (1900+d.getYear()) + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes(), "author_sign_name"));
	$strategy.append($author_sign);
	
	$("#StrategyInfo").empty().append($strategy);
}

function byActScore(a, b) {
	return actScore(a) - actScore(b) == 0 ? a.id - b.id : actScore(b) - actScore(a);
}

function p(text, cls, text2, cls2){
	var $p = $("<p/>").text(text).addClass("stgy_" + cls);
	if(text2){
		$p.prepend($("<span/>").text(text2).addClass("stgy_" + cls2));
	}
	return $p;
}

function ifCriteriaHighLow(theme){
	var a,b,c,d,e;
	theme.weight["simple"] >= 0 ? a = theme.weight["simple"] : a = -theme.weight["simple"];
	theme.weight["cute"] >= 0 ? b = theme.weight["cute"] : b = -theme.weight["cute"];
	theme.weight["active"] >= 0 ? c = theme.weight["active"] : c = -theme.weight["active"];
	theme.weight["pure"] >= 0 ? d = theme.weight["pure"] : d = -theme.weight["pure"];
	theme.weight["cool"] >= 0 ? e = theme.weight["cool"] : e = -theme.weight["cool"];
	var avg = (a+b+c+d+e)/5;
	var fangcha = (avg-a)*(avg-a) + (avg-b)*(avg-b) + (avg-c)*(avg-c) + (avg-d)*(avg-d) + (avg-e)*(avg-e);
}

function getStrCriteria(filters){
	var strCriteria = "";
	filters["simple"] >= 0 ? strCriteria += "Simple" : strCriteria += "Gorgeous";
	strCriteria += " : ";
	filters["cute"] >= 0 ? strCriteria += "Cute" : strCriteria += "Mature";
	strCriteria += " : ";
	filters["active"] >= 0 ? strCriteria += "Lively" : strCriteria += "Elegant";
	strCriteria += " : ";
	filters["pure"] >= 0 ? strCriteria += "Pure" : strCriteria += "Sexy";
	strCriteria += " : ";
	filters["cool"] >= 0 ? strCriteria += "Cool" : strCriteria += "Warm";
	strCriteria += " ≈ ";
	filters["simple"] >= 0 ? strCriteria += filters["simple"] : strCriteria += -filters["simple"];
	strCriteria += " : ";
	filters["cute"] >= 0 ? strCriteria += filters["cute"] : strCriteria += -filters["cute"];
	strCriteria += " : ";
	filters["active"] >= 0 ? strCriteria += filters["active"] : strCriteria += -filters["active"];
	strCriteria += " : ";
	filters["pure"] >= 0 ? strCriteria += filters["pure"] : strCriteria += -filters["pure"];
	strCriteria += " : ";
	filters["cool"] >= 0 ? strCriteria += filters["cool"] : strCriteria += -filters["cool"];
	
	return strCriteria;
}

function getstrTag(filters){
	var str = "";
	
	if(filters.bonus && filters.bonus[0] && filters.bonus[0].tagWhitelist){
		str+="This stage requires TAG[" + filters.bonus[0].tagWhitelist + "]，bonus ~" + filters.bonus[0].param;
		if(filters.bonus[1] && filters.bonus[1].tagWhitelist){
			str+="，TAG[" + filters.bonus[1].tagWhitelist + "], bonus added ~" + filters.bonus[1].param;
		}
	}
	return str;
}

function getstrClothes(result){
	if(result == null || result.length == 0)
		return " : 无";
	var str = " :";
	var max = 5;
	for(var i in result){
		if(max > 0){
			str += " " + result[i].name + "「" + actScore(result[i]) + " " + removeNum(result[i].source) + "」" + ">";		
			max--;
		}
		else if(result[i].source.indexOf("少") >=0 || result[i].source.indexOf("公") >= 0 || result[i].source.indexOf("店") >= 0 || result[i].source.indexOf("送") >= 0 ){
			str += "> " + result[i].name + "「" + actScore(result[i]) + " " + removeNum(result[i].source) + "」" + " ";
			break;
		}
	}
	 return str.slice(0, str.length-1);
}

function removeNum(str){
	if(str.indexOf("定")>=0 || str.indexOf("进")>=0)
		str = str.replace(/[0-9]/g,"");
	str = str.replace("联盟小铺", "盟").replace("设计图", "设").replace("元素重构", "重构").replace("评选赛商店", "评选赛").replace("活动·", "");
	return str;
}

function actScore(obj){
	return (obj.type.mainType=='Accessory'&&!uiFilter["toulan"]) ? (uiFilter["acc9"] ? Math.round(accSumScore(obj,9)) : Math.round(accSumScore(obj,accCateNum))) : obj.sumScore;
}

function isGrey(c,result){
	for (var i in repelCates){
		var sumFirst=0;
		var sumOthers=0;
		if($.inArray(c, repelCates[i])>=0){
			for (var j in repelCates[i]){
				if (j>0) {
					if (result[repelCates[i][j]]&&result[repelCates[i][j]][0]) sumOthers+=actScore(result[repelCates[i][j]][0]);
				}else {
					if (result[repelCates[i][j]]&&result[repelCates[i][j]][0]) sumFirst+=actScore(result[repelCates[i][j]][0]);
				}
			}
			if($.inArray(c, repelCates[i])==0){
				if (sumFirst<sumOthers) return true;
			}else if($.inArray(c, repelCates[i])>0){
				if (sumOthers<sumFirst) return true;
			}
		}
	}
	return false;
}

function initOnekey(){
	$("#onekey").click(function() {
		showStrategy();
	});
}