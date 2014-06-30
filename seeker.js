/*
* 抓取内容，以及解析存入数据库
* */
var request = require('superagent');
var cheerio = require('cheerio');
var async = require('async');
var Q = require('q');

//数据库部分
var myDb = require('./mydb');
var newlistModel = myDb.newlistModel();
var textModel =myDb.textModel();
//连接数据库
myDb.connect();

//请求获得更新列表
function urlReq (website) {
    request.get(website['websiteUrl'])
           .timeout(50000)
           .on('error', function (error) {
                console.log(error);
           })
           .end(function(data){
                parser (website, data);
           });
}

//解析html
function parser (website, data) {

    //从数据库获取最新列表
    function newlistGet (website) {
        var deferred = Q.defer();
        var newList = [];
        newlistModel.findOne({ website: website['websiteName']}, 'list', function (err, docs) {
            if (err) {console.log(err); }
            if(docs) {
                for(var i = 0; i < docs['list'].length; i++){
                    newList.push(docs['list'][i]['name']);
                }
            }
            deferred.resolve(newList);
        });
        return deferred.promise;
    }

    //循环title对比最新列表
    function articlelistGet(website, newList){
        var $ = cheerio.load(data.text);
        var deferred = Q.defer();
        //定义更新列表
        var articleList = [];
        $(website['condom']).each(function (i) {
            //检查链接是否绝对地址
            var titleUrl = '';
            if($(this).attr('href').indexOf('http') == -1){
                titleUrl = website['websiteUrl'] + $(this).attr('href');
            }
            else{
                titleUrl = $(this).attr('href');
            }
            var item = {
                website:website['websiteName'],
                name : $(this).text(),
                url : titleUrl
            };
            if(newList.indexOf(item.name) == '-1'){
                articleList.push(item);
            }
        });
        deferred.resolve(articleList);
        return deferred.promise;
    }

    //得到解析内容列表，内容循环写入数据库
    function conGet (website, articleList){
        //定义错误列表
        var errorList = [];
        if(articleList.length > 0){
            //分别抓取内容
            async.eachLimit(articleList, 5,
                function (article, callback){
                    parserArticle (website, article ,errorList, callback);
                    //callback();
                },
                function(error){
                    if(error){
                        console.log(error);
                    }else{
                        //删除未完成数组
                        if(errorList.length > 0){
                            for(var i = 0; i < errorList.length; i++){
                                for(var j = 0; j < articleList.length; j++){
                                    if(errorList[i] = articleList[j]['name']){
                                        articleList.splice(j,1);
                                        break;
                                    }
                                }
                            }
                        }
                        console.log(errorList);
                        //更新列表存入数据库
                        var conditions = {website : website['websiteName']};
                        var update     = {$set : {list : articleList}};
                        var options    = {upsert : true};
                        newlistModel.update(conditions, update, options, function(error){
                            if(error){
                                console.log(error);
                            }else{
                                console.log('更新成功');
                            }
                        });
                    }
                });
        }
    }

    //promise流程控制
    newlistGet(website).then(function (newList) {
        articlelistGet(website, newList).then(function (articleList){
            conGet (website, articleList);
        })
    });
}

//获取具体内容
function parserArticle (website, list, errorList, callback){
    request.get(list.url)
        .timeout(10000)
        .on('error', function (error) {
            //删除获取失败的title
            errorList.push(list.name);
            callback();
        })
        .end(function(data){
            var $ = cheerio.load(data.text);
            switch (website['websiteName']){
                case '酷壳':
                    var item = {
                        site: '酷壳',
                        title : $('.post h2').text(),
                        time :  $('.post .info .date').text(),
                        author :  $('.post .author').text(),
                        content : $('.post .content').html(),
                        link: list.url
                    };

                    break;
                case '鑫空间鑫生活':
                    $('.entry > p').first().remove();
                    $('.entry .alipay_support').nextAll().remove();
                    var item = {
                        site: '鑫空间鑫生活',
                        title : $('#content h2').text(),
                        time :  $('.post .info .date').text(),
                        author :  'zhangxinxu',
                        content : $('.entry').html(),
                        link: list.url
                    };

                    break;
                case '墨落格':
                    var item = {
                        site: '墨落格',
                        title : $('.post-title a').text(),
                        time :  $('.published').text(),
                        author : $('.author a').text(),
                        content :  $('.post-content').html(),
                        link: list.url
                    };

                    break;
                case '粉丝日志':
                    var item = {
                        site: '粉丝日志',
                        title : $('.p-cont > h2').text(),
                        time :  $('.date').text(),
                        author : '张丹',
                        content :  $('.entry').html(),
                        link: list.url
                    };

                    break;
                case '阮一峰的网络日志':
                    var item = {
                        site: '阮一峰的网络日志',
                        title : $('#page-title').text(),
                        time :  $('.asset-footer .published').text(),
                        author :  '阮一峰',
                        content :  $('#main-content').html(),
                        link:list.url
                    };

                    break;
                case '三斗室':
                    $('.pagination').nextAll().remove();
                    $('.pagination').remove();
                    var item = {
                        site: '三斗室',
                        title : $('h1').text(),
                        time :  $('.date > span').text(),
                        author :  'ARGV',
                        content : $('.page-header').next().html(),
                        link:list.url
                    };

                    break;
                case 'WebShell':
                    var item = {
                        site: 'WebShell',
                        title : $('.storytitle > a').text(),
                        time :  '',
                        author :  'WebShell',
                        content :  $('.storycontent').html(),
                        link:list.url
                    };

                    break;
                default :
                    console.log('未找到对应网站');
            }
            var textEntity = new textModel(item);
            textEntity.save();
            callback();
        });
}

exports.urlReq = urlReq;