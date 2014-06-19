//引用依赖
var webSite = require('./websiteurl');
var seeker = require('./seeker');
var async = require('async');
var later = require('later');


//数据请求
async.eachLimit(webSite, 1, function (website, next){
    seeker.urlReq(website);
    next();
});

//定时器处理
later.date.localTime();
var sched = {
    schedules : [
        {h: [5], m: [15]},
        {h: [21], m: [47]}
    ]
};
var t = later.setInterval(function() {
    console.log('开始工作啦');
    async.eachLimit(webSite, 1, function (website, next){
        seeker.urlReq(website);
        next();
    });
}, sched);