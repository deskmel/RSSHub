const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const iconv = require('iconv-lite');

const urlRoot = 'https://acm.sjtu.edu.cn/OnlineJudge/';

const transcode = (buffer) => {
    const data = iconv.decode(buffer, 'gb2312');
    return cheerio.load(data);
};

module.exports =  async (ctx) => {
	const name =  encodeURIComponent(ctx.params.name || "吴克");
	const realLink = urlRoot+"status?owner="+name+"&problem=&language=0&verdict=0";
	const response = await got({
    	method: 'get',
    	url: realLink,
    	responseType: 'buffer',
	});
	
	const $ = transcode(response.data);
	const out = await Promise.all(
		$('tbody')
		.find('tr')
		.slice(0,10)
		.map(async (i, e) => {
                const title = 'problem '+$(e).find('td').eq(2).find('a').text();
                const link = $(e).find('td').eq(2).find('a').attr('href');
                const single = {
                	title,
                	link,
                };
                return Promise.resolve(single);
            }).get()

		);
	ctx.state.data = {
	title: decodeURIComponent(name) + '大神又做题啦',
        link: realLink,
        item: out,
	};

};
