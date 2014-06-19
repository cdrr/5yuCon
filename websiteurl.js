/*
* 网站url以及采取的抓取方式
* */
//var coolshellitem = {
//    title : $('.post h2').text(),
//    time :  $('.post .info .date').text(),
//    author :  $('.post .author').text(),
//    content :  $('.post .content').text()
//};
 var website = [{websiteName : '酷壳', websiteUrl : 'http://coolshell.cn/',updataList : [], condom: '#recent-posts-2 a'},
    {websiteName : '阮一峰的网络日志', websiteUrl : 'http://www.ruanyifeng.com/blog/nav/index1.html',updataList : [],
     condom: '.entry-header a'},
     {websiteName : '鑫空间鑫生活', websiteUrl : 'http://www.zhangxinxu.com/wordpress/',updataList : [],
         condom: '#recent-posts-3 a'},
     {websiteName : '墨落格', websiteUrl : 'http://molog.net/',updataList : [],
         condom: '.post-title a'},
     {websiteName : '粉丝日志', websiteUrl : 'http://blog.fens.me/',updataList : [],
         condom: '#widget_recent_entries a'},
     {websiteName : '三斗室', websiteUrl : 'http://chenlinux.com',updataList : [],
         condom: '.entry-title a'},
     {websiteName : 'WebShell', websiteUrl : 'http://www.webshell.cc/',updataList : [],
         condom: '#recent-posts-2 a'}
    ];
module.exports = website;